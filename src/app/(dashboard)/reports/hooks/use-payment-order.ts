"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGetPayments } from "@/app/api/payments/api";

export function usePaymentOrder(): (name: string) => number {
  const [ranks, setRanks] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;
    apiGetPayments().then((payments) => {
      if (cancelled) return;
      setRanks(new Map(payments.map((p) => [p.name, p.rank])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useCallback(
    (name: string) => ranks.get(name) ?? Number.POSITIVE_INFINITY,
    [ranks]
  );
}
