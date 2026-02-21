const { startService } = require('../../../scripts/serviceServer');

const port = Number(process.env.PORT || 4102);

startService({
  serviceName: 'regulatory',
  port,
  routes: {
    'POST /v1/regulatory/applicability/evaluate': async ({ body }) => ({
      payload: {
        siteId: body.siteId,
        summary: '1 obligation applicable',
        obligations: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            title: 'Maintain incident register',
            jurisdiction: 'federal',
            rationale: 'Applies to all operating sites'
          }
        ]
      }
    })
  }
});
