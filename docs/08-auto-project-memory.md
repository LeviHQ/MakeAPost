# Documentation: Auto-Learned Project Memory (`supabase/user_projects.sql` & `src/lib/projectMemory.js`)

## 1. Overview & Zero-Extra-Token Architecture
MakeAPost remembers concise product/project context across sessions **without storing any post history, chat logs, or screenshots**, and **without making a second AI API call**. Every AI post generation call extracts and updates project context in the same single-shot JSON response.

---

## 2. Database Schema (`supabase/user_projects.sql` & `supabase/schema.sql`)
- Column added to `public.users`:
  ```sql
  projects jsonb not null default '[]'::jsonb
  ```
- Stores a maximum of **5 most recently updated projects** per user:
  ```json
  [
    {
      "slug": "mailkaro",
      "name": "MailKaro",
      "summary": "Cold email SaaS for indie founders. Crossed $18.4K MRR with 2.1% churn via programmatic SEO and Day-1 onboarding tooltips.",
      "updatedAt": "2026-11-25T09:20:00.000Z"
    }
  ]
  ```
- Strictly capped at **300 characters** per `summary` and **5 projects** total per user.
- Protected by PostgreSQL Row Level Security (`auth.uid() = id`).

---

## 3. Slug Deduplication & Latest-First Sorting (`src/lib/projectMemory.js`)
- **`normalizeProjectSlug(name)`:** Strips non-alphanumeric characters and lowercases (`"Mail Karo"` and `"MailKaro"` both normalize to `"mailkaro"`), preventing duplicate entries.
- **`clampProjectSummary(summary)`:** Collapses extra whitespace and caps strictly at `300` characters (`MAX_SUMMARY_CHARS`).
- **`upsertProjectMemory(existingProjects, projectMemory)`:**
  - Replaces any existing entry matching the normalized `slug` or inserts a new entry.
  - Updates `updatedAt` to the current ISO timestamp.
  - Sorts descending by `updatedAt` so the **latest updated project is always at index `0`**.
  - Slices to `MAX_PROJECTS = 5`.
- **Single-Call Input Budget (`buildCompactProjectContext`):**
  - Matches any saved project whose `name` or `slug` appears in the user's prompt (or defaults to index `0`, the latest active project).
  - Injects only the list of known project names + that single matched project's `<= 300`-char summary (~60–80 tokens total).

---

## 4. Single-Call Gemini Extraction (`src/app/api/generate/route.js`)
- `responseSchema` includes an optional/nullable `projectMemory: { name, summary }` field alongside the requested platform post(s).
- If the screenshot or prompt clearly references a specific software product, startup, or ongoing series, Gemini returns `projectMemory` combining existing facts with the new milestone in `<= 300` chars.
- For generic one-off posts with no identifiable project, Gemini returns `projectMemory: null`.
- When non-null, `/api/generate` upserts and persists `updatedProjects` to `public.users` and returns `projects` in the JSON response.

---

## 5. Settings Management API & UI (`src/app/api/projects/route.js` & `src/app/settings/page.js`)
- **API Route (`/api/projects`):**
  - `GET`: Returns authenticated user's sanitized, latest-first `projects` array.
  - `PATCH`: Updates a project's `name` and `summary` (clamped to 300 chars), refreshes `updatedAt`, re-sorts latest-first, and persists to `public.users`.
  - `DELETE`: Removes a project by `slug` (query param or JSON body) and returns updated list.
- **Settings UI (`/settings` — `Auto-Learned Project Context`):**
  - Displays saved projects ordered **latest updated first** with a yellow `"LATEST"` badge on index `0`.
  - Shows project name, formatted `updatedAt` timestamp, live character counter (`X / 300`), inline **Edit** (Save/Cancel), and **Delete** buttons.
  - Displays the privacy helper note: *"MakeAPost automatically remembers up to 300 characters per project as you generate posts—zero post history is ever stored."*
