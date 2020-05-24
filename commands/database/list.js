const { promisify } = require('util');

const rqlite = require('rqlite-fp');

const sendJsonResponse = require('../../modules/sendJsonResponse');
const parseSession = require('../../modules/sessions');
const setCrossDomainOriginHeaders = require('../../modules/setCrossDomainOriginHeaders');

module.exports = function ({ db }) {
  return async function (request, response, params) {
    setCrossDomainOriginHeaders(request, response);

    const session = await parseSession(db, request);

    if (!session) {
      return sendJsonResponse(401, { errors: { id: 'invalid session provided' } }, response);
    }

    const sql = `
        SELECT databases.id as id,
             databases.name as name,
             ifnull(sum(collections.total_reads), 0) as total_reads,
             ifnull(sum(collections.total_writes), 0) as total_writes,
             ifnull(sum(collections.total_space), 0) as total_space,
             count(collections.id) as total_collections,
             databases.date_created
          FROM databases
     LEFT JOIN database_users
            ON database_users.database_id = databases.id
     LEFT JOIN collections
            ON collections.database_id = databases.id
         WHERE database_users.user_id = ?
      GROUP BY databases.id, databases.name
    `;
    const databaseRecords = await promisify(rqlite.getAll)(db, sql, [session.user.id]);

    response.writeHead(200, {
      'Content-Type': 'application/json'
    });

    response.end(JSON.stringify(databaseRecords));
  };
};
