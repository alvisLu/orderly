import { Stat, StatLabel, StatValue } from "@/components/ui/stat";

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

export type ExpenseTypeTotal = {
  name: string;
  total: number;
  count: number;
};

export function ExpenseTypeStat({ amount }: { amount: ExpenseTypeTotal }) {
  return (
    <Stat className="items-center">
      <div className="font-semibold text-lg">{amount.name}</div>
      <div className="font-semibold text-lg text-right text-destructive">
        -{formatNumber(amount.total)}
      </div>
      <StatLabel>筆數</StatLabel>
      <StatValue className="text-base">{amount.count}</StatValue>
    </Stat>
  );
}
