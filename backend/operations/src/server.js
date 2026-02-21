const { randomUUID } = require('crypto');
const { startService } = require('../../../scripts/serviceServer');

const port = Number(process.env.PORT || 4104);
const incidents = new Map();
const correctiveActions = new Map();

startService({
  serviceName: 'operations',
  port,
  routes: {
    'GET /v1/operations/incidents': async ({ url }) => {
      const siteId = url.searchParams.get('siteId');
      const items = [...incidents.values()].filter((incident) => incident.siteId === siteId);
      return { payload: { items } };
    },
    'POST /v1/operations/incidents': async ({ body }) => {
      const incident = {
        id: randomUUID(),
        siteId: body.siteId,
        title: body.title,
        description: body.description,
        eventAt: body.eventAt || new Date().toISOString(),
        severity: body.severity || 'medium',
        status: 'reported'
      };
      incidents.set(incident.id, incident);
      return { status: 201, payload: incident };
    },
    'GET /v1/operations/corrective-actions': async ({ url }) => {
      const siteId = url.searchParams.get('siteId');
      const items = [...correctiveActions.values()].filter((action) => action.siteId === siteId);
      return { payload: { items } };
    },
    'POST /v1/operations/corrective-actions': async ({ body }) => {
      const action = {
        id: randomUUID(),
        siteId: body.siteId,
        incidentId: body.incidentId,
        title: body.title,
        description: body.description,
        ownerUserId: body.ownerUserId,
        dueDate: body.dueDate,
        status: 'open'
      };
      correctiveActions.set(action.id, action);
      return { status: 201, payload: action };
    }
  }
});
