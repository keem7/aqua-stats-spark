import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PRICE_PER_BUNDLE,
  formatMoney,
  today,
  type DayEntry,
} from "@/lib/production-store";

type Props = {
  onSave: (entry: Omit<DayEntry, "id">) => boolean;
};

export function EntryForm({ onSave }: Props) {
  const [date, setDate] = useState(today());
  const [produced, setProduced] = useState("");
  const [setOut, setSetOut] = useState("");
  const [issues, setIssues] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const good = Math.max((Number(setOut) || 0) - (Number(issues) || 0), 0);
  const revenue = good * PRICE_PER_BUNDLE;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = onSave({
      date,
      produced: Number(produced) || 0,
      setOut: Number(setOut) || 0,
      issues: Number(issues) || 0,
      notes: notes.trim(),
    });
    setMessage(updated ? "Day updated" : "Day recorded");
    setProduced("");
    setSetOut("");
    setIssues("");
    setNotes("");
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <Card className="border-border/70 shadow-soft">
      <CardHeader>
        <CardTitle className="font-display text-lg">Record a day</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="produced">Bundles produced</Label>
            <Input
              id="produced"
              inputMode="numeric"
              type="number"
              min="0"
              placeholder="0"
              value={produced}
              onChange={(e) => setProduced(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="setout">Bundles set out for sales</Label>
              <Input
                id="setout"
                inputMode="numeric"
                type="number"
                min="0"
                placeholder="0"
                value={setOut}
                onChange={(e) => setSetOut(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issues">Bundles with issues</Label>
              <Input
                id="issues"
                inputMode="numeric"
                type="number"
                min="0"
                placeholder="0"
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-surface p-3 text-sm">
            <p className="text-muted-foreground">
              {good.toLocaleString()} good bundles × {formatMoney(PRICE_PER_BUNDLE)}
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-foreground">
              {formatMoney(revenue)}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Leakage cause, machine downtime, deliveries, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full shadow-glow">
            Save day
          </Button>
          {message ? (
            <p className="text-center text-sm font-medium text-success">{message}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
