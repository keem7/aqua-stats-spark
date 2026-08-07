import { createFileRoute, redirect, useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, ShieldCheck } from "lucide-react";
import { EntryList } from "@/components/EntryList";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminLogout, getAdminSession } from "@/lib/admin.functions";
import {
  formatDate,
  formatMoney,
  goodBundles,
  revenueOf,
  useEntries,
} from "@/lib/production-store";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { admin } = await getAdminSession();
    if (!admin) throw redirect({ to: "/login" });
    return { admin };
  },
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Kaizema Pure Water" },
      {
        name: "description",
        content:
          "Admin overview of Kaizema Pure Water: total bundles produced, sold, issues and revenue across all recorded days.",
      },
      { property: "og:title", content: "Admin Dashboard — Kaizema Pure Water" },
      {
        property: "og:description",
        content:
          "Admin overview of Kaizema Pure Water: total bundles produced, sold, issues and revenue across all recorded days.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { admin } = Route.useRouteContext();
  const router = useRouter();
  const logout = useServerFn(adminLogout);
  const { entries, removeEntry } = useEntries();

  const totals = entries.reduce(
    (acc, e) => ({
      produced: acc.produced + e.produced,
      setOut: acc.setOut + e.setOut,
      issues: acc.issues + e.issues,
      revenue: acc.revenue + revenueOf(e),
      sellable: acc.sellable + goodBundles(e),
    }),
    { produced: 0, setOut: 0, issues: 0, revenue: 0, sellable: 0 },
  );

  const days = entries.length;
  const avgRevenue = days ? totals.revenue / days : 0;
  const issueRate = totals.setOut ? (totals.issues / totals.setOut) * 100 : 0;
  const best = entries.reduce<(typeof entries)[number] | undefined>(
    (b, e) => (!b || revenueOf(e) > revenueOf(b) ? e : b),
    undefined,
  );

  async function onLogout() {
    await logout({});
    await router.navigate({ to: "/login" });
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="bg-water px-5 pb-12 pt-10 text-primary-foreground">
        <div className="mx-auto flex max-w-3xl flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="size-3.5" /> Admin
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight">
              Admin dashboard
            </h1>
            <p className="mt-2 text-sm opacity-90">Signed in as {admin}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/">Daily log</Link>
            </Button>
            <Button variant="secondary" size="sm" onClick={onLogout}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto -mt-6 grid max-w-3xl gap-6 px-5">
        <section aria-labelledby="totals" className="grid gap-3">
          <h2 id="totals" className="sr-only">
            All-time totals
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Total bundles produced" value={totals.produced} previous={undefined} />
            <StatCard label="Total set out for sales" value={totals.setOut} previous={undefined} />
            <StatCard label="Total bundles with issues" value={totals.issues} previous={undefined} />
            <StatCard label="Total revenue" value={totals.revenue} previous={undefined} money />
          </div>
        </section>

        <Card className="gap-0 border-border/70 bg-surface p-4 shadow-soft">
          <h2 className="font-display text-lg font-semibold text-foreground">Overview</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Days recorded</dt>
              <dd className="font-medium text-foreground">{days}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Sellable bundles</dt>
              <dd className="font-medium text-foreground">{totals.sellable.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Average revenue / day</dt>
              <dd className="font-medium text-foreground">{formatMoney(avgRevenue)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Issue rate</dt>
              <dd className="font-medium text-foreground">{issueRate.toFixed(1)}%</dd>
            </div>
            <div className="flex justify-between gap-3 sm:col-span-2">
              <dt className="text-muted-foreground">Best day</dt>
              <dd className="font-medium text-foreground">
                {best ? `${formatDate(best.date)} · ${formatMoney(revenueOf(best))}` : "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <section aria-labelledby="all-entries" className="grid gap-3">
          <h2 id="all-entries" className="font-display text-lg font-semibold text-foreground">
            All entries
          </h2>
          <EntryList entries={entries} onDelete={removeEntry} />
        </section>
      </div>
    </main>
  );
}
