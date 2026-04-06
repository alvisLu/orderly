"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    window.location.reload();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="重新整理"
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
    >
      <RotateCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
    </button>
  );
}
