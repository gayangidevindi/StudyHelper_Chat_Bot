const requestWindows = new Map<string, number[]>();

export function getClientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export function checkRateLimit(request: Request, route: string, limit: number) {
  const key = `${route}:${getClientIp(request)}`;
  const now = Date.now();
  const windowStart = now - 60_000;
  const timestamps = (requestWindows.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (timestamps.length >= limit) {
    requestWindows.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  requestWindows.set(key, timestamps);
  return true;
}

// This resets on server restart and is not reliable across multiple serverless instances, but is sufficient for current scale.