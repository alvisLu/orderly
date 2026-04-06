"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { pathLabels } from "@/config/nav";

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {segments.length === 0 ? (
        <span className="text-foreground font-medium">主選單</span>
      ) : (
        <Link href="/" className="hover:text-foreground transition-colors">
          主選單
        </Link>
      )}
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = pathLabels[href] ?? seg;
        const isLast = i === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1.5">
            <span>/</span>
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
