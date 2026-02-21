const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';

const services = [
  { name: 'intake', cwd: 'backend/intake', port: 4101 },
  { name: 'regulatory', cwd: 'backend/regulatory', port: 4102 },
  { name: 'programs', cwd: 'backend/programs', port: 4103 },
  { name: 'operations', cwd: 'backend/operations', port: 4104 },
  { name: 'insights', cwd: 'backend/insights', port: 4105 },
  { name: 'frontend', cwd: 'frontend/web', port: 4173 }
];

function getSpawnSpec() {
  if (isWindows) {
    return {
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', 'npm run dev']
    };
  }

  return {
    command: 'npm',
    args: ['run', 'dev']
  };
}

function withPortEnv(port) {
  return {
    ...process.env,
    PORT: String(port)
  };
}

const { command, args } = getSpawnSpec();

const procs = services.map((service) => {
  const proc = spawn(command, args, {
    cwd: path.resolve(__dirname, '..', service.cwd),
    env: withPortEnv(service.port),
    stdio: 'inherit'
  });

  proc.on('error', (error) => {
    console.error(`failed to start ${service.name}:`, error.message);
    shutdown('SIGTERM');
  });

  return proc;
});

function shutdown(signal) {
  for (const proc of procs) {
    if (!proc.killed) proc.kill(signal);
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
