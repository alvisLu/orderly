import Image from "next/image";
import { Clock, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Opening, WeekDay } from "@/modules/stores/types";

const DAY_KEYS: WeekDay[] = ["1", "2", "3", "4", "5", "6", "0"];

const DAY_LABELS: Record<WeekDay, string> = {
  "0": "週日",
  "1": "週一",
  "2": "週二",
  "3": "週三",
  "4": "週四",
  "5": "週五",
  "6": "週六",
};

interface Props {
  store: {
    name: string;
    phone?: string;
    address?: string;
    bannerUrl?: string;
    opening: Opening;
  };
}

export function StoreClosed({ store }: Props) {
  const today = String(new Date().getDay()) as WeekDay;

  return (
    <div className="flex flex-col min-h-dvh bg-primary/5">
      {store.bannerUrl && (
        <div className="relative w-full aspect-[3/1]">
          <Image
            src={store.bannerUrl}
            alt={store.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="p-6 space-y-6 max-w-md w-full mx-auto">
        <div className="text-center space-y-2">
          <p className="text-3xl font-bold text-primary">{store.name}</p>
          <p className="text-lg text-muted-foreground">目前未營業</p>
        </div>

        <Card>
          <CardContent className="py-4 space-y-4 text-base">
            {store.phone && (
              <div className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-primary" />
                <a href={`tel:${store.phone}`}>{store.phone}</a>
              </div>
            )}
            {store.address && (
              <div className="flex items-center gap-3">
                <MapPin className="size-5 shrink-0 text-primary" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {store.address}
                </a>
              </div>
            )}
            <div className="flex gap-3">
              <Clock className="size-5 shrink-0 text-primary mt-1" />
              <div className="flex-1 space-y-1">
                {DAY_KEYS.map((day) => {
                  const slots = store.opening.weekly[day];
                  const isToday = day === today;
                  return (
                    <div
                      key={day}
                      className={`flex gap-6 ${isToday ? "text-primary" : ""}`}
                    >
                      <span className="w-12 shrink-0 font-semibold ">
                        {DAY_LABELS[day]}
                      </span>
                      <span
                        className={`tabular-nums ${
                          isToday ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {slots.length === 0
                          ? "未營業"
                          : slots.map((s) => `${s.open}-${s.close}`).join("、")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
