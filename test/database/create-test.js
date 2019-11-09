const test = require('tape')
const httpRequest = require('../helpers/httpRequest')
const reset = require('../helpers/reset')
const server = require('../../server')

test('database: create a new database -> no session', async t => {
  t.plan(2)
  await reset()

  await server.start()

  const response = await httpRequest('/api/databases', {
    method: 'post',
    data: {
      name: 'testing'
    }
  })

  t.equal(response.status, 401)

  t.deepEqual(response.data, {
    errors: { id: 'invalid session provided' }
  })

  await server.stop()
})
