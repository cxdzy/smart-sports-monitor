export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/weather') {
      const q = url.searchParams.get('q');
      const days = url.searchParams.get('days') || '1';

      if (!q) {
        return new Response(JSON.stringify({ error: { message: 'Missing q parameter.' } }), {
          status: 400,
          headers: { 'content-type': 'application/json; charset=utf-8' }
        });
      }

      const apiKey = env.WEATHER_API_KEY || env.VITE_WEATHER_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: { message: 'Weather API key is not configured on server.' } }), {
          status: 500,
          headers: { 'content-type': 'application/json; charset=utf-8' }
        });
      }

      const upstreamUrl = `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q)}&days=${encodeURIComponent(days)}&aqi=no`;
      const upstreamRes = await fetch(upstreamUrl);
      const payload = await upstreamRes.text();

      return new Response(payload, {
        status: upstreamRes.status,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'public, max-age=300'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
