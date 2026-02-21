import type {
  ApprovalStep,
  Obligation,
  ProgramDocument,
  ProgramRevision,
  ProgramTemplate,
  ProgramWorkflowStatus,
  Site
} from "../../../shared/domain/entities";

export type FoundationalProgramKey =
  | "policy-governance"
  | "incident-reporting"
  | "hazard-identification"
  | "corrective-actions"
  | "training-baseline";

export interface ProgramCatalogEntry {
  key: FoundationalProgramKey;
  label: string;
  description: string;
  obligationTags: string[];
}

export interface SiteProfile {
  site: Site;
  profileAttributes: Record<string, unknown>;
}

export interface RenderContext {
  template: ProgramTemplate;
  siteProfile: SiteProfile;
  applicableObligations: Obligation[];
}

export interface RenderedProgramSection {
  key: string;
  title: string;
  body: string;
  citations: string[];
}

export interface RenderedProgramDocument {
  title: string;
  sections: RenderedProgramSection[];
}

export interface GenerateProgramDocumentsInput {
  siteProfile: SiteProfile;
  templates: ProgramTemplate[];
  obligations: Obligation[];
  generatedByUserId: string;
}

export interface RegenerateProgramRevisionInput {
  document: ProgramDocument;
  template: ProgramTemplate;
  obligations: Obligation[];
  siteProfile: SiteProfile;
  generatedByUserId: string;
  reason: string;
}

export interface ProgramLifecycleStore {
  documents: ProgramDocument[];
  revisions: ProgramRevision[];
  approvals: ApprovalStep[];
}

export interface UpdateApprovalDecisionInput {
  approvalStepId: string;
  approverUserId: string;
  decision: "approved" | "rejected";
  comments?: string;
}

export const PROGRAM_STATE_SEQUENCE: ProgramWorkflowStatus[] = ["draft", "review", "approved", "published"];
