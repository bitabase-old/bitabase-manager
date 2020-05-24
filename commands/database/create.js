const { promisify } = require('util');

const rqlite = require('rqlite-fp');
const uuidv4 = require('uuid/v4');

const parseJsonBody = require('../../modules/parseJsonBody');
const sendJsonResponse = require('../../modules/sendJsonResponse');
const parseSession = require('../../modules/sessions');
const setCrossDomainOriginHeaders = require('../../modules/setCrossDomainOriginHeaders');

function validate (data) {
  if (!data) {
    return { body: 'no post body was provided' };
  }
  const validations = [
    { name: data.name && !data.name.match(/[^a-z0-9-]/gi, '') ? '' : 'name must only contain letters, numbers and dashes' },
    { name: data.name && !data.name.startsWith('-') ? '' : 'name must not start with a dash' },
    { name: data.name && !data.name.endsWith('-') ? '' : 'name must not end with a dash' },
    { name: data.name ? '' : 'name is a required field' }
  ].filter(item => !!Object.values(item)[0]);

  if (validations.length > 0) {
    return Object.assign.apply(null, validations);
  }
}

module.exports = function ({ db }) {
  return async function (request, response, params) {
    setCrossDomainOriginHeaders(request, response);

    const data = await parseJsonBody(request);
    const session = await parseSession(db, request);

    const errors = validate(data);
    if (errors) {
      return sendJsonResponse(422, { errors }, response);
    }

    if (!session) {
      return sendJsonResponse(401, { errors: ['invalid session provided'] }, response);
    }

    const existing = await promisify(rqlite.getOne)(db, 'SELECT * FROM databases WHERE name = ?', [data.name]);
    if (existing) {
      return sendJsonResponse(422, { errors: { name: 'name has already been taken' } }, response);
    }

    data.id = uuidv4();

    await promisify(rqlite.run)(db, 'INSERT INTO databases (id, name, date_created) VALUES (?, ?, ?)', [
      data.id, data.name, Date.now()
    ]);

    await promisify(rqlite.run)(db, 'INSERT INTO database_users (user_id, database_id, role, date_created) VALUES (?, ?, ?, ?)', [
      session.user.id, data.id, 'owner', Date.now()
    ]);

    response.writeHead(201, {
      'Content-Type': 'application/json'
    });
    response.end(JSON.stringify(data));
  };
};
