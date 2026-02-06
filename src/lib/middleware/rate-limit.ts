type RateLimitStore = {
  count: number;
  lastReset: number;
};

const rateLimitMap = new Map<string, RateLimitStore>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

/**
 * Checks if the given IP has exceeded the rate limit.
 * @param ip The IP address to check.
 * @returns An object containing success status.
 */
export function checkRateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (now - record.lastReset > WINDOW_MS) {
    // Reset window
    record.count = 1;
    record.lastReset = now;
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: MAX_REQUESTS - record.count };
}
