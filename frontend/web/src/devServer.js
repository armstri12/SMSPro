const http = require('http');

const port = Number(process.env.PORT || 4173);
const insightsBaseUrl = process.env.INSIGHTS_BASE_URL || 'http://127.0.0.1:4105';

const html = `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>SMSPro Dashboard</title></head>
<body>
  <h1>SMSPro Phase 1 Dashboard</h1>
  <pre id="status">Loading…</pre>
  <script>
    (async () => {
      const output = document.getElementById('status');
      try {
        const response = await fetch('${insightsBaseUrl}/v1/insights/dashboard?siteId=demo-site');
        if (!response.ok) throw new Error('Insights API unavailable');
        const data = await response.json();
        output.textContent = JSON.stringify({ mode: 'live', data }, null, 2);
      } catch (error) {
        output.textContent = JSON.stringify({ mode: 'mocked', data: { openActions: 2, overdueItems: 0, trainingCompletionRate: 100 } }, null, 2);
      }
    })();
  </script>
</body>
</html>`;

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ service: 'frontend-web', status: 'ok' }));
    return;
  }

  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(port, () => {
  console.log(`frontend listening on ${port}`);
});
