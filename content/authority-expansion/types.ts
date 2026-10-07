import type { ServiceId } from "../../config/services.ts";
import type { LocationId } from "../../config/locations.ts";
import type { ContentSection } from "../../src/lib/authority/types.ts";
export type ExpansionDraft = {
  key: string;
  type: "SERVICE_LOCATION" | "GUIDE";
  service: ServiceId;
  town?: LocationId;
  title: string;
  description: string;
  question: string;
  answer: string;
  sections: ContentSection[];
  sourceKeys: string[];
};
export const rich = (heading: string, ...paragraphs: string[]): ContentSection => ({type:"RICH_TEXT",heading,paragraphs});
