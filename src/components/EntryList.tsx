import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatDate,
  formatMoney,
  formatPercent,
  goodBundles,
  percentChange,
  revenueOf,
  type DayEntry,
} from "@/lib/production-store";

type Props = {
  entries: DayEntry[];
  onDelete: (id: string) => void;
};

export function EntryList({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <Card className="border-dashed border-border bg-surface p-8 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">
          No days recorded yet. Add today&apos;s bundles to start tracking growth.
        </p>
      </Card>
    );
  }

  return (
    <ul className="grid gap-3">
      {entries.map((entry, index) => {
        const prev = entries[index + 1];
        const change = prev ? percentChange(revenueOf(entry), revenueOf(prev)) : null;
        const positive = change !== null && change > 0;
        return (
          <li key={entry.id}>
            <Card className="gap-0 border-border/70 p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display font-semibold text-foreground">
                    {formatDate(entry.date)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.produced.toLocaleString()} produced ·{" "}
                    {entry.setOut.toLocaleString()} set out ·{" "}
                    {entry.issues.toLocaleString()} with issues
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {goodBundles(entry).toLocaleString()} sellable ·{" "}
                    {formatMoney(revenueOf(entry))}
                  </p>
                  {entry.notes ? (
                    <p className="mt-2 text-sm italic text-muted-foreground">{entry.notes}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      prev
                        ? positive
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {prev ? formatPercent(change) : "First day"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete entry for ${formatDate(entry.date)}`}
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
