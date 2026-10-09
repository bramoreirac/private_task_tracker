import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../src/app.js';

test('health is public and authentication is required for tasks', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { status: 'ok' });

  const tasksResponse = await fetch(`${baseUrl}/api/tasks`);
  assert.equal(tasksResponse.status, 401);
  const tasksBody = await tasksResponse.json();
  assert.equal(tasksBody.error.code, 'unauthorized');

  const postTasksResponse = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(postTasksResponse.status, 401);
  const postTasksBody = await postTasksResponse.json();
  assert.equal(postTasksBody.error.code, 'unauthorized');

  const patchTasksResponse = await fetch(`${baseUrl}/api/tasks/00000000-0000-0000-0000-000000000000`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(patchTasksResponse.status, 401);
  const patchTasksBody = await patchTasksResponse.json();
  assert.equal(patchTasksBody.error.code, 'unauthorized');

  const deleteTasksResponse = await fetch(`${baseUrl}/api/tasks/00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(deleteTasksResponse.status, 401);
  const deleteTasksBody = await deleteTasksResponse.json();
  assert.equal(deleteTasksBody.error.code, 'unauthorized');

});
