import Big from "big.js";
import type { OrdersReport } from "./types";

export function aggregateDailyReports(reports: OrdersReport[]): OrdersReport {
  let count = 0;
  let total = Big(0);
  let doneTotal = Big(0);
  let cancelledTotal = Big(0);
  let unfinishedTotal = Big(0);
  let processingCount = 0;
  let paidTotal = Big(0);
  let discount = Big(0);
  let refundTotal = Big(0);
  let peopleCount = 0;
  const inMap = new Map<string, Big>();
  const outMap = new Map<string, Big>();

  for (const r of reports) {
    count += r.count;
    total = total.plus(Big(r.total));
    doneTotal = doneTotal.plus(Big(r.doneTotal));
    cancelledTotal = cancelledTotal.plus(Big(r.cancelledTotal));
    unfinishedTotal = unfinishedTotal.plus(Big(r.unfinishedTotal));
    processingCount += r.processingCount;
    paidTotal = paidTotal.plus(Big(r.paidTotal));
    discount = discount.plus(Big(r.discount));
    refundTotal = refundTotal.plus(Big(r.refundTotal));
    peopleCount += r.peopleCount;
    for (const g of r.byGateway) {
      const prevIn = inMap.get(g.name) ?? Big(0);
      inMap.set(g.name, prevIn.plus(Big(g.totalIn)));
      const prevOut = outMap.get(g.name) ?? Big(0);
      outMap.set(g.name, prevOut.plus(Big(g.totalOut)));
    }
  }

  const avgPerOrder =
    count > 0 ? total.div(Big(count)).round(0).toNumber() : 0;
  const avgPerPerson =
    peopleCount > 0 ? total.div(Big(peopleCount)).round(0).toNumber() : 0;

  return {
    count,
    total: total.toNumber(),
    doneTotal: doneTotal.toNumber(),
    cancelledTotal: cancelledTotal.toNumber(),
    unfinishedTotal: unfinishedTotal.toNumber(),
    processingCount,
    paidTotal: paidTotal.toNumber(),
    discount: discount.toNumber(),
    refundTotal: refundTotal.toNumber(),
    peopleCount,
    avgPerOrder,
    avgPerPerson,
    byGateway: Array.from(new Set([...inMap.keys(), ...outMap.keys()])).map(
      (name) => ({
        name,
        totalIn: (inMap.get(name) ?? Big(0)).toNumber(),
        totalOut: (outMap.get(name) ?? Big(0)).toNumber(),
      })
    ),
  };
}
