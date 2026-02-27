# Vibe Bounty — Build Spec

## Concept
Bug bounty meets vibe coding. Posters create bounties with a brief and budget. Builders submit code that auto-deploys to a live preview URL. Posters review submissions in their portal and award the bounty.

## Tech Stack
- **Frontend:** Next.js 15 (App Router, static export `output: "export"`)
- **Backend:** Cloudflare Worker (Hono.js) + D1 database
- **Hosting:** Cloudflare Pages (frontend) + Workers (API + submission previews)
- **Auth:** GitHub OAuth (primary), email/password (secondary)
- **File Storage:** Cloudflare R2 (submission code bundles)
- **Preview Hosting:** Each submission gets deployed to `{submission-id}.vibe-bounty.pages.dev` or a subdomain
- **Styling:** Tailwind CSS v4, dark theme, modern/hacker aesthetic
- **Allowed packages:** lucide-react, recharts, date-fns, clsx, tailwind-merge

## Design Language
- Dark mode primary (#0a0a0a bg, #f0f0f0 text)
- Accent: electric purple #8B5CF6 + neon green #22C55E for bounty amounts
- Monospace headers (Space Mono or JetBrains Mono)
- Sans body (Inter)
- Glassmorphism cards with subtle borders
- Terminal/hacker vibe — think GitHub dark + Vercel + HackerOne mashup

## Database Schema (D1)

```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  github_id TEXT UNIQUE,
  email TEXT UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'builder' CHECK(role IN ('poster','builder','both','admin')),
  reputation INTEGER DEFAULT 0,
  total_earned REAL DEFAULT 0,
  total_posted REAL DEFAULT 0,
  github_url TEXT,
  portfolio_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Bounties (the job posts)
CREATE TABLE bounties (
  id TEXT PRIMARY KEY,
  poster_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  detailed_spec TEXT,
  budget_min REAL NOT NULL,
  budget_max REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  deadline TEXT,
  status TEXT DEFAULT 'open' CHECK(status IN ('draft','open','in_review','awarded','cancelled','expired')),
  category TEXT CHECK(category IN ('landing-page','web-app','mobile-app','api','cli-tool','game','chrome-ext','other')),
  tags TEXT, -- JSON array
  tech_stack TEXT, -- JSON array of required/preferred tech
  difficulty TEXT CHECK(difficulty IN ('beginner','intermediate','advanced','expert')),
  max_submissions INTEGER DEFAULT 50,
  submission_count INTEGER DEFAULT 0,
  winner_id TEXT REFERENCES submissions(id),
  awarded_amount REAL,
  visibility TEXT DEFAULT 'public' CHECK(visibility IN ('public','invite_only')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Submissions (builder attempts)
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  bounty_id TEXT NOT NULL REFERENCES bounties(id),
  builder_id TEXT NOT NULL REFERENCES users(id),
  title TEXT,
  description TEXT,
  preview_url TEXT, -- auto-generated Cloudflare Pages preview URL
  repo_url TEXT, -- optional GitHub repo link
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','deploying','live','failed','withdrawn','winner','rejected')),
  deploy_log TEXT,
  score INTEGER, -- poster's rating 1-10
  feedback TEXT, -- poster's review
  tech_used TEXT, -- JSON array
  submitted_at TEXT DEFAULT (datetime('now')),
  deployed_at TEXT,
  reviewed_at TEXT
);

-- Comments / Discussion
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  bounty_id TEXT NOT NULL REFERENCES bounties(id),
  submission_id TEXT REFERENCES submissions(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Submission files (stored in R2, metadata in D1)
CREATE TABLE submission_files (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER,
  content_type TEXT,
  r2_key TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## Pages to Build

### Public Pages
1. **`/` (Landing)** — Hero with tagline "Ship Code. Get Paid.", featured bounties, how it works (3 steps), stats (total bounties, total paid out, active builders), CTA to sign up
2. **`/bounties`** — Browse all open bounties. Filter by category, difficulty, budget range, tags. Sort by newest, highest bounty, deadline. Card grid layout showing title, budget, deadline, submission count, category badge, poster avatar
3. **`/bounties/[id]`** — Bounty detail page. Full brief, spec, poster info, deadline countdown, submit button, list of submissions (if public), comments/discussion thread
4. **`/leaderboard`** — Top builders by reputation, earnings, bounties won. Top posters by bounties posted, total spent
5. **`/how-it-works`** — Explainer for posters and builders

### Authenticated Pages
6. **`/dashboard`** — Role-based dashboard
   - **Poster view:** My bounties (open/reviewing/completed), total spent, active submissions to review
   - **Builder view:** My submissions (pending/live/won), earnings, active bounties I'm working on
7. **`/bounties/new`** — Create bounty form: title, brief (markdown editor), budget range, deadline, category, tags, tech stack, difficulty, visibility
8. **`/bounties/[id]/submit`** — Submit to bounty: drag-and-drop file upload (zip/tar), optional GitHub repo URL, description, tech used tags. Upload goes to R2, triggers auto-deploy
9. **`/bounties/[id]/review`** — Poster's review portal: see all submissions as cards with live preview iframe, score slider, feedback textarea, "Award Bounty" button
10. **`/submissions/[id]`** — Submission detail: live preview iframe (full width), code file tree, builder info, score/feedback if reviewed
11. **`/profile/[username]`** — Public profile: avatar, bio, stats, bounties posted/won, reputation
12. **`/settings`** — Profile edit, payout info, notification preferences

### Auth Pages
13. **`/login`** — GitHub OAuth + email/password
14. **`/signup`** — Register with role selection (poster/builder/both)

## API Routes (Hono.js Worker)

```
POST   /api/auth/github          — GitHub OAuth callback
POST   /api/auth/login            — Email login
POST   /api/auth/signup           — Email signup
GET    /api/auth/me               — Current user

GET    /api/bounties              — List bounties (with filters)
POST   /api/bounties              — Create bounty
GET    /api/bounties/:id          — Get bounty detail
PUT    /api/bounties/:id          — Update bounty
DELETE /api/bounties/:id          — Cancel bounty
POST   /api/bounties/:id/award    — Award bounty to a submission

GET    /api/submissions           — List submissions (by bounty or by user)
POST   /api/submissions           — Create submission + trigger deploy
GET    /api/submissions/:id       — Get submission detail
PUT    /api/submissions/:id       — Update submission
POST   /api/submissions/:id/score — Score a submission (poster only)

POST   /api/upload                — Upload submission files to R2
GET    /api/files/:key            — Serve files from R2

GET    /api/comments/:bountyId    — List comments
POST   /api/comments              — Add comment

GET    /api/users/:username       — Public profile
PUT    /api/users/me              — Update own profile

GET    /api/leaderboard           — Leaderboard data
GET    /api/stats                 — Platform stats
```

## Auto-Deploy Flow
1. Builder uploads zip/files via `/api/upload` → stored in R2
2. Worker extracts the bundle, identifies `index.html` entry point
3. Worker deploys files to a unique Cloudflare Pages project or uses Workers Sites to serve at `{submission-id}.submissions.vibe-bounty.pages.dev`
4. Preview URL saved to `submissions.preview_url`
5. Poster sees live iframe in review portal

**Simpler v1 approach:** For MVP, serve submissions directly from R2 via a Worker route: `https://vibe-bounty-api.workers.dev/preview/{submission-id}/` which proxies files from R2. No separate Pages deploy needed.

## Key Features
- **Live Preview:** Every submission gets a hosted URL the poster can view
- **Markdown briefs:** Posters write specs in markdown, rendered beautifully
- **Discussion threads:** Comments on bounties and individual submissions
- **Reputation system:** Builders earn rep for winning bounties, quality scores
- **Deadline countdown:** Visual timer on bounty cards and detail pages
- **Submission limit:** Posters can cap how many submissions a bounty accepts

## Build Order
1. Set up Next.js project with Tailwind, dark theme, layout
2. Landing page
3. Bounties list + detail pages (with mock data first)
4. API Worker with D1 schema + seed data
5. Auth (GitHub OAuth)
6. Create bounty flow
7. Submit to bounty flow (file upload to R2)
8. Preview serving (R2 proxy)
9. Review portal with live iframes
10. Leaderboard + profiles
11. Wire everything to real API
12. Deploy to Cloudflare Pages + push to GitHub

## Deploy Commands
```bash
# Frontend
cd ~/Projects/vibe-bounty && npm run build && npx wrangler pages deploy out --project-name vibe-bounty

# API Worker
cd ~/Projects/vibe-bounty/api-worker && npx wrangler deploy
```

When completely finished, run: openclaw system event --text "Done: Vibe Bounty platform built and deployed" --mode now
