import type { IntakeSnapshot } from "../../intake/src/intakeSubsystem";

export interface RegulationSource {
  id: string;
  title: string;
  citation: string;
  issuingBody: string;
  jurisdiction: string;
  url?: string;
}

export interface Obligation {
  id: string;
  sourceId: string;
  code: string;
  title: string;
  description: string;
}

export interface ObligationVersion {
  id: string;
  obligationId: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  ruleIds: string[];
  sourceCitations: string[];
}

export interface SiteJurisdictionMetadata {
  country: string;
  state?: string;
  county?: string;
  city?: string;
  facilityType?: string;
}

export interface JurisdictionFilter {
  countries?: string[];
  states?: string[];
  counties?: string[];
  cities?: string[];
  facilityTypes?: string[];
}

export type FactOperator = "eq" | "neq" | "in" | "gt" | "gte" | "lt" | "lte" | "contains";

export interface FactCondition {
  factKey: string;
  operator: FactOperator;
  value: unknown;
}

export interface ApplicabilityRule {
  id: string;
  obligationVersionId: string;
  description: string;
  jurisdiction?: JurisdictionFilter;
  all?: FactCondition[];
  any?: FactCondition[];
  not?: FactCondition[];
}

export interface RuleEvaluationTrace {
  ruleId: string;
  obligationVersionId: string;
  description: string;
  matched: boolean;
  jurisdictionMatched: boolean;
  matchedProfileFacts: string[];
  unmetConditions: string[];
}

export interface ApplicableObligationResult {
  obligation: Obligation;
  version: ObligationVersion;
  applied_rules: string[];
  matched_profile_facts: string[];
  source_citations: string[];
}

export interface ApplicabilityEvaluationResult {
  evaluatedAt: string;
  obligations: ApplicableObligationResult[];
  trace: RuleEvaluationTrace[];
}

interface ObligationVersionView {
  obligation: Obligation;
  version: ObligationVersion;
  source: RegulationSource;
  rules: ApplicabilityRule[];
}

export class ApplicabilityService {
  private readonly sources = new Map<string, RegulationSource>();
  private readonly obligations = new Map<string, Obligation>();
  private readonly obligationVersions = new Map<string, ObligationVersion>();
  private readonly rulesByVersion = new Map<string, ApplicabilityRule[]>();

  constructor(seed: {
    sources: RegulationSource[];
    obligations: Obligation[];
    obligationVersions: ObligationVersion[];
    rules: ApplicabilityRule[];
  }) {
    for (const source of seed.sources) {
      this.sources.set(source.id, source);
    }

    for (const obligation of seed.obligations) {
      this.obligations.set(obligation.id, obligation);
    }

    for (const version of seed.obligationVersions) {
      this.obligationVersions.set(version.id, version);
    }

    for (const rule of seed.rules) {
      const existing = this.rulesByVersion.get(rule.obligationVersionId) ?? [];
      existing.push(rule);
      this.rulesByVersion.set(rule.obligationVersionId, existing);
    }
  }

  evaluateApplicabilityForSnapshot(input: {
    snapshot: IntakeSnapshot;
    jurisdiction: SiteJurisdictionMetadata;
    obligationVersionIds: string[];
  }): ApplicabilityEvaluationResult {
    const factMap = this.buildFactMap(input.snapshot);
    const trace: RuleEvaluationTrace[] = [];
    const obligations: ApplicableObligationResult[] = [];

    for (const versionId of input.obligationVersionIds) {
      const view = this.getObligationVersionView(versionId);
      const applicableRules: string[] = [];
      const matchedFacts = new Set<string>();

      for (const rule of view.rules) {
        const evaluation = this.evaluateRule(rule, factMap, input.jurisdiction);
        trace.push(evaluation);

        if (!evaluation.matched) {
          continue;
        }

        applicableRules.push(rule.id);
        for (const fact of evaluation.matchedProfileFacts) {
          matchedFacts.add(fact);
        }
      }

      if (!applicableRules.length) {
        continue;
      }

      obligations.push({
        obligation: view.obligation,
        version: view.version,
        applied_rules: applicableRules,
        matched_profile_facts: [...matchedFacts],
        source_citations: [...new Set([...view.version.sourceCitations, view.source.citation])]
      });
    }

    return {
      evaluatedAt: new Date().toISOString(),
      obligations,
      trace
    };
  }

  retrieveObligationSetWithExplanations(obligationVersionIds: string[]): ObligationVersionView[] {
    return obligationVersionIds.map((versionId) => this.getObligationVersionView(versionId));
  }

  rerunEvaluationForAuditComparison(input: {
    snapshot: IntakeSnapshot;
    jurisdiction: SiteJurisdictionMetadata;
    baselineVersionIds: string[];
    candidateVersionIds: string[];
  }): {
    baseline: ApplicabilityEvaluationResult;
    candidate: ApplicabilityEvaluationResult;
    addedObligationVersionIds: string[];
    removedObligationVersionIds: string[];
  } {
    const baseline = this.evaluateApplicabilityForSnapshot({
      snapshot: input.snapshot,
      jurisdiction: input.jurisdiction,
      obligationVersionIds: input.baselineVersionIds
    });

    const candidate = this.evaluateApplicabilityForSnapshot({
      snapshot: input.snapshot,
      jurisdiction: input.jurisdiction,
      obligationVersionIds: input.candidateVersionIds
    });

    const baselineSet = new Set(baseline.obligations.map((item) => item.version.id));
    const candidateSet = new Set(candidate.obligations.map((item) => item.version.id));

    const addedObligationVersionIds = [...candidateSet].filter((id) => !baselineSet.has(id));
    const removedObligationVersionIds = [...baselineSet].filter((id) => !candidateSet.has(id));

    return {
      baseline,
      candidate,
      addedObligationVersionIds,
      removedObligationVersionIds
    };
  }

