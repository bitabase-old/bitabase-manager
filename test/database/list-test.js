const test = require('tape')
const httpRequest = require('../helpers/httpRequest')
const reset = require('../helpers/reset')
const { createUserAndSession } = require('../helpers/session')
const server = require('../../server')

const createDatabase = (headers, data) =>
  httpRequest('/v1/databases', {
    method: 'post',
    headers,
    data: data || {
      name: 'testing'
    }
  })

test('database: list databases -> no session', async t => {
  t.plan(2)
  await reset()

  await server.start()

  const response = await httpRequest('/v1/databases')

  t.equal(response.status, 401)

  t.deepEqual(response.data, {
    errors: { id: 'invalid session provided' }
  })

  await server.stop()
})

test('database: list databases -> not found', async t => {
  t.plan(2)
  await reset()

  await server.start()

  const session = await createUserAndSession()

  const response = await httpRequest('/v1/databases', {
    method: 'get',
    headers: session.asHeaders
  })

  t.equal(response.status, 200)
  t.equal(response.data.length, 0)

  await server.stop()
})

test('database: list databases', async t => {
  t.plan(9)
  await reset()

  await server.start()

  const session = await createUserAndSession()
  await createDatabase(session.asHeaders)

  const response = await httpRequest('/v1/databases', {
    method: 'get',
    headers: session.asHeaders
  })

  t.equal(response.status, 200)
  t.equal(response.data.length, 1)
  t.equal(response.data[0].name, 'testing')
  t.equal(response.data[0].total_reads, 0)
  t.equal(response.data[0].total_writes, 0)
  t.equal(response.data[0].total_space, 0)
  t.ok(response.data[0].schema)
  t.ok(response.data[0].id)
  t.ok(response.data[0].date_created)

  await server.stop()
})

test('database: list databases -> only mine', async t => {
  t.plan(9)
  await reset()

  await server.start()

  const firstSession = await createUserAndSession()
  await createDatabase(firstSession.asHeaders)

  const secondSession = await createUserAndSession()
  await createDatabase(secondSession.asHeaders)

  const response = await httpRequest('/v1/databases', {
    method: 'get',
    headers: firstSession.asHeaders
  })

  t.equal(response.status, 200)
  t.equal(response.data.length, 1)
  t.equal(response.data[0].name, 'testing')
  t.equal(response.data[0].total_reads, 0)
  t.equal(response.data[0].total_writes, 0)
  t.equal(response.data[0].total_space, 0)
  t.ok(response.data[0].schema)
  t.ok(response.data[0].id)
  t.ok(response.data[0].date_created)

  await server.stop()
})
