"use client";

import { useState } from "react";
import { Delete, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalculatorProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  onConfirm?: (value: string) => void;
  disableDot?: boolean;
  disableMonitor?: boolean;
  disableAction?: boolean;
}

export function Calculator({
  defaultValue = "0",
  value,
  onChange,
  onConfirm,
  disableDot,
  disableMonitor,
  disableAction,
}: CalculatorProps) {
  const [display, setDisplay] = useState(value ?? defaultValue);

  if (value !== undefined && value !== display) {
    setDisplay(value);
  }

  function press(key: string) {
    let next: string;
    if (key === "backspace") {
      next = display.length > 1 ? display.slice(0, -1) : "0";
    } else if (key === "C") {
      next = "0";
    } else if (key === ".") {
      next = display.includes(".") ? display : display + ".";
    } else {
      next = display === "0" ? key : display + key;
    }
    setDisplay(next);
    onChange?.(next);
  }

  function toggleSign() {
    const next = display.startsWith("-") ? display.slice(1) : "-" + display;
    setDisplay(next);
    onChange?.(next);
  }
  return (
    <div className="space-y-1.5">
      {!disableMonitor && (
        <div className="text-right font-mono text-2xl px-3 py-2 bg-muted rounded-lg">
          {display}
        </div>
      )}
      <div className="grid grid-cols-4 grid-rows-4 gap-1.5">
        {(["1", "2", "3"] as const).map((k) => (
          <Button key={k} size="xl" variant="outline" onClick={() => press(k)}>
            {k}
          </Button>
        ))}
        <Button
          size="xl"
          variant="secondary"
          onClick={() => press("backspace")}
        >
          <Delete />
        </Button>

        {(["4", "5", "6"] as const).map((k) => (
          <Button key={k} size="xl" variant="outline" onClick={() => press(k)}>
            {k}
          </Button>
        ))}
        <Button
          size="xl"
          variant="secondary"
          disabled={disableAction}
          onClick={toggleSign}
        >
          +/-
        </Button>

        {(["7", "8", "9"] as const).map((k) => (
          <Button key={k} size="xl" variant="outline" onClick={() => press(k)}>
            {k}
          </Button>
        ))}
        <Button
          size="xl"
          variant="secondary"
          className="row-span-2 h-full"
          disabled={disableAction}
          onClick={() => onConfirm?.(display)}
        >
          <CornerDownLeft />
        </Button>

        <Button size="xl" variant="outline" onClick={() => press("C")}>
          C
        </Button>
        <Button size="xl" variant="outline" onClick={() => press("0")}>
          0
        </Button>
        <Button
          size="xl"
          variant="outline"
          disabled={disableDot}
          onClick={() => press(".")}
        >
          .
        </Button>
      </div>
    </div>
  );
}
