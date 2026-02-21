const { spawn } = require('child_process');

const siteId = '33333333-3333-3333-3333-333333333333';
const services = [
  { name: 'intake', cwd: 'backend/intake', port: 4101 },
  { name: 'regulatory', cwd: 'backend/regulatory', port: 4102 },
  { name: 'programs', cwd: 'backend/programs', port: 4103 },
  { name: 'operations', cwd: 'backend/operations', port: 4104 },
  { name: 'insights', cwd: 'backend/insights', port: 4105 }
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(baseUrl) {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch (_) {}
    await sleep(150);
  }
  throw new Error(`Service did not become healthy: ${baseUrl}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const procs = services.map((service) =>
    spawn('npm', ['run', 'dev'], {
      cwd: service.cwd,
      env: { ...process.env, PORT: String(service.port) },
      stdio: 'ignore'
    })
  );

  try {
    await Promise.all(services.map((service) => waitForHealth(`http://127.0.0.1:${service.port}`)));

    const intakeRes = await fetch('http://127.0.0.1:4101/v1/intake/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ siteId })
    });
    assert(intakeRes.status === 201, 'intake session should return 201');

    const regRes = await fetch('http://127.0.0.1:4102/v1/regulatory/applicability/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ siteId })
    });
    assert(regRes.ok, 'regulatory evaluate should return 200');

    const progRes = await fetch('http://127.0.0.1:4103/v1/programs/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ siteId })
    });
    assert(progRes.status === 202, 'program generation should return 202');

    const createIncidentRes = await fetch('http://127.0.0.1:4104/v1/operations/incidents', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        siteId,
        title: 'Forklift near miss',
        description: 'Near miss involving backing maneuver.',
        severity: 'medium',
        eventAt: new Date().toISOString()
      })
    });
    assert(createIncidentRes.status === 201, 'incident creation should return 201');
    const incident = await createIncidentRes.json();
    assert(incident.id, 'incident response should include id');

    const createActionRes = await fetch('http://127.0.0.1:4104/v1/operations/corrective-actions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        siteId,
        incidentId: incident.id,
        title: 'Refresh forklift lane markings',
        description: 'Repaint travel lanes and update signage.',
        ownerUserId: 'safety-manager-1',
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)
      })
    });
    assert(createActionRes.status === 201, 'corrective action creation should return 201');

    const incidentListRes = await fetch(`http://127.0.0.1:4104/v1/operations/incidents?siteId=${siteId}`);
    const incidentList = await incidentListRes.json();
    assert(incidentList.items.length >= 1, 'incident list should include created incident');

    const actionListRes = await fetch(`http://127.0.0.1:4104/v1/operations/corrective-actions?siteId=${siteId}`);
    const actionList = await actionListRes.json();
    assert(actionList.items.length >= 1, 'corrective actions list should include created action');

    const insightsRes = await fetch(`http://127.0.0.1:4105/v1/insights/dashboard?siteId=${siteId}`);
    assert(insightsRes.ok, 'insights dashboard should return 200');

    const exportRes = await fetch('http://127.0.0.1:4105/v1/insights/exports/compliance-pack', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ siteId })
    });
    assert(exportRes.status === 202, 'compliance pack export should return 202');

    console.log('end-to-end sanity path passed');
  } finally {
    for (const proc of procs) {
      if (!proc.killed) proc.kill('SIGTERM');
    }
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
