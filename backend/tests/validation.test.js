import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../src/app.js';

test('authenticated task requests reject invalid input', async (t) => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
  t.after(() => {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
    else process.env.SUPABASE_PUBLISHABLE_KEY = originalKey;
  });

  const realFetch = globalThis.fetch;
  let authRequests = 0;
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.origin === 'https://test.supabase.co') {
      assert.equal(url.pathname, '/auth/v1/user');
      authRequests += 1;
      return new Response(JSON.stringify({
        id: '00000000-0000-4000-8000-000000000001',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test@example.com',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return realFetch(input, options);
  });

  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  for (const title of ['   ', 'x'.repeat(201)]) {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'invalid_task');
  }

  assert.equal(authRequests, 2);
});
