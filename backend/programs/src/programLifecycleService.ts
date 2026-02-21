import type { ApprovalStep, Obligation, ProgramDocument, ProgramRevision, ProgramTemplate } from "../../../shared/domain/entities";
import type {
  GenerateProgramDocumentsInput,
  ProgramLifecycleStore,
  RegenerateProgramRevisionInput,
  UpdateApprovalDecisionInput
} from "./models";
import { renderProgramDocument } from "./templateRenderer";
import { transitionProgramStatus } from "./workflowStateMachine";

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createRevisionFromRender(input: {
  documentId: string;
  template: ProgramTemplate;
  obligations: Obligation[];
  generatedByUserId: string;
  siteProfile: GenerateProgramDocumentsInput["siteProfile"] | RegenerateProgramRevisionInput["siteProfile"];
  revisionNumber: number;
  changeSummary: string;
}): ProgramRevision {
  const rendered = renderProgramDocument({
    template: input.template,
    applicableObligations: input.obligations,
    siteProfile: input.siteProfile
  });

  return {
    id: createId("rev"),
    programDocumentId: input.documentId,
    revisionNumber: input.revisionNumber,
    status: "draft",
    generatedAt: new Date().toISOString(),
    generatedByUserId: input.generatedByUserId,
    changeSummary: input.changeSummary,
    sections: rendered.sections
  };
}

export class ProgramLifecycleService {
  private readonly store: ProgramLifecycleStore;

  constructor(store?: ProgramLifecycleStore) {
    this.store = store ?? { documents: [], revisions: [], approvals: [] };
  }

  generateDocuments(input: GenerateProgramDocumentsInput): ProgramDocument[] {
    const now = new Date().toISOString();

    const createdDocuments = input.templates.map((template) => {
      const document: ProgramDocument = {
        id: createId("doc"),
        siteId: input.siteProfile.site.id,
        programTemplateId: template.id,
        title: `${template.title} - ${input.siteProfile.site.name}`,
        status: "draft",
        obligationIds: input.obligations.map((obligation) => obligation.id),
        createdAt: now
      };

      const revision = createRevisionFromRender({
        documentId: document.id,
        template,
        obligations: input.obligations,
        generatedByUserId: input.generatedByUserId,
        siteProfile: input.siteProfile,
        revisionNumber: 1,
        changeSummary: "Initial generated draft"
      });

      document.currentRevisionId = revision.id;
      this.store.documents.push(document);
      this.store.revisions.push(revision);
      return document;
    });

    return createdDocuments;
  }

  regenerateRevision(input: RegenerateProgramRevisionInput): ProgramRevision {
    const latestRevisionNumber = Math.max(
      0,
      ...this.store.revisions
        .filter((revision) => revision.programDocumentId === input.document.id)
        .map((revision) => revision.revisionNumber)
    );

    const revision = createRevisionFromRender({
      documentId: input.document.id,
      template: input.template,
      obligations: input.obligations,
      generatedByUserId: input.generatedByUserId,
      siteProfile: input.siteProfile,
      revisionNumber: latestRevisionNumber + 1,
      changeSummary: input.reason
    });

    this.store.revisions.push(revision);
    input.document.currentRevisionId = revision.id;
    input.document.status = "draft";
    return revision;
  }

  submitRevisionForReview(programRevisionId: string, approverUserIds: string[]): ApprovalStep[] {
    const revision = this.requireRevision(programRevisionId);
    revision.status = transitionProgramStatus(revision.status, "review");

    return approverUserIds.map((approverUserId, index) => {
      const step: ApprovalStep = {
        id: createId("approval"),
        programRevisionId,
        stepOrder: index + 1,
        approverUserId,
        status: "pending"
      };
      this.store.approvals.push(step);
      return step;
    });
  }

  reviewApprovalDecision(input: UpdateApprovalDecisionInput): ProgramRevision {
    const step = this.store.approvals.find((candidate) => candidate.id === input.approvalStepId);
    if (!step) {
      throw new Error(`Approval step ${input.approvalStepId} not found.`);
    }

    if (step.approverUserId !== input.approverUserId) {
      throw new Error(`User ${input.approverUserId} is not assigned to approval step ${step.id}.`);
    }

    step.status = input.decision;
    step.comments = input.comments;
    step.decidedAt = new Date().toISOString();

    const revision = this.requireRevision(step.programRevisionId);
    if (input.decision === "rejected") {
      revision.status = transitionProgramStatus(revision.status, "draft");
      return revision;
    }

    const allApproved = this.store.approvals
      .filter((candidate) => candidate.programRevisionId === revision.id)
      .every((candidate) => candidate.status === "approved");

    if (allApproved) {
      revision.status = transitionProgramStatus(revision.status, "approved");
    }

    return revision;
  }

  publishRevision(programRevisionId: string): ProgramRevision {
    const revision = this.requireRevision(programRevisionId);
    revision.status = transitionProgramStatus(revision.status, "published");

    const document = this.store.documents.find((candidate) => candidate.id === revision.programDocumentId);
    if (document) {
      document.status = "published";
      document.publishedAt = new Date().toISOString();
      document.currentRevisionId = revision.id;
    }

    return revision;
  }

  exportPdfPack(siteId: string): { siteId: string; format: "pdf"; documentIds: string[]; createdAt: string } {
    const documentIds = this.store.documents
      .filter((document) => document.siteId === siteId && document.status === "published")
      .map((document) => document.id);

    return {
      siteId,
      format: "pdf",
      documentIds,
      createdAt: new Date().toISOString()
    };
  }

  private requireRevision(programRevisionId: string): ProgramRevision {
    const revision = this.store.revisions.find((candidate) => candidate.id === programRevisionId);
    if (!revision) {
      throw new Error(`Program revision ${programRevisionId} not found.`);
    }

    return revision;
  }
}
