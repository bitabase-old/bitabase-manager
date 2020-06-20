const test = require('tape');

const righto = require('righto');

const httpRequest = require('../helpers/httpRequest');
const createMockRqliteServer = require('../helpers/createMockRqliteServer');
const createServer = require('../helpers/createServer');
const { createUserAndSession } = require('../helpers/session');

test('database: create a new database -> no session', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const response = await httpRequest('/v1/databases', {
    method: 'post',
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    errors: ['invalid session provided']
  });

  await server.stop();
  await mockRqlite.stop();
});

test('database: create a new database -> no post body', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const session = await createUserAndSession();

  const response = await httpRequest('/v1/databases', {
    method: 'post',
    headers: session.asHeaders
  });

  t.equal(response.status, 422);
  t.ok(response.data.errors.body, 'no post body was provided');

  await server.stop();
  await mockRqlite.stop();
});

test('database: create a new database', async t => {
  t.plan(3);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const session = await createUserAndSession();

  const response = await httpRequest('/v1/databases', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 201);

  t.ok(response.data.id);
  t.equal(response.data.name, 'testing');

  await server.stop();
  await mockRqlite.stop();
});

test('database: create a new database -> duplicate name', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const session = await createUserAndSession();

  await httpRequest('/v1/databases', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  const response = await httpRequest('/v1/databases', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 422);
  t.equal(response.data.errors.name, 'name has already been taken');

  await server.stop();
  await mockRqlite.stop();
});
