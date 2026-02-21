import type { ProgramTemplate } from "../../../shared/domain/entities";
import type { ProgramCatalogEntry } from "./models";

export const TOP_FOUNDATIONAL_PROGRAMS: ProgramCatalogEntry[] = [
  {
    key: "policy-governance",
    label: "Safety Policy and Governance",
    description: "Defines accountabilities, scope, and management review cadence.",
    obligationTags: ["policy", "leadership", "governance"]
  },
  {
    key: "incident-reporting",
    label: "Incident Reporting and Investigation",
    description: "Standardizes notification, triage, and root-cause investigations.",
    obligationTags: ["incident", "reporting", "investigation"]
  },
  {
    key: "hazard-identification",
    label: "Hazard Identification and Risk Assessment",
    description: "Establishes hazard discovery, ranking, and controls.",
    obligationTags: ["hazard", "risk", "assessment"]
  },
  {
    key: "corrective-actions",
    label: "Corrective and Preventive Actions (CAPA)",
    description: "Defines corrective action lifecycle, ownership, and closure evidence.",
    obligationTags: ["corrective", "preventive", "capa"]
  },
  {
    key: "training-baseline",
    label: "Training and Competency Baseline",
    description: "Defines required training, frequencies, and competency validation.",
    obligationTags: ["training", "competency", "qualification"]
  }
];

export function createDefaultProgramTemplates(): ProgramTemplate[] {
  return TOP_FOUNDATIONAL_PROGRAMS.map((program, index) => ({
    id: `tpl-${program.key}`,
    programKey: program.key,
    title: program.label,
    description: program.description,
    requiredObligationTags: program.obligationTags,
    sections: [
      {
        key: `${program.key}-scope`,
        title: "Scope and Applicability",
        prompt: "Describe where and when this program applies for the site profile."
      },
      {
        key: `${program.key}-requirements`,
        title: "Operational Requirements",
        prompt: "Translate obligations into required activities and controls."
      },
      {
        key: `${program.key}-records`,
        title: "Records and Evidence",
        prompt: "List records needed to prove implementation and compliance."
      }
    ]
  }));
}
