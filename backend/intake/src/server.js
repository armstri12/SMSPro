const { randomUUID } = require('crypto');
const { startService } = require('../../../scripts/serviceServer');

const port = Number(process.env.PORT || 4101);

startService({
  serviceName: 'intake',
  port,
  routes: {
    'POST /v1/intake/sessions': async ({ body }) => ({
      status: 201,
      payload: {
        snapshot: {
          id: randomUUID(),
          siteId: body.siteId || randomUUID(),
          version: 1,
          createdAt: new Date().toISOString(),
          profileHash: '',
          status: 'draft',
          responses: [],
          metadata: { evaluatedPath: [], visibleQuestionIds: ['siteType'], explainability: [] }
        },
        visibleQuestions: [{ id: 'siteType', prompt: 'Site type?', type: 'single_choice', options: ['warehouse'] }]
      }
    })
  }
});
