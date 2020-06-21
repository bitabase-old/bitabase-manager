const { promisify } = require('util');

const rqlite = require('rqlite-fp');
const uuidv4 = require('uuid/v4');
const hashText = require('pbkdf2-wrapper/hashText');

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

async function insertUser (db, config, data) {
  const password = await hashText(data.password, config.passwordHash);

  await promisify(rqlite.run)(db,
    'INSERT INTO users (id, email, password, date_created) VALUES (?, ?, ?, ?)',
    [data.id, data.email, password, Date.now()]
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

      data.id = uuidv4();
      await insertUser(db, config, data);

      sendJsonResponse(200, { id: data.id, email: data.email }, response);
    } catch (error) {
      console.log(error);
      sendJsonResponse(500, {}, response);
    }
  };
};
