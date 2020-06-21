const { promisify } = require('util');

const rqlite = require('rqlite-fp');
const uuidv4 = require('uuid/v4');
const verifyHash = require('pbkdf2-wrapper/verifyHash');

const createRandomString = require('../../modules/createRandomString');
const parseJsonBody = require('../../modules/parseJsonBody');
const sendJsonResponse = require('../../modules/sendJsonResponse');
const setCrossDomainOriginHeaders = require('../../modules/setCrossDomainOriginHeaders');

function validate (data) {
  const validations = [
    { email: data && data.email ? '' : 'email is a required field' },
    { password: data && data.password ? '' : 'password is a required field' }
  ].filter(item => !!Object.values(item)[0]);

  if (validations.length > 0) {
    return Object.assign.apply(null, validations);
  }
}

function insertSession (db, { sessionId, sessionSecret, userId }) {
  return promisify(rqlite.run)(db,
    'INSERT INTO sessions (id, secret, user_id, date_created) VALUES (?, ?, ?, ?)',
    [sessionId, sessionSecret, userId, Date.now()]
  );
}

module.exports = function ({ db, config }) {
  return async function (request, response, params) {
    try {
      setCrossDomainOriginHeaders(config, request, response);

      const data = await parseJsonBody(request);

      const errors = validate(data);
      if (errors) {
        return sendJsonResponse(422, { errors }, response);
      }

      const user = await promisify(rqlite.getOne)(db, 'SELECT * FROM users WHERE email = ?', [data.email]);
      if (!user) {
        return sendJsonResponse(401, { error: 'unauthorised' }, response);
      }

      const passwordMatch = await verifyHash(data.password, user.password, config.passwordHash);
      if (!passwordMatch) {
        return sendJsonResponse(401, { error: 'unauthorised' }, response);
      }

      const sessionId = uuidv4();
      const sessionSecret = await createRandomString(64);
      await insertSession(db, {
        sessionId,
        sessionSecret,
        userId: user.id
      });

      delete user.password;

      sendJsonResponse(200, { sessionId, sessionSecret, user }, response);
    } catch (error) {
      console.log(error);
      sendJsonResponse(500, {}, response);
    }
  };
};
