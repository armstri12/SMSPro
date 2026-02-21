import type { Obligation } from "../../../shared/domain/entities";
import type { RenderContext, RenderedProgramDocument, RenderedProgramSection } from "./models";

function formatProfileAttributes(attributes: Record<string, unknown>): string {
  return Object.entries(attributes)
    .map(([key, value]) => `- ${key}: ${String(value)}`)
    .join("\n");
}

function createCitationBlock(obligations: Obligation[]): string {
  const citations = obligations.map((obligation) => `- ${obligation.citation}: ${obligation.title}`);
  return ["", "Citations:", ...citations].join("\n");
}

function renderSectionBody(input: {
  sectionPrompt: string;
  siteName: string;
  profileSummary: string;
  obligations: Obligation[];
}): string {
  const obligationSummary = input.obligations
    .map((obligation) => `- ${obligation.title} (${obligation.currentVersion})`)
    .join("\n");

  return [
    `${input.sectionPrompt}`,
    "",
    `Site context (${input.siteName}):`,
    input.profileSummary,
    "",
    "Applicable obligations:",
    obligationSummary
  ].join("\n");
}

export function renderProgramDocument(context: RenderContext): RenderedProgramDocument {
  const profileSummary = formatProfileAttributes(context.siteProfile.profileAttributes);

  const sections: RenderedProgramSection[] = context.template.sections.map((section) => {
    const relevantObligations = context.applicableObligations.filter((obligation) =>
      context.template.requiredObligationTags.some((tag) => obligation.appliesTo.includes(tag))
    );
    const sectionBody = renderSectionBody({
      sectionPrompt: section.prompt,
      siteName: context.siteProfile.site.name,
      profileSummary,
      obligations: relevantObligations
    });

    return {
      key: section.key,
      title: section.title,
      body: `${sectionBody}${createCitationBlock(relevantObligations)}`,
      citations: relevantObligations.map((obligation) => obligation.citation)
    };
  });

  return {
    title: `${context.template.title} - ${context.siteProfile.site.name}`,
    sections
  };
}
