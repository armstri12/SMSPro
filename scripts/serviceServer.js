const http = require('http');

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function startService({ serviceName, port, routes }) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || `127.0.0.1:${port}`}`);

    if (url.pathname === '/health') {
      sendJson(res, 200, { service: serviceName, status: 'ok' });
      return;
    }

    const key = `${req.method} ${url.pathname}`;
    const handler = routes[key];

    if (!handler) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    try {
      const body = await parseBody(req);
      const { status = 200, payload = {} } = await handler({ req, url, body });
      sendJson(res, status, payload);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
  });

  server.listen(port, () => {
    console.log(`${serviceName} listening on ${port}`);
  });

  return server;
}

module.exports = { startService };
