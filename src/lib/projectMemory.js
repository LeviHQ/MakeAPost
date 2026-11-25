/**
 * MakeAPost — Auto-Learned Project Memory Utilities
 * Maintains up to 5 most recently updated projects per user, each capped at
 * 300 characters, sorted latest-first for zero-extra-token AI continuity.
 */

export const MAX_PROJECTS = 5;
export const MAX_SUMMARY_CHARS = 300;
export const MAX_NAME_CHARS = 60;

/**
 * Normalizes a project name into a lowercase alphanumeric slug so
 * variations like "Mail Karo" and "MailKaro" map to the same project.
 * @param {string} name
 * @returns {string}
 */
export function normalizeProjectSlug(name = '') {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Clamps a project summary strictly to 300 characters.
 * @param {string} summary
 * @returns {string}
 */
export function clampProjectSummary(summary = '') {
  const clean = String(summary || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= MAX_SUMMARY_CHARS) return clean;
  return clean.slice(0, MAX_SUMMARY_CHARS).trim();
}

/**
 * Sanitizes, sorts (latest-first by updatedAt), and caps a projects array to 5 items.
 * @param {Array} rawProjects
 * @returns {Array<{ slug: string, name: string, summary: string, updatedAt: string }>}
 */
export function sanitizeProjectsList(rawProjects) {
  if (!Array.isArray(rawProjects)) return [];

  const seen = new Map();
  for (const item of rawProjects) {
    if (!item || typeof item !== 'object') continue;
    const rawName = String(item.name || '').trim().slice(0, MAX_NAME_CHARS);
    const slug = normalizeProjectSlug(item.slug || rawName);
    const summary = clampProjectSummary(item.summary || '');
    if (!slug || !rawName || !summary) continue;

    const updatedAt = item.updatedAt && !Number.isNaN(Date.parse(item.updatedAt))
      ? new Date(item.updatedAt).toISOString()
      : new Date(0).toISOString();

    const existing = seen.get(slug);
    if (!existing || Date.parse(updatedAt) > Date.parse(existing.updatedAt)) {
      seen.set(slug, { slug, name: rawName, summary, updatedAt });
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, MAX_PROJECTS);
}

/**
 * Upserts a project into the user's memory list, updates updatedAt,
 * sorts latest-first (index 0 = most recent), and caps at 5 projects.
 */
export function upsertProjectMemory(existingProjects, projectMemory) {
  const sanitized = sanitizeProjectsList(existingProjects);
  if (!projectMemory || typeof projectMemory !== 'object') return sanitized;

  const cleanName = String(projectMemory.name || '').trim().slice(0, MAX_NAME_CHARS);
  const slug = normalizeProjectSlug(cleanName);
  const summary = clampProjectSummary(projectMemory.summary || '');

  if (!slug || !cleanName || !summary) return sanitized;

  const nowIso = new Date().toISOString();
  const filtered = sanitized.filter((p) => p.slug !== slug);

  const updated = [
    {
      slug,
      name: cleanName,
      summary,
      updatedAt: nowIso,
    },
    ...filtered,
  ];

  return updated.slice(0, MAX_PROJECTS);
}

/**
 * Builds an ultra-compact (< 80 tokens) project context string for Gemini
 * by matching any saved project name/slug in the user's prompt, or falling back
 * to the latest active project's 300-char summary + known project names.
 */
export function buildCompactProjectContext(rawProjects, userPrompt = '') {
  const projects = sanitizeProjectsList(rawProjects);
  if (projects.length === 0) return '';

  const normalizedPrompt = normalizeProjectSlug(userPrompt);
  const explicitMatch =
    normalizedPrompt &&
    projects.find(
      (p) =>
        normalizedPrompt.includes(p.slug) ||
        userPrompt.toLowerCase().includes(p.name.toLowerCase())
    );

  const knownNames = projects.map((p) => p.name).join(', ');
  if (explicitMatch) {
    return `\nKnown User Projects: ${knownNames}\nMatched Project (${explicitMatch.name}): ${explicitMatch.summary}`;
  }

  const latest = projects[0];
  return `\nKnown User Projects: ${knownNames}\nMost Recent Project (${latest.name} — apply ONLY if this screenshot/prompt is also about ${latest.name}): ${latest.summary}`;
}
