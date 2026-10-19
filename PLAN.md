# Plan: Rebuild & Redeploy AI News Hot Portal

## Goal
Reconstruct the AI News Hot project from the live Cloudflare Pages site, initialize a git repo under `C:\Users\WaterZhong\REPOS-LOCAL\ai-host-news\`, and redeploy to Cloudflare Pages at `https://ai-news-hot.pages.dev`.

## Current State
- Wrangler CLI installed: v4.151.1
- Node.js available: v24.21.0
- Live site at `https://ai-news-hot.pages.dev` is serving HTML with inline JS
- API endpoint `https://ai-news-hot.pages.dev/api/news` returns news + `updated` timestamp
- **No local project repo exists** — the referenced OneDrive path (`C:/Users/Water_Zhong/OneDrive - EPAM/projects/REPOS-onedrive/local-test/ai-news-hot/`) does not exist
- `wrangler login` could not complete earlier (no browser in this terminal)

## Plan Steps

### Step 1: Create project directory structure
```
C:\Users\WaterZhong\REPOS-LOCAL\ai-host-news\
├── wrangler.toml
├── package.json
├── build.cjs              # Reads news-md/*.md → generates news-data.json
├── news-md/               # Source markdown news files
├── functions/
│   └── api/
│       └── news/
│           ├── [[id]].js  # API route for news CRUD
│           └── ...        # Other API routes
├── index.html             # Frontend (from live site)
├── _headers
└── _redirects
```

### Step 2: Reconstruct source files from live site
- Download `index.html` from `https://ai-news-hot.pages.dev/` (already saved at `C:\temp\ai-news-home.html`)
- Extract inline CSS/JS into proper assets or keep inline
- Create `functions/api/news/` routes matching the existing API behavior:
  - `GET /api/news?limit=N` → returns `{ news: [...], updated: ISO string }`
  - `POST /api/news` → creates news item (requires `X-API-Key: news-api-key-2026`)

### Step 3: Create build.cjs
- Read all `.md` files from `news-md/`
- Parse YAML frontmatter (title, date, tags, summary)
- Generate `news-data.json` for static fallback
- Output to `dist/` or public dir

### Step 4: Configure wrangler.toml
```toml
name = "ai-news-hot"
compatibility_date = "2026-01-01"
pages_build_output_dir = "dist"
[observability.enabled]
```

### Step 5: Initialize git repo
- `git init` in `C:\Users\WaterZhong\REPOS-LOCAL\ai-host-news\`
- Add all files, initial commit

### Step 6: Authenticate with Cloudflare
- Run `wrangler login` (needs browser — user offered to help)
- Or use `wrangler auth login` with API token if available

### Step 7: Deploy to Cloudflare Pages
- `wrangler pages deploy dist --project-name ai-news-hot --branch main`
- Verify site loads at `https://ai-news-hot.pages.dev`
- Verify news items appear

### Step 8: Seed KV backend (if needed)
- Use `POST /api/news` REST API to populate KV after deploy
- Or `wrangler kv:key put` for namespace `AI_NEWS`

## Known Risks
- `wrangler login` requires browser interaction; user offered to assist
- Cloudflare KV namespace `AI_NEWS` may not exist in the target account
- API key `news-api-key-2026` is hardcoded in the skill; may need to be configured in wrangler secrets or environment variables

## Files to Create/Modify
1. `PLAN.md` (this file)
2. `wrangler.toml`
3. `package.json`
4. `build.cjs`
5. `index.html` (reconstructed from live site)
6. `functions/api/news/[[id]].js` (API route)
7. `functions/api/news/index.js` (list/create)
8. `news-md/` (sample news files)
9. `.gitignore`
