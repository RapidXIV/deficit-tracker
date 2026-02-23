import { useState } from "react";
import { ArrowRightFromLine, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

type Mode = "home" | "signin" | "signup";

interface LandingProps {
  onAuthenticated: () => void;
}

export function Landing({ onAuthenticated }: LandingProps) {
  const [mode, setMode] = useState<Mode>("home");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint =
        mode === "signin" ? "/api/auth/login" : "/api/auth/signup";
      const user = await apiRequest<{ id: string; username: string }>(
        "POST",
        endpoint,
        { username: username.trim(), password }
      );
      qc.setQueryData(["/api/auth/me"], user);
      qc.invalidateQueries({ queryKey: ["/api/settings"] });
      qc.invalidateQueries({ queryKey: ["/api/logs"] });
      onAuthenticated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`h-[100dvh] flex flex-col items-center overflow-hidden touch-none px-4 justify-start`}
      style={{ background: 'var(--surface-0)', paddingTop: mode === "home" ? '25dvh' : 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
    >
      {mode === "home" && (
        <div className="w-full max-w-xs flex flex-col items-center gap-8">
          {/* ── Wordmark ── */}
          <div className="text-center">
            <h1
              className="font-bold uppercase"
              style={{
                fontSize: 'var(--type-display)',
                color: 'var(--text-primary)',
                letterSpacing: '0.2em',
                lineHeight: 1,
              }}
            >
              DEFICIT
            </h1>
            <p
              className="font-medium uppercase mt-2"
              style={{
                fontSize: 'var(--type-label)',
                color: 'var(--text-secondary)',
                letterSpacing: '0.12em',
              }}
            >
              caloric deficit tracker
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button
              variant="default"
              size="full"
              onClick={() => setMode("signin")}
            >
              <ArrowRightFromLine className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button
              variant="default"
              size="full"
              onClick={() => setMode("signup")}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </Button>
          </div>
        </div>
      )}

      {(mode === "signin" || mode === "signup") && (
        <div className="w-full max-w-xs">
          <button
            onClick={() => { setMode("home"); setError(""); }}
            className="text-[12px] uppercase tracking-[0.1em] mb-6 block text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-150"
          >
            ← Back
          </button>

          <h2
            className="font-bold uppercase text-center mb-6"
            style={{
              fontSize: 'var(--type-label)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.12em',
            }}
          >
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete={mode === "signin" ? "username" : "new-username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs" style={{ color: 'var(--accent-negative)' }}>{error}</p>
            )}

            <Button
              type="submit"
              variant="default"
              size="full"
              disabled={loading}
            >
              {loading
                ? "..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
