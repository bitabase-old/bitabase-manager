const config = require('./config');
const createServer = require('./server');

createServer(config, function (error, server) {
  if (error) {
    throw error;
  }

  console.log(`[bitabase-manager] Listening on port ${server.address().address}:${server.address().port}`);
});
