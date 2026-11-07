// Best-effort client IP for rate limiting guests. Netlify sets x-nf-client-connection-ip;
// elsewhere the first x-forwarded-for entry is the original client.
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-nf-client-connection-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
