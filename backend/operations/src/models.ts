export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "reported" | "triaged" | "investigating" | "resolved" | "closed" | "archived";

export interface Incident {
  id: string;
  siteId: string;
  title: string;
  description: string;
  eventAt: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  obligationId?: string;
  programDocumentId?: string;
  correctiveActionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type CorrectiveActionStatus = "open" | "in_progress" | "completed" | "overdue" | "archived";

export interface CorrectiveAction {
  id: string;
  siteId: string;
  title: string;
  description: string;
  incidentId?: string;
  findingId?: string;
  ownerUserId: string;
  dueDate: string;
  completedAt?: string;
  status: CorrectiveActionStatus;
  obligationId?: string;
  programDocumentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type EvidenceArtifactType = "document" | "photo" | "signoff" | "record_link";

export interface EvidenceArtifact {
  id: string;
  siteId: string;
  linkedEntityType: "incident" | "corrective_action" | "inspection" | "finding" | "training" | "permit";
  linkedEntityId: string;
  artifactType: EvidenceArtifactType;
  uri: string;
  title?: string;
  obligationId?: string;
  programDocumentId?: string;
  createdAt: string;
}

export interface CreateIncidentRequest {
  siteId: string;
  title: string;
  description: string;
  eventAt: string;
  severity: IncidentSeverity;
  obligationId?: string;
  programDocumentId?: string;
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  eventAt?: string;
  severity?: IncidentSeverity;
  obligationId?: string;
  programDocumentId?: string;
}

export interface CreateCorrectiveActionRequest {
  siteId: string;
  title: string;
  description: string;
  ownerUserId: string;
  dueDate: string;
  incidentId?: string;
  findingId?: string;
  obligationId?: string;
  programDocumentId?: string;
}

export interface UpdateCorrectiveActionRequest {
  title?: string;
  description?: string;
  ownerUserId?: string;
  dueDate?: string;
  obligationId?: string;
  programDocumentId?: string;
}

export interface AssignCorrectiveActionRequest {
  ownerUserId: string;
}
