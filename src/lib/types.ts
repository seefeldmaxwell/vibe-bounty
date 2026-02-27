export interface User {
  id: string;
  github_id?: string;
  email?: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role: "poster" | "builder" | "both" | "admin";
  reputation: number;
  total_earned: number;
  total_posted: number;
  github_url?: string;
  portfolio_url?: string;
  created_at: string;
}

export interface Bounty {
  id: string;
  poster_id: string;
  poster?: User;
  title: string;
  brief: string;
  detailed_spec?: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  deadline?: string;
  status: "draft" | "open" | "in_review" | "awarded" | "cancelled" | "expired";
  category: string;
  tags: string[];
  tech_stack: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  max_submissions: number;
  submission_count: number;
  winner_id?: string;
  awarded_amount?: number;
  visibility: "public" | "invite_only";
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  bounty_id: string;
  builder_id: string;
  builder?: User;
  bounty?: Bounty;
  title?: string;
  description?: string;
  preview_url?: string;
  repo_url?: string;
  status: "pending" | "deploying" | "live" | "failed" | "withdrawn" | "winner" | "rejected";
  deploy_log?: string;
  score?: number;
  feedback?: string;
  tech_used: string[];
  submitted_at: string;
  deployed_at?: string;
  reviewed_at?: string;
}

export interface Comment {
  id: string;
  bounty_id: string;
  submission_id?: string;
  user_id: string;
  user?: User;
  content: string;
  created_at: string;
}

export interface PlatformStats {
  total_bounties: number;
  total_paid_out: number;
  active_builders: number;
  open_bounties: number;
}
