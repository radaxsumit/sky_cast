import { clientIp, createRateLimiter, handleProxy } from './api/_lib/weatherapi.js';

// Dev-only twin of the Vercel functions in /api, so `npm run dev` works without `vercel dev`.
export default function weatherProxy(env) {
  const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });
  return {
    name: 'skycast-weather-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const match = url.pathname.match(/^\/api\/(weather|search)$/);
        if (!match) return next();
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Allow', 'GET');
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
        const params = Object.fromEntries(url.searchParams);
        const { status, body, headers } = await handleProxy(match[1], params, env.WEATHER_API_KEY, {
          headers: req.headers,
          ip: clientIp(req.headers, req.socket.remoteAddress),
          limiter,
        });
        res.statusCode = status;
        for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
        res.end(JSON.stringify(body));
      });
    },
  };
}
