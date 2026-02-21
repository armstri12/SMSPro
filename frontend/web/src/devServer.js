const http = require('http');

const port = Number(process.env.PORT || 4173);
const insightsBaseUrl = process.env.INSIGHTS_BASE_URL || 'http://127.0.0.1:4105';

const mockDashboard = {
  siteId: 'demo-site',
  openActions: 2,
  overdueItems: 1,
  trainingCompletionRate: 96,
  incidentRateTrend: [
    { period: '2026-01', incidentCount: 3 },
    { period: '2026-02', incidentCount: 2 },
    { period: '2026-03', incidentCount: 4 },
    { period: '2026-04', incidentCount: 1 }
  ],
  generatedAt: new Date().toISOString()
};

const styles = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, -apple-system, Segoe UI, sans-serif; background: #f3f4f6; color: #111827; }
.dashboard-shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
.sidebar { background: #111827; color: #f9fafb; padding: 24px; }
.sidebar nav { display: grid; gap: 12px; margin-top: 24px; }
.sidebar a { color: #d1d5db; text-decoration: none; }
.sidebar a.active { color: #ffffff; font-weight: 700; }
main { padding: 24px; display: grid; gap: 20px; }
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.topbar h1 { margin: 0; }
.topbar-actions { display: flex; gap: 8px; }
button { border: 0; border-radius: 10px; padding: 10px 14px; font-weight: 600; cursor: pointer; }
button.primary { background: #2563eb; color: white; }
button.secondary { background: #e5e7eb; color: #111827; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 16px; }
.kpi-card, .table-card, .trend-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.kpi-card h3 { margin: 0; font-size: 0.95rem; color: #6b7280; }
.kpi-value { font-size: 1.8rem; font-weight: 700; margin: 6px 0 0; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 10px 8px; }
.status-chip { padding: 3px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; text-transform: capitalize; }
.status-open { background: #dbeafe; color: #1d4ed8; }
.status-overdue { background: #fee2e2; color: #b91c1c; }
.status-complete { background: #d1fae5; color: #065f46; }
.trend-bars { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; align-items: end; min-height: 120px; margin-top: 12px; }
.trend-bar { background: linear-gradient(180deg, #60a5fa, #2563eb); border-radius: 8px 8px 0 0; position: relative; }
.trend-bar span { position: absolute; bottom: -24px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #6b7280; }
.meta { color: #6b7280; font-size: 0.9rem; margin-top: 8px; }
@media (max-width: 1024px) {
  .dashboard-shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .kpi-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
}
`;

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SMSPro Dashboard</title>
  <style>${styles}</style>
</head>
<body>
  <div id="app">Loading dashboard…</div>
  <script>
    const mockData = ${JSON.stringify(mockDashboard)};

    function renderDashboard(mode, data) {
      const trendMax = Math.max(...data.incidentRateTrend.map((entry) => entry.incidentCount), 1);
      const trendBars = data.incidentRateTrend.map((entry) => {
        const barHeight = Math.max(12, Math.round((entry.incidentCount / trendMax) * 100));
        const monthLabel = entry.period.slice(5);
        return '<div class="trend-bar" style="height:' + barHeight + '%"><span>' + monthLabel + '</span></div>';
      }).join('');

      document.getElementById('app').innerHTML =
        '<div class="dashboard-shell">' +
          '<aside class="sidebar">' +
            '<h2>SMSPro</h2>' +
            '<nav>' +
              '<a href="#" class="active">Operations</a>' +
              '<a href="#">Programs</a>' +
              '<a href="#">Obligations</a>' +
              '<a href="#">Reports</a>' +
            '</nav>' +
          '</aside>' +
          '<main>' +
            '<header class="topbar">' +
              '<div><h1>' + data.siteId + ' Compliance Dashboard</h1><div class="meta">Data mode: ' + mode + '</div></div>' +
              '<div class="topbar-actions">' +
                '<button id="refresh" class="secondary">Refresh</button>' +
                '<button class="primary">Export Phase 1 PDF Pack</button>' +
              '</div>' +
            '</header>' +
            '<section class="kpi-grid">' +
              '<article class="kpi-card"><h3>Open Actions</h3><p class="kpi-value">' + data.openActions + '</p></article>' +
              '<article class="kpi-card"><h3>Overdue</h3><p class="kpi-value">' + data.overdueItems + '</p></article>' +
              '<article class="kpi-card"><h3>Training Completion</h3><p class="kpi-value">' + data.trainingCompletionRate + '%</p></article>' +
              '<article class="kpi-card"><h3>Latest Incidents</h3><p class="kpi-value">' + data.incidentRateTrend[data.incidentRateTrend.length - 1].incidentCount + '</p></article>' +
            '</section>' +
            '<section class="trend-card"><h2>Incident Trend</h2><div class="trend-bars">' + trendBars + '</div></section>' +
            '<section class="table-card">' +
              '<h2>Operational Records</h2>' +
              '<table><thead><tr><th>Type</th><th>Title</th><th>Owner</th><th>Status</th><th>Due Date</th></tr></thead>' +
              '<tbody>' +
                '<tr><td>Action</td><td>Update runway inspection checklist</td><td>J. Patel</td><td><span class="status-chip status-open">open</span></td><td>2026-04-10</td></tr>' +
                '<tr><td>Incident</td><td>Ground equipment contact report</td><td>T. Nguyen</td><td><span class="status-chip status-overdue">overdue</span></td><td>2026-03-28</td></tr>' +
                '<tr><td>Action</td><td>Hazard briefing signoff refresh</td><td>A. Rivera</td><td><span class="status-chip status-complete">completed</span></td><td>2026-03-20</td></tr>' +
              '</tbody></table>' +
              '<p class="meta">Generated at ' + new Date(data.generatedAt).toLocaleString() + '</p>' +
            '</section>' +
          '</main>' +
        '</div>';

      document.getElementById('refresh').addEventListener('click', () => loadDashboard());
    }

    async function loadDashboard() {
      try {
        const response = await fetch('${insightsBaseUrl}/v1/insights/dashboard?siteId=demo-site');
        if (!response.ok) throw new Error('Insights API unavailable');
        const data = await response.json();
        renderDashboard('live', data);
      } catch (error) {
        renderDashboard('mocked', mockData);
      }
    }

    loadDashboard();
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
