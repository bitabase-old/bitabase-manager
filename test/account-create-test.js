const test = require('tape')
const httpRequest = require('./helpers/httpRequest')
const reset = require('./helpers/reset')
const server = require('../server')

test('account: create a new account with validation errors', async t => {
  t.plan(2)
  await reset()

  await server.start()

  const response = await httpRequest('/api/accounts', {
    method: 'post'
  })

  t.equal(response.status, 422)

  t.deepEqual(response.data, {
    errors: {
      email: 'email is a required field',
      password: 'password is a required field'
    }
  })

  await server.stop()
})

test('account: create a new account', async t => {
  t.plan(2)
  await reset()

  await server.start()

  const response = await httpRequest('/api/accounts', {
    method: 'post',
    data: {
      email: 'test@example.com',
      password: 'password'
    }
  })

  t.equal(response.status, 200)

  t.deepEqual(response.data, {
    email: 'test@example.com'
  })

  await server.stop()
})
