import type { ProgramWorkflowStatus } from "../../../shared/domain/entities";

const allowedTransitions: Record<ProgramWorkflowStatus, ProgramWorkflowStatus[]> = {
  draft: ["review"],
  review: ["approved", "draft"],
  approved: ["published", "review"],
  published: []
};

export function canTransitionProgramStatus(from: ProgramWorkflowStatus, to: ProgramWorkflowStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionProgramStatus(from: ProgramWorkflowStatus, to: ProgramWorkflowStatus): ProgramWorkflowStatus {
  if (!canTransitionProgramStatus(from, to)) {
    throw new Error(`Invalid program status transition: ${from} -> ${to}`);
  }

  return to;
}
