-- Seed users
INSERT OR IGNORE INTO users (id, username, display_name, avatar_url, bio, role, reputation, total_earned, total_posted, github_url, created_at) VALUES
  ('u1', 'ghost_coder', 'Ghost Coder', 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ghost', 'Full-stack dev. I build things that ship.', 'builder', 4820, 34500, 0, 'https://github.com/ghostcoder', '2025-06-15T00:00:00Z'),
  ('u2', 'vibe_queen', 'Vibe Queen', 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=queen', 'Startup founder. Shipping fast, paying faster.', 'poster', 3200, 0, 72000, 'https://github.com/vibequeen', '2025-05-20T00:00:00Z'),
  ('u3', 'byte_wizard', 'Byte Wizard', 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=wizard', 'React architect. Making the web beautiful one component at a time.', 'builder', 6100, 52300, 0, 'https://github.com/bytewizard', '2025-04-10T00:00:00Z'),
  ('u4', 'ship_it_sam', 'Ship It Sam', 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=sam', 'Angel investor and serial builder.', 'both', 2800, 8500, 45000, NULL, '2025-07-01T00:00:00Z'),
  ('u5', 'pixel_punk', 'Pixel Punk', 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=punk', 'Designer who codes. Code that designs.', 'builder', 3900, 28700, 0, NULL, '2025-08-12T00:00:00Z'),
  ('u6', 'zero_day', 'Zero Day', 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=zero', 'Security researcher turned builder.', 'builder', 5500, 41200, 0, NULL, '2025-03-22T00:00:00Z');

-- Seed bounties
INSERT OR IGNORE INTO bounties (id, poster_id, title, brief, budget_min, budget_max, deadline, status, category, tags, tech_stack, difficulty, max_submissions, submission_count, visibility, created_at, updated_at) VALUES
  ('b1', 'u2', 'AI-Powered SaaS Landing Page', 'Build a stunning, conversion-optimized landing page for an AI writing tool.', 500, 1500, '2026-03-15T23:59:59Z', 'open', 'landing-page', '["react","animation","saas","responsive"]', '["Next.js","Tailwind CSS","Framer Motion"]', 'intermediate', 20, 7, 'public', '2026-02-20T10:00:00Z', '2026-02-20T10:00:00Z'),
  ('b2', 'u4', 'Real-time Multiplayer Quiz Game', 'Create a real-time multiplayer quiz game with WebSocket rooms and cyberpunk aesthetic.', 2000, 5000, '2026-03-30T23:59:59Z', 'open', 'game', '["websockets","real-time","multiplayer","game"]', '["React","WebSockets","Node.js"]', 'advanced', 10, 3, 'public', '2026-02-18T14:30:00Z', '2026-02-18T14:30:00Z'),
  ('b3', 'u2', 'Chrome Extension: Tab Manager Pro', 'Build a Chrome extension that groups, saves, and restores browser tab sessions.', 800, 2000, '2026-03-10T23:59:59Z', 'open', 'chrome-ext', '["chrome","extension","productivity","typescript"]', '["TypeScript","Chrome APIs","React"]', 'intermediate', 15, 12, 'public', '2026-02-15T09:00:00Z', '2026-02-15T09:00:00Z'),
  ('b4', 'u4', 'REST API for E-commerce Backend', 'Build a production-ready REST API for an e-commerce platform.', 3000, 7000, '2026-04-01T23:59:59Z', 'open', 'api', '["api","ecommerce","stripe","auth"]', '["Hono.js","Cloudflare Workers","D1"]', 'expert', 8, 2, 'public', '2026-02-22T16:00:00Z', '2026-02-22T16:00:00Z'),
  ('b5', 'u2', 'Personal Portfolio with CMS', 'Build a developer portfolio template with a built-in markdown CMS.', 300, 800, '2026-03-20T23:59:59Z', 'open', 'web-app', '["portfolio","cms","blog","seo"]', '["Next.js","MDX","Tailwind CSS"]', 'beginner', 30, 18, 'public', '2026-02-10T12:00:00Z', '2026-02-10T12:00:00Z'),
  ('b6', 'u4', 'CLI Tool: Git Workflow Automator', 'Build a CLI tool that automates common git workflows.', 1000, 2500, '2026-03-25T23:59:59Z', 'open', 'cli-tool', '["cli","git","automation","tui"]', '["Rust","clap","crossterm"]', 'advanced', 12, 5, 'public', '2026-02-19T08:00:00Z', '2026-02-19T08:00:00Z'),
  ('b7', 'u2', 'Mobile App: Habit Tracker', 'Design and build a habit tracker mobile app with streak tracking.', 1500, 4000, '2026-04-10T23:59:59Z', 'open', 'mobile-app', '["mobile","react-native","health","habits"]', '["React Native","Expo","Reanimated"]', 'intermediate', 15, 4, 'public', '2026-02-23T11:00:00Z', '2026-02-23T11:00:00Z'),
  ('b8', 'u4', 'Dashboard Analytics UI Kit', 'Build a comprehensive analytics dashboard with 10+ chart types.', 2000, 5000, '2026-03-28T23:59:59Z', 'in_review', 'web-app', '["dashboard","charts","data-viz","ui-kit"]', '["React","Recharts","Tailwind CSS"]', 'advanced', 10, 10, 'public', '2026-02-05T15:00:00Z', '2026-02-25T15:00:00Z');

-- Seed submissions
INSERT OR IGNORE INTO submissions (id, bounty_id, builder_id, title, description, preview_url, repo_url, status, score, feedback, tech_used, submitted_at, deployed_at, reviewed_at) VALUES
  ('s1', 'b1', 'u1', 'Sleek AI Landing - Glassmorphism Edition', 'Built with Next.js 15 and Framer Motion.', 'https://s1.submissions.vibe-bounty.pages.dev', 'https://github.com/ghostcoder/ai-landing', 'live', NULL, NULL, '["Next.js","Tailwind CSS","Framer Motion"]', '2026-02-22T14:00:00Z', '2026-02-22T14:02:00Z', NULL),
  ('s2', 'b1', 'u3', 'NeonType AI - Cyberpunk Landing', 'A cyberpunk-themed landing with neon gradients.', 'https://s2.submissions.vibe-bounty.pages.dev', NULL, 'live', 9, 'Incredible work! The animations are buttery smooth.', '["Astro","Tailwind CSS","Three.js"]', '2026-02-23T09:30:00Z', '2026-02-23T09:32:00Z', '2026-02-24T10:00:00Z'),
  ('s3', 'b2', 'u5', 'CyberQuiz - Neon Multiplayer', 'Real-time quiz game with WebSocket rooms.', 'https://s3.submissions.vibe-bounty.pages.dev', NULL, 'live', NULL, NULL, '["React","Socket.io","Express"]', '2026-02-24T16:00:00Z', '2026-02-24T16:03:00Z', NULL),
  ('s4', 'b5', 'u6', 'DevFolio - Minimal Portfolio', 'Clean, minimal portfolio with MDX blog.', 'https://s4.submissions.vibe-bounty.pages.dev', 'https://github.com/zeroday/devfolio', 'winner', 10, 'This is exactly what I wanted. Awarded!', '["Next.js","MDX","Tailwind CSS"]', '2026-02-12T11:00:00Z', '2026-02-12T11:01:00Z', '2026-02-14T09:00:00Z'),
  ('s5', 'b1', 'u5', 'Aurora AI - Gradient Masterpiece', 'Beautiful landing with aurora-inspired gradients.', 'https://s5.submissions.vibe-bounty.pages.dev', NULL, 'pending', NULL, NULL, '["Next.js","Tailwind CSS","GSAP"]', '2026-02-26T08:00:00Z', NULL, NULL);

-- Seed comments
INSERT OR IGNORE INTO comments (id, bounty_id, submission_id, user_id, content, created_at) VALUES
  ('c1', 'b1', NULL, 'u1', 'Quick question — should the pricing toggle be monthly/yearly or just monthly?', '2026-02-21T10:00:00Z'),
  ('c2', 'b1', NULL, 'u2', 'Monthly/yearly toggle would be great. Also, make sure the hero animation does not impact LCP.', '2026-02-21T10:30:00Z'),
  ('c3', 'b1', NULL, 'u3', 'Submitted my entry! Used Three.js for a 3D product mockup in the hero.', '2026-02-23T09:35:00Z'),
  ('c4', 'b2', NULL, 'u5', 'Is there a specific question format you want? Multiple choice, true/false, or open-ended?', '2026-02-20T14:00:00Z'),
  ('c5', 'b2', NULL, 'u4', 'Multiple choice for v1. 4 options per question, 15-second timer.', '2026-02-20T14:15:00Z');
