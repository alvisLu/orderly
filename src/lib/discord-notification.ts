export type DiscordOrderPayload = {
  takeNumber: number | null;
  total: number | string;
  tableName?: string | null;
  userNote?: string | null;
  createdAt: Date;
  lineItems: Array<{
    productName: string;
    quantity: number;
    price: number | string;
  }>;
};

const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 16_000];

function buildEmbed(payload: DiscordOrderPayload) {
  const itemsValue =
    payload.lineItems
      .map((it) => `${it.productName} x${it.quantity}`)
      .join("\n") || "(無品項)";

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [];
  if (payload.tableName) {
    fields.push({ name: "桌號", value: payload.tableName, inline: true });
  }
  fields.push({
    name: "金額",
    value: `NT$${payload.total}`,
    inline: true,
  });
  fields.push({ name: "品項", value: itemsValue });
  if (payload.userNote) {
    fields.push({ name: "備註", value: payload.userNote });
  }

  return {
    title: `新訂單 #${payload.takeNumber ?? "?"}`,
    color: 0x22c55e,
    fields,
    timestamp: payload.createdAt.toISOString(),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendDiscordOrderNotification(
  webhookUrl: string,
  payload: DiscordOrderPayload,
): Promise<void> {
  const body = JSON.stringify({ embeds: [buildEmbed(payload)] });

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (res.ok) return;

      const retriable = res.status >= 500 || res.status === 429;
      if (!retriable) {
        console.error("Discord notification failed (non-retriable)", {
          takeNumber: payload.takeNumber,
          status: res.status,
          statusText: res.statusText,
        });
        return;
      }

      if (attempt === MAX_ATTEMPTS - 1) {
        console.error("Discord notification failed after retries", {
          takeNumber: payload.takeNumber,
          status: res.status,
          statusText: res.statusText,
        });
        return;
      }
    } catch (error) {
      if (attempt === MAX_ATTEMPTS - 1) {
        console.error("Discord notification failed after retries", {
          takeNumber: payload.takeNumber,
          error,
        });
        return;
      }
    }
    await sleep(BACKOFF_MS[attempt]);
  }
}
