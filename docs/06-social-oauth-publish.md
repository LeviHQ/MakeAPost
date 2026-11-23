# 06 — Direct 1-Click Social Publishing (LinkedIn & X) & OAuth 2.0 Security

> Comprehensive documentation for MakeAPost's social account connection, AES-256-GCM token encryption, PKCE authentication, and direct 1-click publishing architecture.

---

## 1. Architecture & Privacy Guarantees

MakeAPost enables creators to publish screenshots and AI-crafted copy directly to their personal social media profiles without leaving the studio:
1. **Explicit User-Action Only:** Accounts are never accessed in the background. API calls to social platforms are dispatched **strictly** when the user clicks `"🚀 Publish Now to [Platform]"`.
2. **Zero Storage of Post Copy or Images:** Screenshots and post texts are processed ephemerally in browser memory and passed directly to external APIs (LinkedIn Images API and X Media Upload). No image assets or generated post text are saved in our database.
3. **AES-256-GCM Token Encryption:** OAuth 2.0 access and refresh tokens are encrypted at rest using an AES-256-GCM cipher with a unique 96-bit IV and 128-bit authentication tag before being saved in Supabase PostgreSQL.
4. **Client Token Isolation:** Raw or encrypted tokens are **never exposed** to client-side queries. The browser only queries `/api/connect/status` to determine connection state and account usernames.

---

## 2. Database Schema (`supabase/social_connections.sql`)

```sql
create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('x', 'linkedin')),
  platform_user_id text,
  platform_username text,
  access_token_enc text not null,
  refresh_token_enc text,
  expires_at timestamptz,
  updated_at timestamptz default now(),
  constraint social_connections_user_platform_key unique (user_id, platform)
);

-- Row Level Security (RLS)
alter table public.social_connections enable row level security;

-- Authenticated users can view their own connections
create policy "Users can view own social connections"
  on public.social_connections for select to authenticated
  using (auth.uid() = user_id);

-- Authenticated users can delete (disconnect) their own connections
create policy "Users can delete own social connections"
  on public.social_connections for delete to authenticated
  using (auth.uid() = user_id);
```

---

## 3. Server-Side Token Encryption (`src/lib/crypto.js`)

Tokens are encrypted using Node.js native `crypto` with `aes-256-gcm`:
- **Key Derivation:** Derived from `process.env.TOKEN_ENCRYPTION_KEY` (guaranteed 32 bytes).
- **Format:** `iv:authTag:encryptedContent` in hex.
- **Functions:**
  - `encryptToken(plainText)`: Generates a random 12-byte IV, encrypts the token, and computes the authentication tag.
  - `decryptToken(cipherText)`: Splits the string, sets the auth tag, decipher-verifies integrity, and returns plaintext.

---

## 4. OAuth 2.0 Connection Lifecycle

### 4.1. LinkedIn OAuth 2.0
1. **Initiation (`/api/connect/linkedin`):**
   - Verified Supabase user.
   - Generates random `state` stored in an HTTP-only SameSite=Lax cookie.
   - Scopes: `openid profile w_member_social`.
   - Redirects to `https://www.linkedin.com/oauth/v2/authorization`.
2. **Callback (`/api/connect/linkedin/callback`):**
   - Verifies `state` match against cookie.
   - Exchanges `code` at `https://www.linkedin.com/oauth/v2/accessToken`.
   - Queries `https://api.linkedin.com/v2/userinfo` to obtain `sub` (person ID) and `name`.
   - Encrypts tokens and upserts record into `public.social_connections`.
   - Redirects to `/settings?connected=linkedin`.

### 4.2. X (Twitter) OAuth 2.0 with PKCE
1. **Initiation (`/api/connect/x`):**
   - Verified Supabase user.
   - Generates `state` and 32-byte PKCE `code_verifier` (base64url).
   - Computes `code_challenge` via SHA-256 (`S256`).
   - Stores `state` and `code_verifier` in HTTP-only cookies.
   - Scopes: `tweet.read tweet.write users.read media.write offline.access`.
   - Redirects to `https://x.com/i/oauth2/authorize`.
2. **Callback (`/api/connect/x/callback`):**
   - Verifies `state` and reads `code_verifier`.
   - Exchanges code at `https://api.x.com/2/oauth2/token` using Basic Auth header (`X_CLIENT_ID:X_CLIENT_SECRET`).
   - Queries `https://api.x.com/2/users/me` for profile ID and `@username`.
   - Encrypts `access_token` and `refresh_token` and upserts into database.
   - Redirects to `/settings?connected=x`.

### 4.3. Disconnect (`/api/connect/[platform]/disconnect`)
- Deletes user's connection row from `public.social_connections`.
- Immediate token invalidation from our database.

---

## 5. Direct 1-Click Publishing (`/api/publish/[platform]`)

Route: `POST /api/publish/[platform]` (`x` or `linkedin`)

### Request Body:
```json
{
  "text": "Check out this screenshot from MakeAPost!",
  "imageBase64": "data:image/png;base64,..."
}
```

### Execution Flow:
1. **Authentication:** Verifies Supabase session cookie.
2. **Token Fetch & Auto-Refresh:**
   - Decrypts access token.
   - For X: checks `expires_at`. If expired, exchanges `refresh_token` at `https://api.x.com/2/oauth2/token` and persists new encrypted tokens.
3. **Media Upload:**
   - **LinkedIn:** Calls `https://api.linkedin.com/rest/images?action=initializeUpload` to get `uploadUrl` and URN (`urn:li:image:...`), then PUTs binary image buffer (with fallback to `/v2/assets?action=registerUpload`).
   - **X (Twitter):** Uploads multipart binary PNG to `https://upload.twitter.com/1.1/media/upload.json` (or `https://api.x.com/2/media/upload`) with Bearer token.
4. **Post Creation:**
   - **LinkedIn:** POST to `https://api.linkedin.com/rest/posts` with `author: urn:li:person:<id>` and image media URN.
   - **X:** POST to `https://api.x.com/2/tweets` with `{ text, media: { media_ids: [mediaId] } }`.
5. **Response:**
   - Returns `{ success: true, postUrl: "https://..." }`.
   - Frontend displays **"✓ Published to [Platform]!"** banner with a clickable **"View Live Post ↗"** button.

---

## 6. Reddit Status
Reddit direct 1-click publishing is flagged as **"Coming Soon"**:
- AI post generation and Markdown formatting for Reddit remain 100% active.
- Studio provides an instant `"Copy Post"` button.
- A distinctive Neobrutalist `"Direct Publish — Coming Soon"` badge is rendered in both Settings and Studio.
