"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const { loginWithGithub } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");

    if (errorParam) {
      setError("GitHub authorization was denied.");
      return;
    }

    if (!code) {
      setError("No authorization code received.");
      return;
    }

    loginWithGithub(code)
      .then(() => {
        window.location.href = "/dashboard";
      })
      .catch((err) => {
        setError(err.message || "Authentication failed");
      });
  }, [loginWithGithub]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-red-400">Authentication Failed</h2>
            <p className="text-muted-foreground">{error}</p>
            <a href="/login" className="inline-block mt-4 px-6 py-2 bg-accent rounded-lg text-white hover:bg-accent-hover transition-colors">
              Try Again
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-accent" />
            <p className="text-muted-foreground font-mono">Authenticating with GitHub...</p>
          </div>
        )}
      </div>
    </div>
  );
}
