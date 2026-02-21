const { randomUUID } = require('crypto');
const { startService } = require('../../../scripts/serviceServer');

const port = Number(process.env.PORT || 4105);

startService({
  serviceName: 'insights',
  port,
  routes: {
    'GET /v1/insights/dashboard': async ({ url }) => ({
      payload: {
        siteId: url.searchParams.get('siteId'),
        openActions: 3,
        overdueItems: 1,
        trainingCompletionRate: 92,
        incidentRateTrend: [{ period: '2026-01', incidentCount: 1 }],
        generatedAt: new Date().toISOString()
      }
    }),
    'POST /v1/insights/exports/compliance-pack': async ({ body }) => ({
      status: 202,
      payload: {
        id: randomUUID(),
        siteId: body.siteId,
        format: 'pdf',
        status: 'queued',
        createdAt: new Date().toISOString()
      }
    })
  }
});
