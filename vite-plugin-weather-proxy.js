import { handleProxy } from './api/_lib/weatherapi.js';

// Dev-only twin of the Vercel functions in /api, so `npm run dev` works without `vercel dev`.
export default function weatherProxy(env) {
  return {
    name: 'skycast-weather-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const match = url.pathname.match(/^\/api\/(weather|search)$/);
        if (!match) return next();
        const params = Object.fromEntries(url.searchParams);
        const { status, body, headers } = await handleProxy(match[1], params, env.WEATHER_API_KEY);
        res.statusCode = status;
        for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
        res.end(JSON.stringify(body));
      });
    },
  };
}
