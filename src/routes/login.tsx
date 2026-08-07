import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/admin.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Kaizema Pure Water" },
      {
        name: "description",
        content: "Sign in to the Kaizema Pure Water admin dashboard to review production and sales.",
      },
      { property: "og:title", content: "Admin Sign In — Kaizema Pure Water" },
      {
        property: "og:description",
        content: "Sign in to the Kaizema Pure Water admin dashboard to review production and sales.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const login = useServerFn(adminLogin);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await login({
        data: {
          username: String(form.get("username") ?? ""),
          password: String(form.get("password") ?? ""),
        },
      });
      if (res.ok) {
        await router.navigate({ to: "/admin" });
        return;
      }
      setError(
        res.reason === "not-configured"
          ? "Admin credentials are not configured on this deployment."
          : "Incorrect username or password.",
      );
    } catch {
      setError("Could not sign in right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <Card className="w-full max-w-sm gap-0 border-border/70 p-6 shadow-soft">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Lock className="size-4" /> Admin access
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-foreground">
          Kaizema Pure Water
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to open the admin dashboard.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" autoComplete="username" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
