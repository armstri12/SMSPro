const { spawn } = require('child_process');

const services = [
  { name: 'intake', cwd: 'backend/intake', port: 4101 },
  { name: 'regulatory', cwd: 'backend/regulatory', port: 4102 },
  { name: 'programs', cwd: 'backend/programs', port: 4103 },
  { name: 'operations', cwd: 'backend/operations', port: 4104 },
  { name: 'insights', cwd: 'backend/insights', port: 4105 },
  { name: 'frontend', cwd: 'frontend/web', port: 4173 }
];

const procs = services.map((service) =>
  spawn('npm', ['run', 'dev'], {
    cwd: service.cwd,
    env: { ...process.env, PORT: String(service.port) },
    stdio: 'inherit'
  })
);

function shutdown(signal) {
  for (const proc of procs) {
    if (!proc.killed) proc.kill(signal);
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
