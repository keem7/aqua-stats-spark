import { createFileRoute } from "@tanstack/react-router";
import { Droplets } from "lucide-react";
import logoAsset from "@/assets/kaizema-logo.jpeg.asset.json";
import { EntryForm } from "@/components/EntryForm";
import { EntryList } from "@/components/EntryList";
import { StatCard } from "@/components/StatCard";
import { formatDate, useEntries } from "@/lib/production-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kaizema Pure Water — Daily Production & Sales" },
      {
        name: "description",
        content:
          "Kaizema Pure Water daily log: record production and sales, and track the percentage increase over the previous day.",
      },
      { property: "og:title", content: "Kaizema Pure Water — Daily Production & Sales" },
      {
        property: "og:description",
        content:
          "Kaizema Pure Water daily log: record production and sales, and track the percentage increase over the previous day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { entries, loaded, saveEntry, removeEntry } = useEntries();
  const latest = entries[0];
  const previous = entries[1];

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="bg-water px-5 pb-12 pt-10 text-primary-foreground">
        <div className="mx-auto flex max-w-3xl items-start gap-4">
          <img
            src={logoAsset.url}
            alt="Kaizema Pure Water logo"
            className="size-16 shrink-0 rounded-xl border border-background/30 bg-background object-cover"
          />
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Droplets className="size-3.5" /> Daily log
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight">
              Kaizema Pure Water
            </h1>
            <p className="mt-2 max-w-md text-sm opacity-90">
              Log each day&apos;s production and sales, and track the percentage improvement over
              the previous day.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto -mt-6 grid max-w-3xl gap-6 px-5">
        <section aria-labelledby="summary">
          <h2 id="summary" className="sr-only">
            Latest day summary
          </h2>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            {loaded && latest ? formatDate(latest.date) : "Awaiting first entry"}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Produced"
              value={latest?.produced ?? 0}
              previous={previous?.produced}
            />
            <StatCard label="Sold" value={latest?.sold ?? 0} previous={previous?.sold} />
            <StatCard
              label="Revenue"
              value={latest?.revenue ?? 0}
              previous={previous?.revenue}
              money
            />
          </div>
        </section>

        <EntryForm onSave={saveEntry} />

        <section aria-labelledby="history" className="grid gap-3">
          <h2 id="history" className="font-display text-lg font-semibold text-foreground">
            History
          </h2>
          <EntryList entries={entries} onDelete={removeEntry} />
        </section>
      </div>
    </main>
  );
}
