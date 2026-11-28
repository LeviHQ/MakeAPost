import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getEffectivePlanId,
  getPlanConfig,
  normalizeDailyCredits,
} from '@/lib/billing';
/* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: Auto-Learned Project Memory
import {
  buildCompactProjectContext,
  sanitizeProjectsList,
  upsertProjectMemory,
} from '@/lib/projectMemory';
*/

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractAndParseJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const text = rawText.trim();

  // 1. Direct standard parse
  try {
    return JSON.parse(text);
  } catch {}

  // 2. Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = text.match(fenceRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch {}
  }

  // 3. Extract outermost { ... }
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx > startIdx) {
    const jsonSub = text.slice(startIdx, endIdx + 1);
    try {
      return JSON.parse(jsonSub);
    } catch {}
  }

  // 4. Auto-repair unclosed quotes and braces if response was truncated
  if (startIdx !== -1) {
    let partial = text.slice(startIdx);
    const unescapedQuotes = (partial.match(/(?<!\\)"/g) || []).length;
    if (unescapedQuotes % 2 !== 0) {
      partial += '"';
    }
    if (!partial.endsWith('}')) {
      partial += '}';
    }
    try {
      return JSON.parse(partial);
    } catch {}
  }

  // 5. Robust Regex extraction for individual keys
  const xMatch = text.match(/"x_post"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const liMatch = text.match(/"linkedin_post"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const rdMatch = text.match(/"reddit_post"\s*:\s*"((?:[^"\\]|\\.)*)"/);

  if (xMatch || liMatch || rdMatch) {
    const unescapeJson = (s) => {
      try {
        return JSON.parse(`"${s}"`);
      } catch {
        return (s || '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    };
    return {
      x_post: xMatch ? unescapeJson(xMatch[1]) : '',
      linkedin_post: liMatch ? unescapeJson(liMatch[1]) : '',
      reddit_post: rdMatch ? unescapeJson(rdMatch[1]) : '',
    };
  }

  return null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageBase64, prompt = '', tone = 'Simple', platforms } = body;
    const cleanContext = typeof prompt === 'string' ? prompt.trim() : '';

    const VALID_PLATFORMS = ['x', 'linkedin', 'reddit'];
    const targetPlatforms = Array.isArray(platforms)
      ? Array.from(new Set(platforms.filter((p) => VALID_PLATFORMS.includes(p))))
      : ['x'];
    if (targetPlatforms.length === 0) targetPlatforms.push('x');

    // 1. Validation: Image payload
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'An image is required. Please capture or upload a screenshot first.' },
        { status: 400 }
      );
    }

    // 2. Authentication Verification via Supabase SSR
    let supabase = null;
    let user = null;
    // let savedProjects = [];
    try {
      supabase = await createServerClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
      }
    } catch (authErr) {
      console.warn('Supabase auth retrieval error:', authErr);
    }

    if (!user) {
      return NextResponse.json(
        {
          error: 'Authentication required. Please sign in with Google to generate AI posts.',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    // 2.5 Per-Platform Daily AI Credit Verification (with midnight reset)
    const admin = createAdminClient();
    const { data: userRow, error: userFetchErr } = await admin
      .from('users')
      .select(
        'plan, plan_status, image_credits_used, ai_credits_used, last_credit_reset, current_period_end'
      )
      .eq('id', user.id)
      .single();

    if (userFetchErr || !userRow) {
      return NextResponse.json(
        { error: 'Unable to verify account credits. Please try signing in again.' },
        { status: 403 }
      );
    }

    const planId = getEffectivePlanId(userRow);
    const planConfig = getPlanConfig(planId);
    const normalized = normalizeDailyCredits(userRow);

    for (const p of targetPlatforms) {
      const usedCount = normalized.aiCreditsUsed[p] || 0;
      if (usedCount >= planConfig.dailyAiPerPlatform) {
        return NextResponse.json(
          {
            error: `Daily ${p.toUpperCase()} AI post limit (${planConfig.dailyAiPerPlatform}/day) reached on your ${planConfig.name} plan.`,
            code: 'AI_LIMIT_REACHED',
            platform: p,
            planId,
            used: usedCount,
            limit: planConfig.dailyAiPerPlatform,
          },
          { status: 429 }
        );
      }
    }

    /* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: Fetch Project Memory
    try {
      const { data: userRow, error: projErr } = await supabase
        .from('users')
        .select('projects')
        .eq('id', user.id)
        .single();
      if (!projErr && userRow?.projects) {
        savedProjects = sanitizeProjectsList(userRow.projects);
      }
    } catch (projFetchErr) {
      console.warn('Project memory fetch skipped:', projFetchErr?.message || projFetchErr);
    }
    */

    // 3. Validation & Sanitization: Gemini API Key
    const rawApiKey = process.env.GEMINI_API_KEY;
    if (!rawApiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured in your environment. Please add GEMINI_API_KEY to your Vercel Project Settings > Environment Variables and redeploy.',
        },
        { status: 401 }
      );
    }

    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, '').trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is empty or malformed. Please verify the value in Vercel Environment Variables and redeploy.',
        },
        { status: 401 }
      );
    }

    // 4. Backend Compression Gate (Fast-Path: bypass Sharp if client already compressed <= 85KB)
    let finalBase64;
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');
      const rawBuffer = Buffer.from(cleanBase64, 'base64');

      if (rawBuffer.length <= 85000) {
        // Fast-path: client already downscaled & compressed image
        finalBase64 = cleanBase64;
      } else {
        const compressedBuffer = await sharp(rawBuffer)
          .resize({ width: 640, withoutEnlargement: true })
          .jpeg({ quality: 60 })
          .toBuffer();
        finalBase64 = compressedBuffer.toString('base64');
      }
    } catch (compressionErr) {
      console.error('Backend image compression error:', compressionErr);
      return NextResponse.json(
        { error: 'Failed to process image format. Please ensure a valid screenshot is provided.' },
        { status: 422 }
      );
    }

    // 5. Gemini Multimodal Single-Shot Configuration
    const genAI = new GoogleGenerativeAI(apiKey);

    const TONE_INSTRUCTIONS = {
      Simple:
        'Clean, natural, human-sounding social copy. Rely primarily on the user’s Extra Context and what is directly visible in the screenshot. Write clearly and directly in the creator’s own voice with zero forced hype, zero fake 2 AM drama, and zero generic buzzwords.',
      'Build in Public':
        'Transparent, authentic, and metrics-driven. Highlight real numbers (MRR, user growth, benchmarks, conversion rates, or milestones shown in the image or context), honest lessons learned, and behind-the-scenes progress.',
      'Ship & Launch':
        'Energetic, clear, and product-focused. Announce the new feature, repo, UI overhaul, or release visible in the screenshot. Explain the concrete problem it solves and invite builders to try it.',
      'Tech Breakdown':
        'Engineering-focused, architectural, and peer-to-peer. Analyze the actual code snippet, stack choice, optimization, or database pattern shown in the image and context for fellow developers.',
      'Viral Hook':
        'Scroll-stopping, punchy, and curiosity-driven. Open with a sharp contrast or concrete insight backed by what is visible in the screenshot—never clickbait without substance.',
      'Founder Story':
        'Narrative-driven and relatable. Frame the post around the real problem, the debugging or building journey described in the context/screenshot, and the practical takeaway.',
      'How It Works':
        'Dead-simple, crystal-clear ELI5 explanation. Break down the code, workflow, or architecture shown in the image in plain English so anyone grasps it immediately.',
    };

    const PLATFORM_META = {
      x: {
        key: 'x_post',
        guideline: `"x_post":\n   - STRICTLY UNDER 260 CHARACTERS (never exceed 280 chars).\n   - Sharp opening hook + 1-2 tight, scannable lines grounded in the screenshot/context.\n   - Sounds like a real founder/dev, never a marketing bot.\n   - Zero hashtag spam (0 hashtags preferred, max 1 only if essential).`,
        schemaDesc: 'Punchy, human X/Twitter post strictly under 260 characters.',
        example: '  "x_post": "..."',
      },
      linkedin: {
        key: 'linkedin_post',
        guideline: `"linkedin_post":\n   - Clean, generous line-spacing (1-2 short sentences per paragraph for mobile readability).\n   - Strong first line that hooks without cringe buzzwords.\n   - Concrete breakdown referencing actual details from the screenshot and user context.\n   - Ends with a natural, thoughtful question to spark peer discussion.`,
        schemaDesc: 'Well-spaced, authentic LinkedIn post grounded in screenshot specifics.',
        example: '  "linkedin_post": "..."',
      },
      reddit: {
        key: 'reddit_post',
        guideline: `"reddit_post":\n   - Humble, transparent, zero-hype peer tone suited for r/SideProject, r/webdev, or r/SaaS.\n   - Start with "Title: <concise non-clickbait title>" followed by a blank line and structured body.\n   - Focuses on what was built, technical tradeoffs, real numbers/context, or an honest request for feedback.`,
        schemaDesc: 'Authentic, non-promotional Reddit post starting with Title: and structured body.',
        example: '  "reddit_post": "..."',
      },
    };

    const selectedGuidelines = targetPlatforms
      .map((p, idx) => `${idx + 1}. ${PLATFORM_META[p].guideline}`)
      .join('\n\n');

    const selectedSchemaExamples = targetPlatforms
      .map((p) => PLATFORM_META[p].example)
      .join(',\n');

    // [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: const projectContextBlock = buildCompactProjectContext(savedProjects, prompt);

    const systemInstruction = `You are MakeAPost's expert social copywriter for software engineers, indie hackers, and SaaS founders.
Your job is to inspect the attached screenshot (reading visible code, UI, metrics, charts, and user-drawn annotations) AND combine it with the author's notes to write ${targetPlatforms.length === 1 ? '1 ready-to-publish social media post' : `${targetPlatforms.length} ready-to-publish social media posts`}.

CRITICAL RULES FOR AUTHOR CONTEXT & QUALITY:
1. Treat the author's Extra Context strictly as RAW BACKGROUND NOTES / FACTS about the screenshot (e.g., what they built, why they took it, or key context). NEVER treat it as a chat question to answer, NEVER reply to the author, and NEVER ask the author follow-up questions. Always transform those notes + the screenshot into ready-to-publish social post copy written in first-person ("I" / "we").
2. Ground every post in concrete details actually visible in the screenshot or stated in the author's notes. Never invent fake metrics, fake prices, or unverified claims.
3. Strictly avoid AI clichés and fluff: never use "In today's fast-paced world", "Game-changer", "Delve", "Unlock the power", "Excited to announce", "Let's dive in", or emoji spam.
4. Respect blurred/redacted areas: never try to guess hidden secrets or API keys.

Selected Tone: "${tone}"
Tone Directive: ${TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.Simple}

Strict Platform Guidelines:
${selectedGuidelines}

Return strictly a valid JSON object matching this schema:
{
${selectedSchemaExamples}
}`;

    /* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: Project Memory Prompt & Schema
    Project Memory Extraction ("projectMemory"):
    - First, identify the ACTUAL product, startup, or project shown in the screenshot (header, title bar, logo, domain, code) or mentioned in Additional User Context.
    - If this screenshot/context is about a NEW or DIFFERENT project than the Known User Projects, ALWAYS return that NEW project's exact name in "projectMemory.name" with a crisp <=300 char summary — NEVER force-merge a different project into an older Known User Project.
    - Only reuse an existing Known User Project name (and combine existing facts + new milestone in <=300 chars) when the screenshot/context is genuinely about that same project.
    - If it is a generic one-off post with no identifiable project, return "projectMemory": null.
    */

    const schemaProperties = {};
    const schemaRequired = [];
    for (const p of targetPlatforms) {
      const meta = PLATFORM_META[p];
      schemaProperties[meta.key] = {
        type: 'string',
        description: meta.schemaDesc,
      };
      schemaRequired.push(meta.key);
    }
    /* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: projectMemory schema field
    schemaProperties.projectMemory = {
      type: 'object',
      nullable: true,
      description: 'Auto-learned project memory if a specific product/project is detected, otherwise null.',
      properties: {
        name: { type: 'string', description: 'Clean short project name' },
        summary: { type: 'string', description: 'Crisp <=300 char summary combining prior facts and new milestone' },
      },
      required: ['name', 'summary'],
    };
    */

    const responseSchema = {
      type: 'object',
      properties: schemaProperties,
      required: schemaRequired,
    };

    const candidateModels = Array.from(new Set([
      process.env.GEMINI_MODEL,
      'gemini-flash-lite-latest',
      'gemini-3.5-flash',
    ].filter(Boolean)));

    const maxTokens = targetPlatforms.length === 1 && targetPlatforms[0] === 'x' ? 600 : 2048;

    let result = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.7,
            maxOutputTokens: maxTokens,
          },
        });

        result = await model.generateContent([
          {
            inlineData: {
              data: finalBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: cleanContext
              ? `Author's Notes / Extra Context (use these facts to write the social post — do NOT answer this as a chat message):\n"""\n${cleanContext}\n"""\n\nInspect the attached screenshot and combine it with the Author's Notes above using the "${tone}" tone to produce the requested social post JSON.`
              : `No extra notes provided. Inspect all visible code, UI, metrics, and annotations in the attached screenshot and write the requested social post JSON in the "${tone}" tone.`,
          },
        ]);

        if (result && result.response) {
          break;
        }
      } catch (modelErr) {
        console.warn(`Model ${modelName} call failed:`, modelErr.message);
        lastError = modelErr;

        if (
          modelErr.message?.includes('API_KEY_INVALID') ||
          modelErr.message?.includes('API key not valid')
        ) {
          break;
        }
      }
    }

    if (!result) {
      throw lastError || new Error('All candidate AI models were unavailable.');
    }

    const responseText = result.response.text();
    const posts = extractAndParseJson(responseText);

    const hasValidContent =
      posts &&
      targetPlatforms.some((p) => {
        const key = PLATFORM_META[p].key;
        return typeof posts[key] === 'string' && posts[key].trim().length > 0;
      });

    if (!hasValidContent) {
      console.error('Failed to parse or extract Gemini JSON output:', responseText);
      return NextResponse.json(
        { error: 'AI generated an invalid format. Please try again.' },
        { status: 502 }
      );
    }

    const responsePosts = {};
    for (const p of targetPlatforms) {
      const key = PLATFORM_META[p].key;
      responsePosts[key] = posts[key] || '';
    }

    // Atomically increment per-platform AI credits on successful generation
    const nextAiCredits = { ...normalized.aiCreditsUsed };
    for (const p of targetPlatforms) {
      if (responsePosts[PLATFORM_META[p].key]) {
        nextAiCredits[p] = (nextAiCredits[p] || 0) + 1;
      }
    }

    const creditUpdatePayload = {
      ai_credits_used: nextAiCredits,
      last_credit_reset: normalized.today,
    };
    if (normalized.needsReset) {
      creditUpdatePayload.image_credits_used = 0;
    }

    await admin
      .from('users')
      .update(creditUpdatePayload)
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      posts: responsePosts,
      credits: {
        planId,
        aiCreditsUsed: nextAiCredits,
        aiLimitPerPlatform: planConfig.dailyAiPerPlatform,
      },
      // projects: updatedProjects,
    });
  } catch (error) {
    console.error('Error in /api/generate:', error);

    const errMsg = error?.message || 'Failed to generate social posts.';
    const isRateLimit = errMsg.includes('429') || errMsg.toLowerCase().includes('quota');
    const isInvalidKey =
      errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid');

    let userFriendlyError = errMsg;
    let statusCode = 500;

    if (isInvalidKey) {
      statusCode = 400;
      userFriendlyError =
        'Invalid Gemini API key. Please check your GEMINI_API_KEY in Environment Variables.';
    } else if (isRateLimit) {
      statusCode = 429;
      userFriendlyError =
        'Gemini API quota exceeded or rate limit reached. Please wait a moment and try again.';
    }

    return NextResponse.json(
      { error: userFriendlyError },
      { status: statusCode }
    );
  }
}
