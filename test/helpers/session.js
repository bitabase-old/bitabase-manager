const httpRequest = require('./httpRequest')

const createUser = (user) =>
  httpRequest('/v1/users', {
    method: 'post',
    data: user || {
      email: 'test@example.com',
      password: 'password'
    }
  })

const createSession = (user) =>
  httpRequest('/v1/sessions', {
    method: 'post',
    data: user || {
      email: 'test@example.com',
      password: 'password'
    }
  })

const createUserAndSession = async () => {
  await createUser()
  const session = await createSession()
  return {
    asHeaders: {
      'X-Session-Id': session.data.sessionId,
      'X-Session-Secret': session.data.sessionSecret
    },
    ...session.data
  }
}

module.exports = {
  createUser,
  createSession,
  createUserAndSession
}
