# Plan: Rebuild & Redeploy AI News Hot Portal

## ✅ STATUS: COMPLETE (2026-10-19) — switched to NEW project URL

## Goal
Reconstruct the AI News Hot project from the live Cloudflare Pages site, initialize a git repo under `C:\Users\WaterZhong\REPOS-LOCAL\ai-host-news\`, and redeploy to Cloudflare Pages.

## Results Summary
| Item | Status |
|------|--------|
| Git repo at `C:\Users\WaterZhong\REPOS-LOCAL\ai-host-news\` | ✅ 5 commits on master |
| Project rebuilt from live site | ✅ index.html, Functions API, build.cjs |
| Wrangler CLI installed & authenticated | ✅ v4.151.1 (OAuth, account 9088a2dc…) |
| KV namespace `AI_NEWS` created (ours) | ✅ ID `b7f0df0d29d34f4aa178726db80cd196` |
| Pages project created & deployed | ✅ `ai-news-hot-4ei.pages.dev` (Production, main) |
| **New URL homepage** | ✅ **https://ai-news-hot-4ei.pages.dev/** returns HTML |
| **New URL API** | ✅ **https://ai-news-hot-4ei.pages.dev/api/news** returns JSON news |

## 🔄 URL Switch — old → new

| | Old (pre-existing) | New (ours) |
|---|---|---|
| **URL** | `https://ai-news-hot.pages.dev` | **`https://ai-news-hot-4ei.pages.dev`** |
| Owner | original project (skill's project) | our rebuild |
| KV | old namespace (all historical news) | `AI_NEWS` `b7f0df0d…` (seeded 1 item) |

**Why a suffix?** `wrangler pages project create ai-news-hot` → Cloudflare replied
*"will be available at https://ai-news-hot-4ei.pages.dev"* because
`ai-news-hot.pages.dev` was already assigned to the pre-existing project.

### Bugs fixed during the switch
1. **`dist/` had no `index.html`** (build.cjs only wrote news-data.json) → 404 on homepage.
   Fixed: `build.cjs` now copies `index.html` → `dist/`.
2. **Functions not deployed** (wrangler ran from workspace cwd, couldn't find `functions/`).
   Fixed: always deploy with `--cwd <project-root>` so wrangler bundles `functions/`.
3. **`[[id]].js` shadowed `/api/news`** — the optional catch-all matched `/api/news`
   itself and returned `404 {"error":"News item not found"}` before `index.js` ran.
   Fixed: renamed `[[id]].js` → `[id].js` (single-segment, matches only `/api/news/:id`).

### Git History
```
a1b0dfe Fix build.cjs to copy index.html to dist; rename [[id]].js to [id].js
e3d1f7d Update PLAN.md with completion status and results summary
c6bb708 Add publish-news.js helper and sample news JSON for KV seeding
b2d9a00 Add KV namespace binding to wrangler.toml
addfb19 Initial commit: AI News Hot portal rebuilt from live Cloudflare Pages site
```

### How to publish news to the NEW portal
Update `publish-news.js` to point at the new URL, then run it:
```js
fetch('https://ai-news-hot-4ei.pages.dev/api/news', { method: 'POST', ... })
```

### ⚠️ Pending (optional)
- The new KV contains only the seeded sample item. Migrate historical news from the
  old project's KV if you want the full archive on the new URL.

---

# Original Plan

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
