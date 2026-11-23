import { handleProxy } from './_lib/weatherapi.js';

export default async function handler(req, res) {
  const { status, body, headers } = await handleProxy('weather', req.query, process.env.WEATHER_API_KEY);
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.status(status).json(body);
}
