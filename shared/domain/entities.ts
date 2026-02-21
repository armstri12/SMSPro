export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface Site {
  id: string;
  organizationId: string;
  name: string;
  jurisdictionCode: string;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  displayName: string;
  isActive: boolean;
}

export interface Obligation {
  id: string;
  regulationSourceId: string;
  citation: string;
  title: string;
  appliesTo: string[];
  currentVersion: string;
}

export interface Incident {
  id: string;
  siteId: string;
  obligationId?: string;
  programDocumentId?: string;
  eventDate: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_review" | "closed";
}

export interface CorrectiveAction {
  id: string;
  incidentId?: string;
  siteId: string;
  obligationId?: string;
  programDocumentId?: string;
  description: string;
  ownerUserId: string;
  dueDate: string;
  status: "open" | "in_progress" | "done" | "overdue";
}
