/**
 * GET /api/news?limit=N
 *   Returns list of news items from KV, newest first.
 *   Response: { news: [...], updated: ISO string, count: N }
 *
 * POST /api/news
 *   Creates a new news item in KV.
 *   Requires header: X-API-Key: news-api-key-2026
 *   Body: { title, content, tags[], summary?, date? }
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  try {
    const kv = env.AI_NEWS;
    if (!kv) {
      return new Response(
        JSON.stringify({ error: 'KV namespace AI_NEWS not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // List all keys in KV
    const keys = await kv.list({ limit: 1000 });
    const news = [];

    for (const key of keys.keys) {
      try {
        const val = await kv.get(key.name, { type: 'json' });
        if (val) news.push(val);
      } catch (e) {
        // skip corrupt entries
      }
    }

    // Sort by date descending
    news.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const limited = news.slice(0, limit);
    const updated = news.length > 0 ? news[0].date : new Date().toISOString();

    return new Response(
      JSON.stringify({ news: limited, updated, count: limited.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Validate API key
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey !== 'news-api-key-2026') {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing API key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const kv = env.AI_NEWS;
  if (!kv) {
    return new Response(
      JSON.stringify({ error: 'KV namespace AI_NEWS not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { title, content, tags = [], summary = '', date } = body;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'title and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Deduplicate by normalized title: re-posting the same headline updates
    // the existing entry instead of creating a duplicate.
    const normalized = String(title).replace(/\s+/g, ' ').trim().toLowerCase();
    const allKeys = await kv.list({ limit: 1000 });
    let existing = null;
    for (const key of allKeys.keys) {
      const val = await kv.get(key.name, { type: 'json' });
      if (val && val.title && val.title.replace(/\s+/g, ' ').trim().toLowerCase() === normalized) {
        existing = { id: key.name, item: val };
        break;
      }
    }

    if (existing) {
      const updatedItem = {
        ...existing.item,
        id: existing.id,
        title,
        content,
        tags: Array.isArray(tags) ? tags : existing.item.tags || [],
        summary: summary || existing.item.summary || '',
        date: date || existing.item.date || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      };
      await kv.put(existing.id, JSON.stringify(updatedItem));

      return new Response(
        JSON.stringify({ success: true, updated: true, news: updatedItem }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const id = (title.replace(/[^\w\u4e00-\u9fff]/g, '-') + '-' + Date.now()).toLowerCase();
    const newsItem = {
      id,
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      summary,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    await kv.put(id, JSON.stringify(newsItem));

    return new Response(
      JSON.stringify({ success: true, news: newsItem }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}