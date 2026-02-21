import { createHash, randomUUID } from "crypto";

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

export interface QuestionnaireSession {
  snapshot: IntakeSnapshot;
  visibleQuestions: IntakeQuestion[];
}

interface SnapshotHistoryItem {
  snapshot: IntakeSnapshot;
  explanation: {
    evaluatedPath: string[];
    attributes: DerivedProfileAttribute[];
  };
}

const canonicalize = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `"${k}":${canonicalize(v)}`).join(",")}}`;
  }

  return JSON.stringify(value);
};

const matchesCondition = (condition: IntakeBranchCondition, answers: Map<string, unknown>): boolean => {
  const currentValue = answers.get(condition.questionId);

  switch (condition.operator) {
    case "eq":
      return canonicalize(currentValue) === canonicalize(condition.value);
    case "neq":
      return canonicalize(currentValue) !== canonicalize(condition.value);
    case "includes":
      return Array.isArray(currentValue) && currentValue.some((item) => canonicalize(item) === canonicalize(condition.value));
    default:
      return false;
  }
};

export class IntakeSubsystem {
  private readonly snapshotsById = new Map<string, IntakeSnapshot>();
  private readonly snapshotsBySite = new Map<string, IntakeSnapshot[]>();

  constructor(private readonly questionBank: IntakeQuestion[]) {}

  startQuestionnaireSession(siteId: string): QuestionnaireSession {
    const version = this.nextVersion(siteId);
    const snapshot: IntakeSnapshot = {
      id: randomUUID(),
      siteId,
      version,
      createdAt: new Date().toISOString(),
      profileHash: "",
      status: "draft",
      responses: [],
      metadata: {
        evaluatedPath: [],
        visibleQuestionIds: this.evaluateVisibility(new Map()).visibleQuestionIds,
        explainability: []
      }
    };

    this.persistSnapshot(snapshot);

    return {
      snapshot,
      visibleQuestions: this.filterVisibleQuestions(snapshot.metadata.visibleQuestionIds)
    };
  }

  submitAnswerBatch(snapshotId: string, answers: Array<Pick<IntakeResponse, "questionId" | "answer">>): QuestionnaireSession {
    const snapshot = this.getSnapshot(snapshotId);

    if (snapshot.status === "finalized") {
      throw new Error("Snapshot is finalized and immutable. Start a new questionnaire session to create a new version.");
    }

    const responseMap = new Map(snapshot.responses.map((response) => [response.questionId, response.answer]));

    for (const answer of answers) {
      responseMap.set(answer.questionId, answer.answer);
    }

    snapshot.responses = [...responseMap.entries()].map(([questionId, answer]) => ({
      snapshotId: snapshot.id,
      questionId,
      answer
    }));

    const visibility = this.evaluateVisibility(responseMap);
    snapshot.metadata.visibleQuestionIds = visibility.visibleQuestionIds;
    snapshot.metadata.evaluatedPath = visibility.evaluatedPath;

    this.persistSnapshot(snapshot);

    return {
      snapshot,
      visibleQuestions: this.filterVisibleQuestions(visibility.visibleQuestionIds)
    };
  }

  finalizeSnapshot(snapshotId: string): IntakeSnapshot {
    const snapshot = this.getSnapshot(snapshotId);

    if (snapshot.status === "finalized") {
      return snapshot;
    }

    const responseMap = new Map(snapshot.responses.map((response) => [response.questionId, response.answer]));
    snapshot.metadata.explainability = this.deriveProfileExplainability(responseMap);
    snapshot.profileHash = this.buildProfileHash(snapshot);
    snapshot.status = "finalized";

    this.persistSnapshot(snapshot);

    return snapshot;
  }

  retrieveHistoricalSnapshot(snapshotId: string): SnapshotHistoryItem {
    const snapshot = this.getSnapshot(snapshotId);

    return {
      snapshot,
      explanation: {
        evaluatedPath: [...snapshot.metadata.evaluatedPath],
        attributes: [...snapshot.metadata.explainability]
      }
    };
  }

  private evaluateVisibility(answers: Map<string, unknown>): { visibleQuestionIds: string[]; evaluatedPath: string[] } {
    const visibleQuestionIds = new Set(this.questionBank.filter((question) => !question.branchRules?.length).map((question) => question.id));
    const evaluatedPath: string[] = [];

    for (const question of this.questionBank) {
      for (const rule of question.branchRules ?? []) {
        const matched = rule.all.every((condition) => matchesCondition(condition, answers));
        if (matched) {
          for (const questionId of rule.showQuestionIds) {
            visibleQuestionIds.add(questionId);
          }
          evaluatedPath.push(`${question.id}:${rule.id}`);
        }
      }
    }

    return {
      visibleQuestionIds: [...visibleQuestionIds],
      evaluatedPath
    };
  }

  private deriveProfileExplainability(answers: Map<string, unknown>): DerivedProfileAttribute[] {
    return [...answers.entries()]
      .filter(([questionId]) => this.questionBank.some((question) => question.id === questionId))
      .map(([questionId, answer]) => {
        const question = this.questionBank.find((item) => item.id === questionId);
        return {
          key: `profile.${questionId}`,
          value: answer,
          whyThisApplies: `Derived from response to \"${question?.prompt ?? questionId}\" with answer ${canonicalize(answer)}.`
        };
      });
  }

  private buildProfileHash(snapshot: IntakeSnapshot): string {
    const stablePayload = canonicalize({
      siteId: snapshot.siteId,
      version: snapshot.version,
      responses: snapshot.responses.sort((a, b) => a.questionId.localeCompare(b.questionId)),
      evaluatedPath: snapshot.metadata.evaluatedPath,
      explainability: snapshot.metadata.explainability
    });

    return createHash("sha256").update(stablePayload).digest("hex");
  }

  private filterVisibleQuestions(visibleIds: string[]): IntakeQuestion[] {
    const visibleSet = new Set(visibleIds);
    return this.questionBank.filter((question) => visibleSet.has(question.id));
  }

  private nextVersion(siteId: string): number {
    const siteSnapshots = this.snapshotsBySite.get(siteId) ?? [];
    if (!siteSnapshots.length) {
      return 1;
    }

    return Math.max(...siteSnapshots.map((snapshot) => snapshot.version)) + 1;
  }

  private getSnapshot(snapshotId: string): IntakeSnapshot {
    const snapshot = this.snapshotsById.get(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found.`);
    }
    return snapshot;
  }

  private persistSnapshot(snapshot: IntakeSnapshot): void {
    this.snapshotsById.set(snapshot.id, snapshot);

    const siteSnapshots = this.snapshotsBySite.get(snapshot.siteId) ?? [];
    const existingIndex = siteSnapshots.findIndex((item) => item.id === snapshot.id);

    if (existingIndex >= 0) {
      siteSnapshots[existingIndex] = snapshot;
    } else {
      siteSnapshots.push(snapshot);
    }

    this.snapshotsBySite.set(snapshot.siteId, siteSnapshots);
  }
}
