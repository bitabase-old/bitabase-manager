const http = require('http');

function createServer (fn, port) {
  let server;
  return {
    start: () => {
      server = http.createServer(fn).listen(port);
    },
    stop: () => server.close()
  };
}

module.exports = createServer;
