const sqlite = require('sqlite-fp');
const http = require('http');
const finalStream = require('final-stream');

function doQuery (db, url, response) {
  sqlite.getAll(db, url.searchParams.get('q'), function (error, results) {
    if (error) {
      console.log(error);
      throw new Error('errors not handled in mock rqlite server');
    }

    response.writeHead(200, 'application/json');
    const reply = {
      results: [
        {
          columns: Object.keys(results[0] || {}),
          types: [
            ''
          ],
          values: (results || []).map(result => Object.values(result)),
          time: 1
        }
      ],
      time: 1
    };

    response.end(JSON.stringify(reply));
  });
}

function doExecute (db, query, response) {
  sqlite.run(db, query, function (error, result) {
    if (error) {
      console.log(error);
      throw new Error('errors not handled in mock rqlite server');
    }

    response.writeHead(200, 'application/json');
    const reply = {
      results: [
        {
          last_insert_id: result.lastID,
          rows_affected: result.changes
        }
      ]
    };

    response.end(JSON.stringify(reply));
  });
}

module.exports = async function (callback) {
  let db;
  sqlite.connect(':memory:', function (error, connection) {
    if (error) {
      throw error;
    }
    db = connection;
  });

  const server = http.createServer(function (request, response) {
    // console.log('Mock rqlite: ' + request.method + ' -> ' + request.url);

    const url = new URL(`http://localhost${request.url}`);

    if (url.pathname === '/db/query') {
      return doQuery(db, url, response);
    }

    if (url.pathname === '/db/execute') {
      finalStream(request, JSON.parse, function (error, body) {
        if (error) {
          console.log(error);
          throw new Error('rqlite mock endpoint error');
        }
        doExecute(db, body[0], response);
      });
      return;
    }

    throw new Error('rqlite mock endpoint not implemented for ' + request.url);
  });

  server.on('listening', () => {
    callback(null, {
      stop: () => {
        server.close();
      }
    });
  });

  server.listen(4001);
};
