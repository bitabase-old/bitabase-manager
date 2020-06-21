const { promisify } = require('util');

const rqlite = require('rqlite-fp');
const axios = require('axios');
const sendJsonResponse = require('../../../../modules/sendJsonResponse');
const parseSession = require('../../../../modules/sessions');
const setCrossDomainOriginHeaders = require('../../../../modules/setCrossDomainOriginHeaders');

async function getLogsFromAllServers (config, databaseName, collectionName, query) {
  const promises = config.servers.map(server => {
    return axios({
      method: 'get',
      validateStatus: () => true,
      url: `${server}/v1/databases/${databaseName}/logs/${collectionName}${query.trim()}`
    });
  });

  const serverResponses = await Promise.all(promises);
  return serverResponses.flatMap(serverResponse => {
    return serverResponse.data;
  });
}

module.exports = function ({ db, config }) {
  return async function list (request, response, params) {
    setCrossDomainOriginHeaders(config, request, response);

    const session = await parseSession(db, request);

    if (!session) {
      return sendJsonResponse(401, { errors: ['invalid session provided'] }, response);
    }

    const sqlFindDatabase = `
        SELECT databases.*
          FROM databases
     LEFT JOIN database_users
            ON database_users.database_id = databases.id
        WHERE name = ?
          AND database_users.user_id = ?
    `;

    const database = await promisify(rqlite.getOne)(db, sqlFindDatabase, [params.databaseName, session.user.id]);
    if (!database) {
      return sendJsonResponse(404, { error: 'database not found' }, response);
    }

    const sqlFindCollections = `
        SELECT *
          FROM collections
        WHERE database_id = ?
          AND name = ?
    `;

    const collection = await promisify(rqlite.getOne)(db, sqlFindCollections, [database.id, params.collectionName]);

    if (!collection) {
      return sendJsonResponse(404, { error: 'collection not found' }, response);
    }

    const parsedUrl = new URL(`https://url.test${request.url}`);

    try {
      const logs = await getLogsFromAllServers(config, database.name, collection.name, parsedUrl.search);

      sendJsonResponse(200, logs, response);
    } catch (error) {
      console.log(error);
      sendJsonResponse(500, { error: 'Unexpected Server Error' }, response);
    }
  };
};
