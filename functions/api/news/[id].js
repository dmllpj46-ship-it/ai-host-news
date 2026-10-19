/**
 * GET /api/news/:id
 *   Returns a single news item by ID from KV.
 */

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const kv = env.AI_NEWS;

  if (!kv) {
    return new Response(
      JSON.stringify({ error: 'KV namespace AI_NEWS not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const val = await kv.get(params.id, { type: 'json' });
    if (!val) {
      return new Response(
        JSON.stringify({ error: 'News item not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ news: val }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}