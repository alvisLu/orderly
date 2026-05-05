import type { GatewayAmount } from "@/modules/orders/types";
import { Stat, StatLabel, StatValue } from "@/components/ui/stat";

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

export function GatewayStat({ gateway }: { gateway: GatewayAmount }) {
  const total = gateway.totalIn - gateway.totalOut;
  return (
    <Stat className="items-center">
      <div className="font-semibold text-lg">{gateway.name}</div>
      <div className="font-semibold text-lg text-right">
        {formatNumber(total)}
      </div>
      <StatLabel>收入</StatLabel>
      <StatValue className="text-base text-green-600 dark:text-green-400">
        +{formatNumber(gateway.totalIn)}
      </StatValue>
      <StatLabel>退款</StatLabel>
      <StatValue className="text-base text-destructive">
        -{formatNumber(gateway.totalOut)}
      </StatValue>
    </Stat>
  );
}
