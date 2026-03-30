export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/weather') {
      if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: { message: 'Method not allowed.' } }), {
          status: 405,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'allow': 'GET'
          }
        });
      }

      const q = url.searchParams.get('q');
      const parsedDays = Number.parseInt(url.searchParams.get('days') || '1', 10);
      const days = Number.isFinite(parsedDays) ? Math.min(Math.max(parsedDays, 1), 7) : 1;

      if (!q || q.trim().length === 0 || q.length > 100) {
        return new Response(JSON.stringify({ error: { message: 'Missing q parameter.' } }), {
          status: 400,
          headers: { 'content-type': 'application/json; charset=utf-8' }
        });
      }

      const apiKey = env.WEATHER_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: { message: 'Weather API key is not configured on server.' } }), {
          status: 500,
          headers: { 'content-type': 'application/json; charset=utf-8' }
        });
      }

      const cleanQuery = q.trim();
      const cacheUrl = new URL(request.url);
      cacheUrl.search = `q=${encodeURIComponent(cleanQuery)}&days=${days}`;
      const cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });
      const cache = caches.default;
      const cached = await cache.match(cacheKey);

      if (cached) {
        return cached;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      let upstreamRes;
      try {
        const upstreamUrl = `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(cleanQuery)}&days=${days}&aqi=no`;
        upstreamRes = await fetch(upstreamUrl, { signal: controller.signal });
      } catch {
        return new Response(JSON.stringify({ error: { message: 'Upstream weather service timeout.' } }), {
          status: 504,
          headers: { 'content-type': 'application/json; charset=utf-8' }
        });
      } finally {
        clearTimeout(timeout);
      }

      const payload = await upstreamRes.text();

      const response = new Response(payload, {
        status: upstreamRes.status,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'public, max-age=300, s-maxage=300'
        }
      });

      if (upstreamRes.ok) {
        await cache.put(cacheKey, response.clone());
      }

      return response;
    }

    return env.ASSETS.fetch(request);
  }
};
