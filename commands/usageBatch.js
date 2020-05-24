const { promisify } = require('util');
const rqlite = require('rqlite-fp');

const sendJsonResponse = require('../modules/sendJsonResponse');
const parseJsonBody = require('../modules/parseJsonBody');
const setCrossDomainOriginHeaders = require('../modules/setCrossDomainOriginHeaders');

module.exports = function ({ config, db }) {
  return async function (request, response, params) {
    try {
      setCrossDomainOriginHeaders(request, response);

      if (request.headers['x-internal-secret'] !== config.secret) {
        throw new Error('Not allowed');
      }

      const data = await parseJsonBody(request);
      const promises = Object.keys(data).map(async eventType => {
        const [databaseName, collectionName, type] = eventType.split(':');
        const amount = data[eventType];
        if (!databaseName || !collectionName || !type || !amount) {
          return console.log('Error: parsing usageBatch:', { databaseName, collectionName, type, amount });
        }

        let columnToUpdate;
        if (type === 'write') {
          columnToUpdate = 'total_writes';
        }

        if (type === 'read') {
          columnToUpdate = 'total_reads';
        }

        const sqlFindCollections = `
            UPDATE collections
               SET ${columnToUpdate} = ${columnToUpdate} + ?
             WHERE collections.name = ?
               AND collections.database_id = (SELECT id FROM databases WHERE name = ?)
        `;

        await promisify(rqlite.run)(db, sqlFindCollections, [amount, collectionName, databaseName]);
      });

      await Promise.all(promises);

      sendJsonResponse(200, {}, response);
    } catch (error) {
      console.log(error);
      sendJsonResponse(500, {}, response);
    }
  };
};
