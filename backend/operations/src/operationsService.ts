import { randomUUID } from "crypto";
import {
  AssignCorrectiveActionRequest,
  CorrectiveAction,
  CreateCorrectiveActionRequest,
  CreateIncidentRequest,
  EvidenceArtifact,
  Incident,
  IncidentStatus,
  UpdateCorrectiveActionRequest,
  UpdateIncidentRequest
} from "./models";

const INCIDENT_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  reported: ["triaged", "archived"],
  triaged: ["investigating", "resolved", "archived"],
  investigating: ["resolved", "archived"],
  resolved: ["closed", "investigating", "archived"],
  closed: ["archived"],
  archived: []
};

export class OperationsService {
  private readonly incidents = new Map<string, Incident>();
  private readonly correctiveActions = new Map<string, CorrectiveAction>();
  private readonly evidenceArtifacts = new Map<string, EvidenceArtifact>();

  listIncidents(siteId: string): Incident[] {
    return [...this.incidents.values()].filter((item) => item.siteId === siteId && item.status !== "archived");
  }

  createIncident(request: CreateIncidentRequest): Incident {
    const now = new Date().toISOString();
    const incident: Incident = {
      id: randomUUID(),
      siteId: request.siteId,
      title: request.title,
      description: request.description,
      eventAt: request.eventAt,
      severity: request.severity,
      status: "reported",
      obligationId: request.obligationId,
      programDocumentId: request.programDocumentId,
      correctiveActionIds: [],
      createdAt: now,
      updatedAt: now
    };

    this.incidents.set(incident.id, incident);
    return incident;
  }

  getIncident(incidentId: string): Incident {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found.`);
    }
    return incident;
  }

  updateIncident(incidentId: string, request: UpdateIncidentRequest): Incident {
    const incident = this.getIncident(incidentId);
    Object.assign(incident, {
      ...request,
      updatedAt: new Date().toISOString()
    });
    this.incidents.set(incident.id, incident);
    return incident;
  }

  transitionIncidentStatus(incidentId: string, nextStatus: IncidentStatus): Incident {
    const incident = this.getIncident(incidentId);
    const allowedNext = INCIDENT_STATUS_TRANSITIONS[incident.status];

    if (!allowedNext.includes(nextStatus)) {
      throw new Error(`Invalid incident transition ${incident.status} -> ${nextStatus}.`);
    }

    incident.status = nextStatus;
    incident.updatedAt = new Date().toISOString();
    this.incidents.set(incident.id, incident);
    return incident;
  }

  archiveIncident(incidentId: string): void {
    this.transitionIncidentStatus(incidentId, "archived");
  }

  listCorrectiveActions(siteId: string): CorrectiveAction[] {
    this.recalculateOverdueActions();
    return [...this.correctiveActions.values()].filter((item) => item.siteId === siteId && item.status !== "archived");
  }

  createCorrectiveAction(request: CreateCorrectiveActionRequest): CorrectiveAction {
    const now = new Date().toISOString();
    const correctiveAction: CorrectiveAction = {
      id: randomUUID(),
      siteId: request.siteId,
      title: request.title,
      description: request.description,
      ownerUserId: request.ownerUserId,
      dueDate: request.dueDate,
      incidentId: request.incidentId,
      findingId: request.findingId,
      obligationId: request.obligationId,
      programDocumentId: request.programDocumentId,
      status: "open",
      createdAt: now,
      updatedAt: now
    };

    this.correctiveActions.set(correctiveAction.id, correctiveAction);

    if (correctiveAction.incidentId) {
      const incident = this.getIncident(correctiveAction.incidentId);
      incident.correctiveActionIds = [...new Set([...incident.correctiveActionIds, correctiveAction.id])];
      incident.updatedAt = now;
      this.incidents.set(incident.id, incident);
    }

    this.recalculateOverdueActions();
    return this.getCorrectiveAction(correctiveAction.id);
  }

  getCorrectiveAction(actionId: string): CorrectiveAction {
    const action = this.correctiveActions.get(actionId);
    if (!action) {
      throw new Error(`Corrective action ${actionId} not found.`);
    }
    return action;
  }

  updateCorrectiveAction(actionId: string, request: UpdateCorrectiveActionRequest): CorrectiveAction {
    const action = this.getCorrectiveAction(actionId);
    Object.assign(action, {
      ...request,
      updatedAt: new Date().toISOString()
    });
    this.correctiveActions.set(action.id, action);
    this.recalculateOverdueActions();
    return this.getCorrectiveAction(action.id);
  }

  assignCorrectiveAction(actionId: string, request: AssignCorrectiveActionRequest): CorrectiveAction {
    const action = this.getCorrectiveAction(actionId);
    action.ownerUserId = request.ownerUserId;
    action.status = action.status === "overdue" ? "overdue" : "in_progress";
    action.updatedAt = new Date().toISOString();
    this.correctiveActions.set(action.id, action);
    return action;
  }

  completeCorrectiveAction(actionId: string, completedAt: string = new Date().toISOString()): CorrectiveAction {
    const action = this.getCorrectiveAction(actionId);
    action.status = "completed";
    action.completedAt = completedAt;
    action.updatedAt = new Date().toISOString();
    this.correctiveActions.set(action.id, action);
    return action;
  }

  archiveCorrectiveAction(actionId: string): void {
    const action = this.getCorrectiveAction(actionId);
    action.status = "archived";
    action.updatedAt = new Date().toISOString();
    this.correctiveActions.set(action.id, action);
  }

  listEvidenceArtifacts(siteId: string): EvidenceArtifact[] {
    return [...this.evidenceArtifacts.values()].filter((item) => item.siteId === siteId);
  }

  createEvidenceArtifact(input: Omit<EvidenceArtifact, "id" | "createdAt">): EvidenceArtifact {
    const artifact: EvidenceArtifact = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString()
    };
    this.evidenceArtifacts.set(artifact.id, artifact);
    return artifact;
  }

  private recalculateOverdueActions(referenceDate = new Date()): void {
    const today = referenceDate.toISOString().slice(0, 10);

    for (const action of this.correctiveActions.values()) {
      if (action.status === "completed" || action.status === "archived") {
        continue;
      }

      if (action.dueDate < today) {
        action.status = "overdue";
      } else if (action.status === "overdue") {
        action.status = "in_progress";
      }

      this.correctiveActions.set(action.id, action);
    }
  }
}