  private getObligationVersionView(versionId: string): ObligationVersionView {
    const version = this.obligationVersions.get(versionId);
    if (!version) {
      throw new Error(`Obligation version ${versionId} not found.`);
    }

    const obligation = this.obligations.get(version.obligationId);
    if (!obligation) {
      throw new Error(`Obligation ${version.obligationId} not found for version ${versionId}.`);
    }

    const source = this.sources.get(obligation.sourceId);
    if (!source) {
      throw new Error(`Regulation source ${obligation.sourceId} not found for obligation ${obligation.id}.`);
    }

    const rules = this.rulesByVersion.get(versionId) ?? [];

    return {
      obligation,
      version,
      source,
      rules
    };
  }

  private evaluateRule(
    rule: ApplicabilityRule,
    factMap: Map<string, unknown>,
    jurisdiction: SiteJurisdictionMetadata
  ): RuleEvaluationTrace {
    const jurisdictionMatched = this.matchJurisdiction(rule.jurisdiction, jurisdiction);
    const matchedProfileFacts: string[] = [];
    const unmetConditions: string[] = [];

    if (!jurisdictionMatched) {
      return {
        ruleId: rule.id,
        obligationVersionId: rule.obligationVersionId,
        description: rule.description,
        matched: false,
        jurisdictionMatched,
        matchedProfileFacts,
        unmetConditions: ["jurisdiction filter mismatch"]
      };
    }

    const allMatched = (rule.all ?? []).every((condition) => {
      const matched = this.matchCondition(condition, factMap);
      if (matched) {
        matchedProfileFacts.push(condition.factKey);
      } else {
        unmetConditions.push(this.describeCondition(condition));
      }
      return matched;
    });

    const anyConditions = rule.any ?? [];
    const anyMatched = !anyConditions.length ||
      anyConditions.some((condition) => {
        const matched = this.matchCondition(condition, factMap);
        if (matched) {
          matchedProfileFacts.push(condition.factKey);
        }
        return matched;
      });

    if (!anyMatched && anyConditions.length) {
      unmetConditions.push(`none matched in any(${anyConditions.map((item) => this.describeCondition(item)).join(" OR ")})`);
    }

    const notMatched = (rule.not ?? []).every((condition) => {
      const matched = !this.matchCondition(condition, factMap);
      if (!matched) {
        unmetConditions.push(`not(${this.describeCondition(condition)}) violated`);
      }
      return matched;
    });

    return {
      ruleId: rule.id,
      obligationVersionId: rule.obligationVersionId,
      description: rule.description,
      matched: allMatched && anyMatched && notMatched,
      jurisdictionMatched,
      matchedProfileFacts: [...new Set(matchedProfileFacts)],
      unmetConditions
    };
  }

  private buildFactMap(snapshot: IntakeSnapshot): Map<string, unknown> {
    const factMap = new Map<string, unknown>();

    for (const response of snapshot.responses) {
      factMap.set(`response.${response.questionId}`, response.answer);
    }

    for (const attribute of snapshot.metadata.explainability) {
      factMap.set(attribute.key, attribute.value);
    }

    factMap.set("snapshot.siteId", snapshot.siteId);
    factMap.set("snapshot.version", snapshot.version);

    return factMap;
  }

  private matchJurisdiction(filter: JurisdictionFilter | undefined, jurisdiction: SiteJurisdictionMetadata): boolean {
    if (!filter) {
      return true;
    }

    const matchesSet = (value: string | undefined, allowed: string[] | undefined): boolean => {
      if (!allowed?.length) {
        return true;
      }
      if (!value) {
        return false;
      }
      return allowed.includes(value);
    };

    return (
      matchesSet(jurisdiction.country, filter.countries) &&
      matchesSet(jurisdiction.state, filter.states) &&
      matchesSet(jurisdiction.county, filter.counties) &&
      matchesSet(jurisdiction.city, filter.cities) &&
      matchesSet(jurisdiction.facilityType, filter.facilityTypes)
    );
  }

  private matchCondition(condition: FactCondition, factMap: Map<string, unknown>): boolean {
    const currentValue = factMap.get(condition.factKey);

    switch (condition.operator) {
      case "eq":
        return currentValue === condition.value;
      case "neq":
        return currentValue !== condition.value;
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(currentValue);
      case "gt":
        return Number(currentValue) > Number(condition.value);
      case "gte":
        return Number(currentValue) >= Number(condition.value);
      case "lt":
        return Number(currentValue) < Number(condition.value);
      case "lte":
        return Number(currentValue) <= Number(condition.value);
      case "contains":
        return Array.isArray(currentValue) && currentValue.includes(condition.value);
      default:
        return false;
    }
  }

  private describeCondition(condition: FactCondition): string {
    return `${condition.factKey} ${condition.operator} ${JSON.stringify(condition.value)}`;
  }
}
