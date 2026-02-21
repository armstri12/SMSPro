const { startService } = require('../../../scripts/serviceServer');

const port = Number(process.env.PORT || 4104);

startService({
  serviceName: 'operations',
  port,
  routes: {
    'GET /v1/operations/incidents': async ({ url }) => ({
      payload: {
        items: [
          {
            id: '22222222-2222-2222-2222-222222222222',
            siteId: url.searchParams.get('siteId'),
            title: 'Forklift near miss',
            status: 'triaged',
            eventAt: new Date().toISOString()
          }
        ]
      }
    })
  }
});
