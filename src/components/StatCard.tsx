import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney, formatPercent, percentChange } from "@/lib/production-store";

type Props = {
  label: string;
  value: number;
  previous: number | undefined;
  money?: boolean;
};

export function StatCard({ label, value, previous, money }: Props) {
  const change = previous === undefined ? null : percentChange(value, previous);
  const positive = change !== null && change > 0;
  const negative = change !== null && change < 0;
  const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus;

  return (
    <Card className="gap-0 border-border/70 bg-surface p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">
        {money ? formatMoney(value) : value.toLocaleString()}
      </p>
      <p
        className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${
          positive ? "text-success" : negative ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        <Icon className="size-3.5" />
        {previous === undefined ? "No previous day" : `${formatPercent(change)} vs previous day`}
      </p>
    </Card>
  );
}
