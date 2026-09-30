/**
 * A5-009 vendor opportunity email.
 * One link to the token page. Accept and Pass are POST actions on that page
 * so a mail scanner cannot change assignment state by prefetching a GET link.
 * Customer name, phone, and email are not parameters and are not rendered.
 */

import { SITE } from "../../../config/site.ts";
import type { IntakeTiming } from "../../components/intake/types.ts";
import { timingLabel } from "../../components/intake/validation.ts";

export const VENDOR_EMAIL_FROM = `A5 Home Services <leads@a5homeservices.com>`;

const TIMINGS = new Set<IntakeTiming>([
  "ASAP",
  "WITHIN_30_DAYS",
  "ONE_TO_THREE_MONTHS",
  "EXPLORING",
]);

export function opportunityPageUrl(token: string): string {
  const origin = SITE.url.replace(/\/$/, "");
  return `${origin}/opportunity/${encodeURIComponent(token)}`;
}

export function timingDisplay(value: string | null | undefined): string {
  if (value && TIMINGS.has(value as IntakeTiming)) {
    return timingLabel(value as IntakeTiming);
  }
  return "Not specified";
}

function photoLine(count: number): string {
  if (count <= 0) return "No project photos were attached.";
  if (count === 1) return "1 project photo is on the secure page.";
  return `${count} project photos are on the secure page.`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildVendorOpportunityEmail(input: {
  serviceLabel: string;
  locationLabel: string;
  timingLabel: string;
  description: string;
  photoCount: number;
  opportunityUrl: string;
}): { subject: string; text: string; html: string } {
  const description = input.description.trim() || "No description was provided.";
  const photos = photoLine(input.photoCount);
  const subject = "New project opportunity — A5 Home Services";
  const text = [
    "A5 Home Services",
    "",
    "New project opportunity",
    "",
    `Service: ${input.serviceLabel}`,
    `Location: ${input.locationLabel}`,
    `Timing: ${input.timingLabel}`,
    "",
    "Project:",
    description,
    "",
    photos,
    "",
    "Would you like to take this project? Open the secure page to accept or pass:",
    input.opportunityUrl,
    "",
    "This link expires in 72 hours. It only opens this project.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
<body>
<p><strong>A5 Home Services</strong></p>
<h1>New project opportunity</h1>
<p>Service<br>${escapeHtml(input.serviceLabel)}</p>
<p>Location<br>${escapeHtml(input.locationLabel)}</p>
<p>Timing<br>${escapeHtml(input.timingLabel)}</p>
<p>Project<br>${escapeHtml(description).replaceAll("\n", "<br>")}</p>
<p>${escapeHtml(photos)}</p>
<p>Would you like to take this project?</p>
<p><a href="${escapeHtml(input.opportunityUrl)}">Review this project</a></p>
<p>This link expires in 72 hours. It only opens this project.</p>
</body>
</html>`;

  return { subject, text, html };
}
