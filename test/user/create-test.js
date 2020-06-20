const test = require('tape');
const righto = require('righto');

const httpRequest = require('../helpers/httpRequest');

const createMockRqliteServer = require('../helpers/createMockRqliteServer');
const createServer = require('../helpers/createServer');

test('user: create a new user with validation errors', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const response = await httpRequest('/v1/users', {
    method: 'post'
  });

  t.equal(response.status, 422);

  t.deepEqual(response.data, {
    errors: {
      email: 'email is a required field',
      password: 'password is a required field'
    }
  });

  await server.stop();
  await mockRqlite.stop();
});

test('user: create a new user', async t => {
  t.plan(3);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const response = await httpRequest('/v1/users', {
    method: 'post',
    data: {
      email: 'test@example.com',
      password: 'password'
    }
  });

  t.equal(response.status, 200);
  t.equal(response.data.id.length, 36);
  t.equal(response.data.email, 'test@example.com');

  await server.stop();
  await mockRqlite.stop();
});
