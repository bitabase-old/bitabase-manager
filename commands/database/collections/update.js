const axios = require('axios');
const sendJsonResponse = require('../../../modules/sendJsonResponse');
const parseJsonBody = require('../../../modules/parseJsonBody');
const parseSession = require('../../../modules/sessions');
const setCrossDomainOriginHeaders = require('../../../modules/setCrossDomainOriginHeaders');

const config = require('../../../config');

async function syncServersWithCollectionConfig (databaseName, collectionName, schema) {
  const promises = config.servers.map(server => {
    return axios({
      method: 'put',
      url: `${server}/v1/databases/${databaseName}/collections/${collectionName}`,
      data: schema,
      validateStatus: statusCode =>
        statusCode >= 200 ||
        statusCode < 300 ||
        statusCode === 404
    });
  });

  await Promise.all(promises);
}

async function updateCollection (db, collectionId, data) {
  const sqlUpdateDatabase = `
    UPDATE collections
       SET schema = ?
     WHERE id = ?
  `;

  return db.run(sqlUpdateDatabase, [JSON.stringify(data), collectionId]);
}

module.exports = function ({ db }) {
  return async function read (request, response, params) {
    setCrossDomainOriginHeaders(request, response);

    const data = await parseJsonBody(request);

    if (!data) {
      return sendJsonResponse(422, { error: 'no post body was provided' }, response);
    }

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

    const database = await db.get(sqlFindDatabase, [params.databaseName, session.user.id]);
    if (!database) {
      return sendJsonResponse(404, { error: 'database not found' }, response);
    }

    const sqlFindCollections = `
        SELECT *
          FROM collections
        WHERE database_id = ?
          AND name = ?
    `;

    const collection = await db.get(sqlFindCollections, [database.id, params.collectionName]);

    if (!collection) {
      return sendJsonResponse(404, { error: 'collection not found' }, response);
    }

    if (collection.name !== data.name) {
      return sendJsonResponse(400, { name: 'can not be changed' }, response);
    }

    await updateCollection(db, collection.id, data);

    await syncServersWithCollectionConfig(database.name, collection.name, data);

    sendJsonResponse(200, data, response);
  };
};
