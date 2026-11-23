import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageBase64, prompt = '', tone = 'Build in Public' } = body;

    // 1. Validation: Image payload
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'An image is required. Please capture or upload a screenshot first.' },
        { status: 400 }
      );
    }

    // 2. Authentication Verification via Supabase SSR
    let user = null;
    try {
      const supabase = await createServerClient();
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

    // 4. Backend Compression Gate (Sharp: 640px max width, 60% JPEG)
    // Ensures visual data fits inside 1 single minimal vision token tile
    let finalBase64;
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');
      const rawBuffer = Buffer.from(cleanBase64, 'base64');

      const compressedBuffer = await sharp(rawBuffer)
        .resize({ width: 640, withoutEnlargement: true })
        .jpeg({ quality: 60 })
        .toBuffer();

      finalBase64 = compressedBuffer.toString('base64');
    } catch (compressionErr) {
      console.error('Backend image compression error:', compressionErr);
      return NextResponse.json(
        { error: 'Failed to process image format. Please ensure a valid screenshot is provided.' },
        { status: 422 }
      );
    }

    // 5. Gemini Multimodal Single-Shot Configuration
    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstruction = `You are MakeAPost's viral social strategist and technical copywriter for builders, SaaS founders, and creators.
Your task is to analyze the provided screenshot (reading all visible code, UI components, metrics, charts, and user-drawn highlight annotations) and generate 3 tailored social media posts in a single shot.

Selected Tone: "${tone}"
${prompt ? `Additional User Context: "${prompt}"` : ''}

Strict Platform Guidelines:
1. "x_post":
   - STRICTLY UNDER 280 CHARACTERS.
   - High-curiosity opening hook, punchy short sentences.
   - Speaks directly to developers, founders, or creators.
   - Minimal to zero hashtags (at most one #buildinpublic if relevant, never spam).

2. "linkedin_post":
   - Clean, generous line-spacing (1-2 sentences per line break for smooth mobile readability).
   - Scroll-stopping first sentence.
   - Authentic breakdown of the problem, number, or lesson shown in the image.
   - Concludes with a brief, engaging question to invite comments.

3. "reddit_post":
   - Authentic, humble, anti-marketing tone.
   - Formatted in Markdown with an intriguing title and structured body for tech subreddits (r/webdev, r/SaaS, r/SideProject, r/startups).
   - Focuses on architecture, learnings, challenges, or asking feedback from fellow builders.

Return strictly a valid JSON object matching this schema:
{
  "x_post": "...",
  "linkedin_post": "...",
  "reddit_post": "..."
}`;

    const responseSchema = {
      type: 'object',
      properties: {
        x_post: {
          type: 'string',
          description: 'Punchy X/Twitter post strictly under 280 characters without cringe hashtags.',
        },
        linkedin_post: {
          type: 'string',
          description: 'Line-spaced, engaging LinkedIn post with a strong hook and clear takeaway.',
        },
        reddit_post: {
          type: 'string',
          description: 'Authentic community-friendly Reddit post in markdown format.',
        },
      },
      required: ['x_post', 'linkedin_post', 'reddit_post'],
    };

    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
    ].filter(Boolean);

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
            text: `Analyze this screenshot according to the "${tone}" tone. Extract all key insights, code, UI text, or metrics, and generate the tailored posts.`,
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
    let posts;

    try {
      posts = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output:', responseText);
      return NextResponse.json(
        { error: 'AI generated an invalid format. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      posts: {
        x_post: posts.x_post || '',
        linkedin_post: posts.linkedin_post || '',
        reddit_post: posts.reddit_post || '',
      },
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
