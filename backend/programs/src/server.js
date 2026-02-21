const { randomUUID } = require('crypto');
const { startService } = require('../../../scripts/serviceServer');

const port = Number(process.env.PORT || 4103);

startService({
  serviceName: 'programs',
  port,
  routes: {
    'POST /v1/programs/generate': async ({ body }) => ({
      status: 202,
      payload: {
        jobId: randomUUID(),
        siteId: body.siteId,
        status: 'queued',
        requestedAt: new Date().toISOString()
      }
    })
  }
});
