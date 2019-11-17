const test = require('tape');
const httpRequest = require('../helpers/httpRequest');
const reset = require('../helpers/reset');
const server = require('../../server');

const createUser = () =>
  httpRequest('/v1/users', {
    method: 'post',
    data: {
      email: 'test@example.com',
      password: 'password'
    }
  });

test('session: create a new session with validation errors', async t => {
  t.plan(2);
  await reset();

  await server.start();

  const response = await httpRequest('/v1/sessions', {
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
});

test('session: create a new session wrong user', async t => {
  t.plan(2);
  await reset();

  await server.start();

  const response = await httpRequest('/v1/sessions', {
    method: 'post',
    data: {
      email: 'test@example.com',
      password: 'password'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    error: 'unauthorised'
  });

  await server.stop();
});

test('session: create a new session correct user but wrong password', async t => {
  t.plan(2);
  await reset();

  await server.start();

  await createUser();

  const response = await httpRequest('/v1/sessions', {
    method: 'post',
    data: {
      email: 'test@example.com',
      password: 'wrongpassword'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    error: 'unauthorised'
  });

  await server.stop();
});

test('session: create a new session correct user and password', async t => {
  t.plan(4);
  await reset();

  await server.start();

  await createUser();

  const response = await httpRequest('/v1/sessions', {
    method: 'post',
    data: {
      email: 'test@example.com',
      password: 'password'
    }
  });

  t.equal(response.status, 200);
  t.equal(response.data.sessionId.length, 36);
  t.equal(response.data.sessionSecret.length, 64);
  t.ok(response.data.user);

  await server.stop();
});
