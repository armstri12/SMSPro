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

    const intakeRes = await fetch('http://127.0.0.1:4101/v1/intake/sessions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ siteId }) });
    assert(intakeRes.status === 201, 'intake session should return 201');
    const intakePayload = await intakeRes.json();
    assert(intakePayload.snapshot?.siteId, 'intake payload should include snapshot.siteId');

    const regRes = await fetch('http://127.0.0.1:4102/v1/regulatory/applicability/evaluate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ siteId }) });
    assert(regRes.ok, 'regulatory evaluate should return 200');
    const regPayload = await regRes.json();
    assert(Array.isArray(regPayload.obligations), 'regulatory payload should include obligations');

    const progRes = await fetch('http://127.0.0.1:4103/v1/programs/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ siteId }) });
    assert(progRes.status === 202, 'program generation should return 202');

    const opsRes = await fetch(`http://127.0.0.1:4104/v1/operations/incidents?siteId=${siteId}`);
    const opsPayload = await opsRes.json();
    assert(Array.isArray(opsPayload.items), 'operations payload should include items[]');

    const insightsRes = await fetch(`http://127.0.0.1:4105/v1/insights/dashboard?siteId=${siteId}`);
    const insightsPayload = await insightsRes.json();
    assert(typeof insightsPayload.openActions === 'number', 'insights payload should include openActions');

    console.log('smoke checks passed');
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
