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

export type ProgramWorkflowStatus = "draft" | "review" | "approved" | "published";

export interface ProgramTemplateSection {
  key: string;
  title: string;
  prompt: string;
}

export interface ProgramTemplate {
  id: string;
  programKey: string;
  title: string;
  description: string;
  sections: ProgramTemplateSection[];
  requiredObligationTags: string[];
}

export interface ProgramDocument {
  id: string;
  siteId: string;
  programTemplateId: string;
  title: string;
  status: ProgramWorkflowStatus;
  currentRevisionId?: string;
  obligationIds: string[];
  createdAt: string;
  publishedAt?: string;
}

export interface ProgramRevisionSection {
  key: string;
  title: string;
  body: string;
  citations: string[];
}

export interface ProgramRevision {
  id: string;
  programDocumentId: string;
  revisionNumber: number;
  status: ProgramWorkflowStatus;
  generatedAt: string;
  generatedByUserId: string;
  changeSummary: string;
  sections: ProgramRevisionSection[];
}

export interface ApprovalStep {
  id: string;
  programRevisionId: string;
  stepOrder: number;
  approverUserId: string;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  decidedAt?: string;
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

export type IntakeQuestionType = "single_choice" | "multi_choice" | "boolean" | "text" | "number";

export interface IntakeBranchCondition {
  questionId: string;
  operator: "eq" | "neq" | "includes";
  value: unknown;
}

export interface IntakeBranchRule {
  id: string;
  all: IntakeBranchCondition[];
  showQuestionIds: string[];
  reason: string;
}

export interface IntakeQuestion {
  id: string;
  prompt: string;
  type: IntakeQuestionType;
  options?: string[];
  branchRules?: IntakeBranchRule[];
}

export interface IntakeResponse {
  snapshotId: string;
  questionId: string;
  answer: unknown;
}

export interface DerivedProfileAttribute {
  key: string;
  value: unknown;
  whyThisApplies: string;
}

export interface IntakeSnapshot {
  id: string;
  siteId: string;
  version: number;
  createdAt: string;
  profileHash: string;
  status: "draft" | "finalized";
  responses: IntakeResponse[];
  metadata: {
    evaluatedPath: string[];
    visibleQuestionIds: string[];
    explainability: DerivedProfileAttribute[];
  };
}
