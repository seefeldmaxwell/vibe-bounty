# UPGRADE.md — Ralph Wiggum Loop: Production-Grade Vibe Bounty

## What is a Ralph Wiggum Loop?
You are in an iterative improvement loop. Build → test → fix → improve → repeat. Keep going until this is production-worthy. Don't stop after one pass. Run through the ENTIRE checklist, then loop back and improve what you missed. You have 4 hours. Use every minute.

## D1 Database
- **Name:** vibe-bounty-db  
- **ID:** bbce3b61-dd6a-4209-870a-bafa5696530f
- Schema file: `api-worker/schema.sql`
- Seed file: `api-worker/seed.sql`
- Apply schema: `cd api-worker && npx wrangler d1 execute vibe-bounty-db --remote --file=schema.sql`
- Apply seed: `cd api-worker && npx wrangler d1 execute vibe-bounty-db --remote --file=seed.sql`

## Priority 1: Real Authentication (CRITICAL)
1. **GitHub OAuth** — Full auth code flow:
   - Create GitHub OAuth App (or use existing) — redirect to `https://vibe-bounty.pages.dev/auth/callback`
   - Worker route `POST /api/auth/github` exchanges code for access token
   - Fetch GitHub user profile, create/update user in D1
   - Return JWT or session token
   - Store in localStorage, send as `Authorization: Bearer <token>` header
   - Client ID as Worker env var, client secret as Worker secret
2. **Session management** — JWT with 7-day expiry, refresh on activity
3. **Protected routes** — Dashboard, settings, create bounty, submit require auth
4. **Login/signup pages** — GitHub OAuth button (primary), clean UI
5. **Auth context** — React context provider wrapping the app, `useAuth()` hook

## Priority 2: Wire ALL Pages to D1 API
Every page must fetch from and write to the real D1 database. NO mock data, NO localStorage fallbacks.

- `GET /api/bounties` → bounties list page with real data
- `POST /api/bounties` → create bounty form saves to D1
- `GET /api/bounties/:id` → bounty detail with real data
- `POST /api/submissions` → submit code to a bounty
- `GET /api/submissions` → list submissions
- `POST /api/bounties/:id/award` → award a bounty
- `GET /api/leaderboard` → real aggregated stats
- `GET /api/users/:username` → real profile data
- `PUT /api/users/me` → update profile
- Dashboard pulls real user-specific data

For each endpoint:
1. Verify the API Worker route exists and works (curl test)
2. If missing, create it in the Worker
3. Wire the frontend page to call it
4. Test the round trip

## Priority 3: File Upload & Preview System
1. **R2 bucket** — Create `vibe-bounty-submissions` R2 bucket if not exists
2. **Upload endpoint** — `POST /api/upload` accepts zip/files, stores in R2 under `submissions/{id}/`
3. **Preview serving** — `GET /preview/{submission-id}/*` serves files from R2 as a static site
4. **Drag-and-drop UI** — File upload component on submission page
5. **Live preview iframe** — In the review portal, each submission shows in an iframe pointing to its preview URL

## Priority 4: Review Portal
1. Poster can see all submissions for their bounty
2. Each submission card shows:
   - Builder info (avatar, username)
   - Live preview in iframe
   - Score slider (1-10)
   - Feedback textarea
   - "Award Bounty" button
3. Awarding a bounty:
   - Updates submission status to 'winner'
   - Updates bounty status to 'awarded'
   - Increments builder's reputation and earnings
   - Sends notification (or at least shows in dashboard)

## Priority 5: Production Polish
1. **Error handling** — Every API call has try/catch, user-friendly error toasts
2. **Loading states** — Skeleton loaders on every page
3. **Empty states** — "No bounties yet" / "No submissions" with CTAs
4. **Form validation** — All forms validate before submit
5. **Responsive** — Every page works on mobile
6. **SEO** — Meta tags, OG tags on public pages
7. **Rate limiting** — Basic rate limit middleware on API
8. **CORS** — Proper CORS headers on Worker
9. **Input sanitization** — No raw HTML injection, sanitize all user input
10. **404 page** — Custom not-found page

## Priority 6: Make It Look INCREDIBLE
1. Landing page should be jaw-dropping — animated hero, particle effects or gradient mesh, smooth scroll
2. Bounty cards should feel premium — hover effects, smooth transitions
3. Code/terminal aesthetic throughout — monospace accents, subtle scan lines or grid patterns
4. Micro-interactions — button press effects, card hover lifts, loading spinners
5. Consistent dark theme — no white flashes, no style inconsistencies

## Iteration Loop
After each pass through priorities 1-6:
1. Run `npm run build` — fix ALL errors
2. `curl` test every API endpoint
3. Deploy API worker: `cd api-worker && npx wrangler deploy`
4. Deploy frontend: `cd ~/Projects/vibe-bounty && npx wrangler pages deploy out --project-name vibe-bounty`
5. Commit: `git add -A && git commit -m "iteration N: [what changed]"`
6. Push: `git push origin master`
7. Go back to Priority 1 and look for anything you missed or can improve
8. REPEAT

## GitHub Repo
Push to GitHub: `gh repo create vibe-bounty --public --source=. --push` (if not already created)

## When Done
Run: openclaw system event --text "Done: Vibe Bounty production upgrade complete — real auth, D1 wired, file upload, review portal, polished UI" --mode now
