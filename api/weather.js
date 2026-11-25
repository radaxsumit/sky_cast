import { clientIp, createRateLimiter, handleProxy } from './_lib/weatherapi.js';

// One limiter per warm function instance: 60 requests per minute per visitor.
const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { status, body, headers } = await handleProxy('weather', req.query, process.env.WEATHER_API_KEY, {
    headers: req.headers,
    ip: clientIp(req.headers),
    limiter,
  });
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  return res.status(status).json(body);
}
