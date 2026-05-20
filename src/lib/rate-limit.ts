import { prisma } from "@/lib/prisma";
import { RateLimitedError } from "@/lib/http-error";

interface RateLimitOptions {
  scope: string;
  limit: number;
  windowSeconds: number;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function enforceRateLimit(
  identifier: string,
  { scope, limit, windowSeconds }: RateLimitOptions
): Promise<void> {
  const windowMs = windowSeconds * 1000;
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const key = `${scope}:${identifier}:${windowStart}`;
  const expiresAt = new Date(windowStart + windowMs);

  const bucket = await prisma.rateLimitBucket.upsert({
    where: { key },
    create: { key, count: 1, expiresAt },
    update: { count: { increment: 1 } },
  });

  if (bucket.count > limit) throw new RateLimitedError();
}
