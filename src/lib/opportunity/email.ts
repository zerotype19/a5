/**
 * A5-009 vendor opportunity email.
 * One link to the token page. Accept and Pass are POST actions on that page
 * so a mail scanner cannot change assignment state by prefetching a GET link.
 * Only controlled fields are rendered. The homeowner's free-text description
 * can contain contact details, so it is shown only on the token page.
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
  if (count === 1) return "1 project photo will be available after acceptance.";
  return `${count} project photos will be available after acceptance.`;
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
  photoCount: number;
  opportunityUrl: string;
  acceptanceHours?: number;
}): { subject: string; text: string; html: string } {
  const deadline = `Please accept or pass within ${input.acceptanceHours ?? 72} hours of this email. Acceptance means you intend to contact the homeowner; it does not confirm availability or book the work. The private link expires after 72 hours.`;
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
    photos,
    "",
    "Review the service, town and timing, then accept or pass. Acceptance unlocks the full request and contact details:",
    input.opportunityUrl,
    "",
    deadline,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
<body>
<p><strong>A5 Home Services</strong></p>
<h1>New project opportunity</h1>
<p>Service<br>${escapeHtml(input.serviceLabel)}</p>
<p>Location<br>${escapeHtml(input.locationLabel)}</p>
<p>Timing<br>${escapeHtml(input.timingLabel)}</p>
<p>${escapeHtml(photos)}</p>
<p>Review the service, town and timing through the A5 home services network. Accept to unlock the full request and homeowner contact:</p>
<p><a href="${escapeHtml(input.opportunityUrl)}">View project</a></p>
<p>${escapeHtml(deadline)}</p>
</body>
</html>`;

  return { subject, text, html };
}
