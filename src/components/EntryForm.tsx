import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { today, type DayEntry } from "@/lib/production-store";

type Props = {
  onSave: (entry: Omit<DayEntry, "id">) => boolean;
};

export function EntryForm({ onSave }: Props) {
  const [date, setDate] = useState(today());
  const [produced, setProduced] = useState("");
  const [sold, setSold] = useState("");
  const [revenue, setRevenue] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = onSave({
      date,
      produced: Number(produced) || 0,
      sold: Number(sold) || 0,
      revenue: Number(revenue) || 0,
      notes: notes.trim(),
    });
    setMessage(updated ? "Day updated" : "Day recorded");
    setProduced("");
    setSold("");
    setRevenue("");
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
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="produced">Units produced</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="sold">Units sold</Label>
              <Input
                id="sold"
                inputMode="numeric"
                type="number"
                min="0"
                placeholder="0"
                value={sold}
                onChange={(e) => setSold(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="revenue">Sales revenue</Label>
            <Input
              id="revenue"
              inputMode="decimal"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Machine downtime, deliveries, etc."
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
