/**
 * A5-G002 — eight canonical SERVICE hubs.
 * Status is REVIEW. Cursor does not publish.
 * Problem entities are data only; this module does not create problem pages.
 */

import { LOCATIONS } from "../../../config/locations.ts";
import { SERVICES, type ServiceId } from "../../../config/services.ts";
import type { ContentPageRecord, ContentSection } from "./types.ts";

export const G002_HUB_STATUS = "REVIEW" as const;

/** Existing G001 masonry SERVICE fixture. Unique index allows one SERVICE page per service. */
export const G001_MASONRY_SERVICE_PAGE_ID =
  "10000000-0000-4000-8000-000000000001";

const HUB_IDS: Record<ServiceId, string> = {
  handyman: "20000000-0000-4000-8000-000000000001",
  masonry: G001_MASONRY_SERVICE_PAGE_ID,
  landscaping: "20000000-0000-4000-8000-000000000002",
  painting: "20000000-0000-4000-8000-000000000003",
  drywall: "20000000-0000-4000-8000-000000000004",
  tile: "20000000-0000-4000-8000-000000000005",
  plumbing: "20000000-0000-4000-8000-000000000006",
  electrical: "20000000-0000-4000-8000-000000000007",
};

export type ProblemLink = {
  id: string;
  slug: string;
  name: string;
  description: string;
  serviceIds: readonly ServiceId[];
};

/** Minimum problem entities for the eight hubs. Not published pages. */
export const G002_PROBLEMS: readonly ProblemLink[] = [
  {
    id: "sticking-interior-door",
    slug: "sticking-interior-door",
    name: "Sticking interior door",
    description:
      "An interior door that rubs, sticks, or no longer latches after seasonal movement or a loose hinge.",
    serviceIds: ["handyman"],
  },
  {
    id: "loose-or-damaged-trim",
    slug: "loose-or-damaged-trim",
    name: "Loose or damaged trim",
    description:
      "Baseboard, casing, or other interior trim that is loose, split, or pulling away from the wall.",
    serviceIds: ["handyman"],
  },
  {
    id: "wall-mounting",
    slug: "wall-mounting",
    name: "Wall mounting",
    description:
      "Mounting a television, shelf, curtain rod, or similar item where the homeowner wants it fastened securely.",
    serviceIds: ["handyman"],
  },
  {
    id: "worn-door-hardware",
    slug: "worn-door-hardware",
    name: "Worn door hardware",
    description:
      "A handle, lockset, hinge, or closer that is loose, worn, or no longer operating smoothly.",
    serviceIds: ["handyman"],
  },
  {
    id: "punch-list-repairs",
    slug: "punch-list-repairs",
    name: "Punch-list repairs",
    description:
      "A short list of small finish repairs after other work, or a set of minor items the homeowner wants handled together.",
    serviceIds: ["handyman"],
  },
  {
    id: "small-carpentry-repair",
    slug: "small-carpentry-repair",
    name: "Small carpentry repair",
    description:
      "A limited wood repair such as a shelf, casing return, or small section of trim — not a full remodel.",
    serviceIds: ["handyman"],
  },
  {
    id: "brick-step-repair",
    slug: "brick-step-repair",
    name: "Brick step repair",
    description:
      "Brick front steps that are cracking, shifting, crumbling, or becoming uneven.",
    serviceIds: ["masonry"],
  },
  {
    id: "sunken-pavers",
    slug: "sunken-pavers",
    name: "Sunken pavers",
    description:
      "Patio or walkway pavers that have settled, rocked, or created a trip edge.",
    serviceIds: ["masonry"],
  },
  {
    id: "loose-mortar",
    slug: "loose-mortar",
    name: "Loose mortar",
    description:
      "Mortar joints that are cracking, receding, or falling out of brick or stone.",
    serviceIds: ["masonry"],
  },
  {
    id: "damaged-brick-walkway",
    slug: "damaged-brick-walkway",
    name: "Damaged brick walkway",
    description:
      "A brick walk that is heaving, broken, or uneven underfoot.",
    serviceIds: ["masonry"],
  },
  {
    id: "uneven-stone-patio",
    slug: "uneven-stone-patio",
    name: "Uneven stone patio",
    description:
      "A stone or paver patio surface that has shifted and is no longer a comfortable walking surface.",
    serviceIds: ["masonry"],
  },
  {
    id: "shifting-retaining-wall",
    slug: "shifting-retaining-wall",
    name: "Shifting retaining wall",
    description:
      "A low masonry retaining wall that is leaning, separating, or losing stones. Structural engineering is a separate question when movement is severe.",
    serviceIds: ["masonry"],
  },
  {
    id: "overgrown-planting-beds",
    slug: "overgrown-planting-beds",
    name: "Overgrown planting beds",
    description:
      "Beds that have filled with weeds, crowded plants, or spent growth the homeowner wants cleaned up.",
    serviceIds: ["landscaping"],
  },
  {
    id: "landscape-cleanup",
    slug: "landscape-cleanup",
    name: "Landscape cleanup",
    description:
      "A yard that needs debris, leaves, or overgrowth cleared so the property is usable again.",
    serviceIds: ["landscaping"],
  },
  {
    id: "new-planting-beds",
    slug: "new-planting-beds",
    name: "New planting beds",
    description:
      "A homeowner who wants beds edged, soil improved, and plants installed as a defined landscape project.",
    serviceIds: ["landscaping"],
  },
  {
    id: "yard-surface-grading",
    slug: "yard-surface-grading",
    name: "Yard surface grading",
    description:
      "A lawn or bed area where surface water sits because the grade slopes toward the house or a low spot. This is landscape grading, not a buried drainage system design.",
    serviceIds: ["landscaping"],
  },
  {
    id: "seasonal-yard-cleanup",
    slug: "seasonal-yard-cleanup",
    name: "Seasonal yard cleanup",
    description:
      "Spring or fall cleanup: leaves, cutbacks, and bed refresh rather than a full redesign.",
    serviceIds: ["landscaping"],
  },
  {
    id: "worn-interior-paint",
    slug: "worn-interior-paint",
    name: "Worn interior paint",
    description:
      "Walls or ceilings whose paint is scuffed, faded, or ready for a fresh coat.",
    serviceIds: ["painting"],
  },
  {
    id: "peeling-exterior-paint",
    slug: "peeling-exterior-paint",
    name: "Peeling exterior paint",
    description:
      "Exterior siding or trim where paint is peeling, chalking, or failing and needs preparation before recoating.",
    serviceIds: ["painting"],
  },
  {
    id: "trim-paint-failure",
    slug: "trim-paint-failure",
    name: "Trim paint failure",
    description:
      "Window, door, or base trim whose paint is chipped or peeling while the surrounding walls may be fine.",
    serviceIds: ["painting"],
  },
  {
    id: "paint-after-patching",
    slug: "paint-after-patching",
    name: "Paint after patching",
    description:
      "A wall or ceiling that has been repaired and now needs paint so the patch disappears.",
    serviceIds: ["painting"],
  },
  {
    id: "hole-in-drywall",
    slug: "hole-in-drywall",
    name: "Hole in drywall",
    description:
      "A puncture, doorknob hole, or missing piece of drywall the homeowner wants patched.",
    serviceIds: ["drywall"],
  },
  {
    id: "drywall-crack",
    slug: "drywall-crack",
    name: "Drywall crack",
    description:
      "A crack in a wall or ceiling that may be cosmetic or may need to be opened and retaped.",
    serviceIds: ["drywall"],
  },
  {
    id: "ceiling-drywall-damage",
    slug: "ceiling-drywall-damage",
    name: "Ceiling drywall damage",
    description:
      "A ceiling that is sagging, cracked, or opened and needs drywall repair rather than paint alone.",
    serviceIds: ["drywall"],
  },
  {
    id: "water-damaged-ceiling",
    slug: "water-damaged-ceiling",
    name: "Water-damaged ceiling",
    description:
      "A ceiling stain, bubble, or soft spot after a leak. The leak source, the drywall, and the finish are often separate parts of the same homeowner problem.",
    serviceIds: ["plumbing", "drywall", "painting"],
  },
  {
    id: "unfinished-drywall-repair",
    slug: "unfinished-drywall-repair",
    name: "Unfinished drywall repair",
    description:
      "A patch that was started but not taped, coated, or sanded to a paintable surface.",
    serviceIds: ["drywall"],
  },
  {
    id: "cracked-floor-tile",
    slug: "cracked-floor-tile",
    name: "Cracked floor tile",
    description:
      "One or more floor tiles that are cracked and need replacement rather than a full floor redo.",
    serviceIds: ["tile"],
  },
  {
    id: "loose-backsplash-tile",
    slug: "loose-backsplash-tile",
    name: "Loose backsplash tile",
    description:
      "Kitchen or bath backsplash tiles that have loosened or fallen.",
    serviceIds: ["tile"],
  },
  {
    id: "bathroom-floor-tile-repair",
    slug: "bathroom-floor-tile-repair",
    name: "Bathroom floor tile repair",
    description:
      "Bathroom floor tile that is cracked, loose, or missing in a limited area.",
    serviceIds: ["tile"],
  },
  {
    id: "crumbling-grout",
    slug: "crumbling-grout",
    name: "Crumbling grout",
    description:
      "Grout that is cracking or washing out. This is a repair need, not a claim of specialty stone restoration.",
    serviceIds: ["tile"],
  },
  {
    id: "cracked-shower-tile",
    slug: "cracked-shower-tile",
    name: "Cracked shower tile",
    description:
      "Shower wall tile that is cracked or loose. Waterproofing behind the tile is part of the project question, not something A5 diagnoses from a photo alone.",
    serviceIds: ["tile"],
  },
  {
    id: "dripping-faucet",
    slug: "dripping-faucet",
    name: "Dripping faucet",
    description:
      "A faucet that drips or a handle that no longer shuts the water off cleanly.",
    serviceIds: ["plumbing"],
  },
  {
    id: "running-toilet",
    slug: "running-toilet",
    name: "Running toilet",
    description:
      "A toilet that keeps running, refills constantly, or has a weak flush.",
    serviceIds: ["plumbing"],
  },
  {
    id: "visible-pipe-leak",
    slug: "visible-pipe-leak",
    name: "Visible pipe leak",
    description:
      "A leak the homeowner can see at a pipe, valve, or supply line. Not an emergency-dispatch promise.",
    serviceIds: ["plumbing"],
  },
  {
    id: "fixture-replacement",
    slug: "fixture-replacement",
    name: "Fixture replacement",
    description:
      "Replacing a faucet, toilet, or similar plumbing fixture as a planned project.",
    serviceIds: ["plumbing"],
  },
  {
    id: "water-heater-replacement-project",
    slug: "water-heater-replacement-project",
    name: "Water heater replacement project",
    description:
      "A water heater the homeowner wants replaced or evaluated as a scheduled project rather than an urgent dispatch.",
    serviceIds: ["plumbing"],
  },
  {
    id: "failed-light-fixture",
    slug: "failed-light-fixture",
    name: "Failed light fixture",
    description:
      "A light that does not work, flickers, or needs the fixture itself replaced.",
    serviceIds: ["electrical"],
  },
  {
    id: "dead-outlet",
    slug: "dead-outlet",
    name: "Dead outlet",
    description:
      "An outlet that has no power or works intermittently.",
    serviceIds: ["electrical"],
  },
  {
    id: "faulty-switch",
    slug: "faulty-switch",
    name: "Faulty switch",
    description:
      "A switch that is loose, cracked, or no longer controls the light reliably.",
    serviceIds: ["electrical"],
  },
  {
    id: "ceiling-fan-project",
    slug: "ceiling-fan-project",
    name: "Ceiling fan project",
    description:
      "Installing or replacing a ceiling fan, including the question of whether the box and wiring can support it.",
    serviceIds: ["electrical"],
  },
  {
    id: "lighting-update",
    slug: "lighting-update",
    name: "Lighting update",
    description:
      "A planned change of lighting fixtures in a room or on a porch.",
    serviceIds: ["electrical"],
  },
  {
    id: "recurring-electrical-issue",
    slug: "recurring-electrical-issue",
    name: "Recurring electrical issue",
    description:
      "A circuit, fixture, or device that keeps failing and needs a qualified electrical professional to look at the cause.",
    serviceIds: ["electrical"],
  },
];

export type ServiceResearch = {
  serviceId: ServiceId;
  intent: string;
  subservices: readonly string[];
  decisionQuestions: readonly string[];
  relatedServices: readonly ServiceId[];
  plannedProblemPages: readonly string[];
  plannedLaterPages: readonly string[];
  claimsRequiringSources: readonly string[];
};

export const SERVICE_RESEARCH: Record<ServiceId, ServiceResearch> = {
  handyman: {
    serviceId: "handyman",
    intent: "Small, mixed repairs a homeowner does not want to split across several specialists.",
    subservices: [
      "general home repairs",
      "doors",
      "trim",
      "small carpentry",
      "mounting",
      "punch-list work",
      "hardware replacement",
    ],
    decisionQuestions: [
      "Is this a small repair or a regulated trade?",
      "Can several punch-list items be handled in one visit?",
    ],
    relatedServices: ["drywall", "painting", "tile"],
    plannedProblemPages: [
      "sticking-interior-door",
      "loose-or-damaged-trim",
      "wall-mounting",
    ],
    plannedLaterPages: ["cost guide for small repair visits", "local handyman variants"],
    claimsRequiringSources: [],
  },
  masonry: {
    serviceId: "masonry",
    intent: "Brick, stone, paver, and mortar problems on steps, walks, patios, and low walls.",
    subservices: [
      "brick repair",
      "front steps",
      "pavers",
      "patios",
      "walkways",
      "retaining walls",
      "stone repair",
      "repointing",
    ],
    decisionQuestions: [
      "Is the issue the units, the mortar, or the base underneath?",
      "Is wall movement severe enough to need an engineer before repair?",
    ],
    relatedServices: ["landscaping"],
    plannedProblemPages: [
      "brick-step-repair",
      "sunken-pavers",
      "loose-mortar",
      "damaged-brick-walkway",
    ],
    plannedLaterPages: ["cost guide for brick step repair", "comparison of patch vs rebuild"],
    claimsRequiringSources: [],
  },
  landscaping: {
    serviceId: "landscaping",
    intent: "Cleanup, planting, beds, and surface-grade yard work within ordinary landscape scope.",
    subservices: [
      "landscape cleanup",
      "planting",
      "beds",
      "surface grading",
      "seasonal yard work",
    ],
    decisionQuestions: [
      "Is this cleanup, planting, or a grade problem?",
      "Is the homeowner asking for a drainage system A5 is not offering here?",
    ],
    relatedServices: ["masonry"],
    plannedProblemPages: ["overgrown-planting-beds", "landscape-cleanup", "yard-surface-grading"],
    plannedLaterPages: ["seasonal cleanup guide"],
    claimsRequiringSources: [],
  },
  painting: {
    serviceId: "painting",
    intent: "Interior and exterior paint, including preparation after wear or after a repair.",
    subservices: [
      "interior painting",
      "exterior painting",
      "walls",
      "ceilings",
      "trim",
      "touch-up after repair",
    ],
    decisionQuestions: [
      "Does the surface need prep, or only a finish coat?",
      "Is there an open repair underneath the paint?",
    ],
    relatedServices: ["drywall", "handyman"],
    plannedProblemPages: ["worn-interior-paint", "peeling-exterior-paint", "paint-after-patching"],
    plannedLaterPages: ["interior vs exterior comparison"],
    claimsRequiringSources: [],
  },
  drywall: {
    serviceId: "drywall",
    intent: "Holes, cracks, ceiling damage, and finishing a patch so it can be painted.",
    subservices: [
      "holes",
      "cracks",
      "ceiling damage",
      "patching",
      "replacement of a section",
      "finishing",
    ],
    decisionQuestions: [
      "Is this a small patch or a section that should be replaced?",
      "Is water still getting in?",
    ],
    relatedServices: ["painting", "plumbing"],
    plannedProblemPages: ["hole-in-drywall", "drywall-crack", "water-damaged-ceiling"],
    plannedLaterPages: ["guide on patch vs replace"],
    claimsRequiringSources: [],
  },
  tile: {
    serviceId: "tile",
    intent: "Limited tile and grout repair in baths, kitchens, and floors — not specialty restoration.",
    subservices: [
      "tile repair",
      "bathroom tile",
      "backsplash",
      "floor tile",
      "cracked tile",
      "grout repair",
    ],
    decisionQuestions: [
      "Can the damaged tiles be matched?",
      "Is shower damage only the tile, or is the backing wet?",
    ],
    relatedServices: ["plumbing", "handyman"],
    plannedProblemPages: ["cracked-floor-tile", "loose-backsplash-tile", "crumbling-grout"],
    plannedLaterPages: ["cost guide for single-tile replacement"],
    claimsRequiringSources: [],
  },
  plumbing: {
    serviceId: "plumbing",
    intent: "Leaks, fixtures, toilets, and planned water-heater projects coordinated with qualified plumbing professionals.",
    subservices: [
      "leaks",
      "faucets",
      "fixtures",
      "toilets",
      "pipes",
      "water-heater projects",
    ],
    decisionQuestions: [
      "Is the leak visible and contained, or still active?",
      "Is this a repair or a fixture replacement?",
    ],
    relatedServices: ["drywall", "tile"],
    plannedProblemPages: ["dripping-faucet", "running-toilet", "visible-pipe-leak"],
    plannedLaterPages: ["fixture replacement cost guide"],
    claimsRequiringSources: [],
  },
  electrical: {
    serviceId: "electrical",
    intent: "Lighting, outlets, switches, ceiling fans, and electrical repairs coordinated with qualified electrical professionals.",
    subservices: [
      "lighting",
      "fixtures",
      "outlets",
      "switches",
      "ceiling fans",
      "electrical repair",
    ],
    decisionQuestions: [
      "Is one device dead, or is a circuit involved?",
      "Can the existing box support a fan?",
    ],
    relatedServices: ["handyman"],
    plannedProblemPages: ["failed-light-fixture", "dead-outlet", "ceiling-fan-project"],
    plannedLaterPages: ["lighting update guide"],
    claimsRequiringSources: [],
  },
};

export type ServiceHubDefinition = {
  id: string;
  serviceId: ServiceId;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  primaryQuestion: string;
  directAnswer: string;
  sections: ContentSection[];
};

function areaParagraph(): string {
  const names = LOCATIONS.map((location) => location.name);
  const last = names[names.length - 1] ?? "";
  const rest = names.slice(0, -1).join(", ");
  return `A5 currently coordinates projects for homeowners in ${rest}, and ${last}, New Jersey. This page is the service hub, not a town page.`;
}

function problemsFor(serviceId: ServiceId): ProblemLink[] {
  return G002_PROBLEMS.filter((problem) =>
    problem.serviceIds.includes(serviceId),
  );
}

function problemParagraph(serviceId: ServiceId): string {
  const names = problemsFor(serviceId).map((problem) => problem.name.toLowerCase());
  const last = names[names.length - 1] ?? "";
  const rest = names.slice(0, -1).join(", ");
  return `Homeowners usually arrive with a specific problem: ${rest}, or ${last}.`;
}

const HUB_COPY: Record<
  ServiceId,
  {
    title: string;
    metaTitle: string;
    metaDescription: string;
    h1: string;
    directAnswer: string;
    intro: string;
    projects: string[];
    how: string[];
    related: string;
    questions: { question: string; answer: string }[];
  }
> = {
  handyman: {
    title: "Handyman repairs",
    metaTitle: "Handyman repairs for small home projects | A5",
    metaDescription:
      "A5 coordinates handyman help for doors, trim, mounting, hardware, and punch-list repairs in Northern New Jersey. Regulated plumbing and electrical work stays with those trades.",
    h1: "Handyman repairs and small home projects",
    directAnswer:
      "A5 helps with small, mixed home repairs: doors that stick, loose trim, mounting, worn hardware, and punch-list items. If the work is regulated plumbing or electrical, A5 treats it as that trade instead of folding it into a handyman visit.",
    intro:
      "A handyman request is usually a short list, not a single specialty. The useful question is which items are ordinary finish repairs and which ones belong with a plumber or electrician.",
    projects: [
      "Adjust or repair an interior door that rubs or will not latch.",
      "Re-secure or replace a limited run of trim or casing.",
      "Mount a television, shelf, or curtain hardware.",
      "Replace worn hinges, handles, or other door hardware.",
      "Work through a punch list of small finish repairs.",
    ],
    how: [
      "You describe the list and, if you want, share photos.",
      "A5 reviews the request and separates ordinary repairs from work that should be plumbing or electrical.",
      "A5 then coordinates an appropriate local professional for the items that fit.",
    ],
    related:
      "Drywall holes, paint after a patch, and loose tile often show up on the same list. Those are related services, not automatic add-ons.",
    questions: [
      {
        question: "Will a handyman also do plumbing or electrical?",
        answer:
          "No. A5 does not treat regulated plumbing or electrical repairs as handyman work. Those requests are coordinated on the plumbing or electrical path.",
      },
      {
        question: "Can I send several small items at once?",
        answer:
          "Yes. A punch list is a normal handyman request. Describe each item so A5 can see whether they belong together.",
      },
      {
        question: "Do I need to know the exact trade?",
        answer:
          "No. If you are unsure, say what is happening. A5 can classify the request without you picking a specialty first.",
      },
    ],
  },
  masonry: {
    title: "Masonry repair",
    metaTitle: "Masonry repair for steps, pavers, and mortar | A5",
    metaDescription:
      "A5 coordinates masonry repair for cracked brick steps, loose mortar, sunken pavers, walkways, patios, and low walls in Northern New Jersey.",
    h1: "Masonry repair for brick, stone, and pavers",
    directAnswer:
      "A5 helps homeowners with masonry that is cracking, settling, or losing mortar: brick steps, walkways, paver patios, stone repair, and low retaining walls. A5 coordinates a masonry professional; a badly moving wall may need an engineer before anyone rebuilds it.",
    intro:
      "Masonry problems are usually visible. A step has cracked, a paver rocks underfoot, or the mortar between bricks is falling out. The repair depends on whether the units failed, the joints failed, or the base underneath moved.",
    projects: [
      "Repair cracked or uneven brick front steps.",
      "Reset sunken or rocking pavers on a walk or patio.",
      "Repoint brick or stone where mortar has failed.",
      "Repair a damaged brick walkway.",
      "Address a low retaining wall that is separating or leaning, when the scope is a masonry repair rather than an engineering design.",
    ],
    how: [
      "You describe what moved, cracked, or became uneven, and where it is on the property.",
      "A5 reviews whether the request is a masonry repair A5 can coordinate.",
      "A local masonry professional then looks at the condition and discusses the repair.",
    ],
    related:
      "Yard grade and planting beds sometimes sit next to a failing walk or wall. That landscape work is a separate service when the homeowner wants it.",
    questions: [
      {
        question: "Is every cracked step a full rebuild?",
        answer:
          "Not necessarily. Some steps need joint repair or a limited reset. A5 does not decide that from a description alone; the masonry professional does after seeing the steps.",
      },
      {
        question: "What if a retaining wall is leaning a lot?",
        answer:
          "Significant movement can be a structural question, not only a masonry patch. A5 will not pretend a cosmetic repoint fixes a wall that needs engineering.",
      },
      {
        question: "Do you manufacture brick or stone?",
        answer:
          "No. A5 coordinates the repair. Matching older brick or pavers depends on what is still available, which the professional confirms on site.",
      },
    ],
  },
  landscaping: {
    title: "Landscaping",
    metaTitle: "Landscape cleanup, planting, and yard work | A5",
    metaDescription:
      "A5 coordinates landscape cleanup, planting beds, seasonal yard work, and surface grading for Northern New Jersey homeowners. Not a drainage-engineering service.",
    h1: "Landscape cleanup, planting, and yard improvements",
    directAnswer:
      "A5 helps with landscape cleanup, overgrown beds, planting, seasonal yard work, and surface grading where water sits because the yard slopes the wrong way. A5 does not design buried drainage systems or invent landscape services outside that scope.",
    intro:
      "A landscape request is about the yard as the homeowner uses it: beds that have taken over, a cleanup before a season changes, or a low spot that holds water against the house.",
    projects: [
      "Clean up overgrown beds and remove debris.",
      "Edge, prepare, and plant new beds.",
      "Cut back and refresh beds as seasonal work.",
      "Regrade a surface area so water moves away from a low spot.",
    ],
    how: [
      "You describe the yard condition and what you want changed.",
      "A5 reviews whether the request is cleanup, planting, or surface grading.",
      "A5 coordinates a local landscape professional for that scope.",
    ],
    related:
      "A sinking paver walk or a masonry wall at the edge of a bed is masonry work. A5 keeps those as a separate service when they are part of the same property.",
    questions: [
      {
        question: "Can A5 install a French drain or dry well?",
        answer:
          "Not as part of this service hub. Surface grading of a yard or bed is in scope. Buried drainage design is not something A5 is offering here.",
      },
      {
        question: "Is seasonal cleanup the same as a redesign?",
        answer:
          "No. Cleanup and cutbacks are maintenance. New beds and planting are a project. Say which one you want.",
      },
      {
        question: "Do I need a landscape plan first?",
        answer:
          "Not for a cleanup or a straightforward bed. If you want a larger redesign, describe that so A5 does not treat it as a cleanup visit.",
      },
    ],
  },
  painting: {
    title: "Painting",
    metaTitle: "Interior and exterior house painting | A5",
    metaDescription:
      "A5 coordinates interior and exterior painting for walls, ceilings, and trim in Northern New Jersey, including paint after a repair.",
    h1: "Interior and exterior painting",
    directAnswer:
      "A5 helps homeowners repaint walls, ceilings, and trim indoors or outside, including a finish coat after a patch. Preparation matters: peeling paint and unrepaired drywall are part of the project, not something a single coat hides.",
    intro:
      "Painting requests split into two kinds. One is a room or exterior that simply needs a new coat. The other is a surface that failed, or a repair that still shows, and has to be prepared before it is painted.",
    projects: [
      "Repaint interior walls or ceilings.",
      "Repaint exterior siding or trim after proper preparation.",
      "Paint window, door, and base trim.",
      "Paint a wall or ceiling after drywall patching.",
    ],
    how: [
      "You say which rooms or exterior surfaces, and whether the paint is only worn or actually failing.",
      "A5 reviews the request, including whether a drywall repair should happen first.",
      "A local painting professional then coordinates the preparation and the coating.",
    ],
    related:
      "Open holes, cracks, and water-damaged ceilings are drywall problems first. A leak above a stain is a plumbing question. Paint is the finish after those are addressed.",
    questions: [
      {
        question: "Can you paint over a water stain?",
        answer:
          "Only after the leak has stopped and the ceiling is sound. Painting a wet or soft ceiling does not fix the cause. A5 will not describe stain-blocking as a leak repair.",
      },
      {
        question: "Do interiors and exteriors use the same process?",
        answer:
          "No. Exterior work usually needs more surface preparation where paint is peeling. Interior work is often walls, ceilings, and trim with different wear.",
      },
      {
        question: "Will the color match exactly?",
        answer:
          "A5 does not promise a factory match. If you have a color name or a sample, include it. The painter confirms what can be matched.",
      },
    ],
  },
  drywall: {
    title: "Drywall repair",
    metaTitle: "Drywall repair for holes, cracks, and ceilings | A5",
    metaDescription:
      "A5 coordinates drywall repair for holes, cracks, ceiling damage, and finishing a patch in Northern New Jersey. Water leaks are coordinated separately when needed.",
    h1: "Drywall repair and finishing",
    directAnswer:
      "A5 helps with holes, cracks, damaged ceiling drywall, and patches that were never finished. If the ceiling is wet because something leaked, the leak is a plumbing problem and the surface repair is drywall; paint comes after the patch is ready.",
    intro:
      "Drywall fails in obvious ways: a hole from a doorknob, a crack at a seam, or a ceiling that stained and went soft. The repair is taping, coating, and sanding — or replacing a section when the board itself is gone.",
    projects: [
      "Patch a hole in a wall.",
      "Open and retape a crack that keeps returning.",
      "Repair or replace a damaged section of ceiling drywall.",
      "Finish a patch that was left untaped or unsanded.",
    ],
    how: [
      "You describe the damage and whether water was involved.",
      "A5 separates an active leak from the drywall repair itself.",
      "A local professional then patches or replaces the board and leaves it ready for paint.",
    ],
    related:
      "A water-damaged ceiling can need plumbing, drywall, and painting. A5 keeps those as related services so a paint-only visit is not scheduled over an open leak.",
    questions: [
      {
        question: "Is every crack just a coat of mud?",
        answer:
          "Hairline cracks sometimes are. Cracks that reopen, or ceilings that sag, may need the paper and tape redone or the board replaced. A5 does not decide that from a message alone.",
      },
      {
        question: "Will the patch be invisible before paint?",
        answer:
          "A finished patch should be smooth enough to paint. It will still show until it is painted. Painting is a separate step.",
      },
      {
        question: "What if the ceiling is still damp?",
        answer:
          "The leak should be stopped before the ceiling is closed up. A5 coordinates the plumbing question separately when that is what the photos or description show.",
      },
    ],
  },
  tile: {
    title: "Tile repair",
    metaTitle: "Tile repair for floors, baths, and backsplashes | A5",
    metaDescription:
      "A5 coordinates tile repair for cracked floors, loose backsplash, bathroom tile, and failing grout in Northern New Jersey. Not a specialty restoration service.",
    h1: "Tile repair for floors, baths, and backsplashes",
    directAnswer:
      "A5 helps with cracked floor tile, loose backsplash tile, limited bathroom tile repair, and grout that is crumbling. A5 does not offer specialty historic restoration or promise that discontinued tile can be matched.",
    intro:
      "Tile requests are usually local: one cracked floor tile, a backsplash piece that fell off, or grout that has washed out of a shower. The practical limit is whether a replacement piece exists and whether the surface behind a wet-area tile is still sound.",
    projects: [
      "Replace cracked floor tiles where a match is possible.",
      "Reset loose backsplash tile.",
      "Repair a limited area of bathroom floor tile.",
      "Repair crumbling grout.",
      "Replace cracked shower tile when the homeowner wants that scoped as a repair, not a full remodel.",
    ],
    how: [
      "You describe which tiles failed and whether the area gets wet.",
      "A5 reviews the request as a repair, not as a restoration claim.",
      "A local tile professional confirms whether pieces can be matched and what the repair involves.",
    ],
    related:
      "A leaking shower valve or supply is plumbing. A5 does not treat a plumbing leak as a tile-only job.",
    questions: [
      {
        question: "Can you match my old tile?",
        answer:
          "Sometimes, if the tile is still made or you have spares. A5 will not promise a match for a discontinued pattern.",
      },
      {
        question: "Is regrouting a full waterproofing job?",
        answer:
          "No. Replacing failed grout is a repair. If the shower backing is wet or soft, that is a larger question the professional has to see.",
      },
      {
        question: "Do you restore antique or historic tile?",
        answer:
          "No. This service is ordinary residential tile repair, not specialty restoration.",
      },
    ],
  },
  plumbing: {
    title: "Plumbing",
    metaTitle: "Plumbing repairs and fixture projects | A5",
    metaDescription:
      "A5 coordinates qualified plumbing professionals for leaks, faucets, toilets, pipes, and water-heater projects in Northern New Jersey. No emergency dispatch.",
    h1: "Plumbing repairs and fixture projects",
    directAnswer:
      "A5 helps homeowners coordinate qualified plumbing professionals for dripping faucets, running toilets, visible leaks, fixture replacement, and planned water-heater projects. A5 does not offer emergency dispatch, and A5 staff do not perform regulated plumbing work.",
    intro:
      "Plumbing requests are about water that will not stop, a fixture that failed, or a replacement the homeowner already knows they want. The first distinction is whether something is actively leaking or whether it is a scheduled repair.",
    projects: [
      "Repair or replace a dripping faucet.",
      "Repair a toilet that keeps running.",
      "Address a visible leak at a pipe, valve, or supply line.",
      "Replace a faucet, toilet, or similar fixture.",
      "Coordinate a water-heater replacement as a planned project.",
    ],
    how: [
      "You describe the fixture or leak and whether water is still escaping.",
      "A5 reviews the request and coordinates a qualified plumbing professional. A5 does not send unlicensed staff to do the plumbing.",
      "That professional contacts you to look at the condition and discuss the repair. If you have an active emergency, use local emergency services; A5 is not an emergency plumber.",
    ],
    related:
      "A ceiling stain after a leak can also need drywall and paint. A5 can keep those related, but the plumbing problem is the leak itself.",
    questions: [
      {
        question: "Is A5 an emergency plumbing service?",
        answer:
          "No. A5 does not offer 24-hour emergency dispatch. If water is causing immediate damage, shut off the supply if you can do that safely and contact an emergency plumber or your utility.",
      },
      {
        question: "Who does the plumbing work?",
        answer:
          "A qualified plumbing professional coordinated for the job. A5 does not describe its own office staff as the people performing regulated plumbing.",
      },
      {
        question: "Can you replace a water heater this visit?",
        answer:
          "A5 can take a water-heater replacement as a project request. Timing depends on the professional and the unit. A5 does not promise an immediate visit.",
      },
    ],
  },
  electrical: {
    title: "Electrical",
    metaTitle: "Electrical repairs, lighting, and fixtures | A5",
    metaDescription:
      "A5 coordinates qualified electrical professionals for lights, outlets, switches, and ceiling fans in Northern New Jersey. No emergency electrical dispatch.",
    h1: "Electrical repairs and lighting projects",
    directAnswer:
      "A5 helps homeowners coordinate qualified electrical professionals for lights, outlets, switches, ceiling fans, and similar repair or replacement projects. A5 does not offer emergency electrical dispatch, and A5 staff do not perform regulated electrical work.",
    intro:
      "Electrical requests are usually a device that failed or a fixture the homeowner wants changed. A dead outlet, a switch that sparks or sticks, and a ceiling fan are different jobs even though they share a trade.",
    projects: [
      "Replace a light fixture that failed or flickers.",
      "Look at an outlet that has no power.",
      "Replace a faulty switch.",
      "Install or replace a ceiling fan when the box can support it.",
      "Update lighting in a room as a planned project.",
    ],
    how: [
      "You describe the device and what it is doing, without taking apart the wiring.",
      "A5 reviews the request and coordinates a qualified electrical professional. A5 does not send unlicensed staff to do the electrical work.",
      "That professional inspects the condition. A5 is not an emergency electrician.",
    ],
    related:
      "Mounting a shelf or television can be handyman work when it is not an electrical circuit. If the request includes new wiring or a dead circuit, it stays on this electrical path.",
    questions: [
      {
        question: "Is A5 an emergency electrician?",
        answer:
          "No. A5 does not offer emergency electrical dispatch. If you smell burning, see sparking you cannot shut off, or have a downed line, leave the area and contact emergency services or your utility.",
      },
      {
        question: "Who performs the electrical work?",
        answer:
          "A qualified electrical professional coordinated for the project. A5 does not claim that unlicensed A5 personnel do regulated electrical work.",
      },
      {
        question: "Can any ceiling box hold a fan?",
        answer:
          "No. The professional has to confirm the box and the wiring. A5 will not promise a fan install before that is checked.",
      },
    ],
  },
};

function buildSections(serviceId: ServiceId): ContentSection[] {
  const copy = HUB_COPY[serviceId];
  return [
    { type: "INTRO", body: copy.intro },
    {
      type: "RICH_TEXT",
      heading: "Common homeowner problems",
      paragraphs: [problemParagraph(serviceId)],
    },
    {
      type: "RICH_TEXT",
      heading: "Projects A5 coordinates",
      paragraphs: copy.projects,
    },
    {
      type: "RICH_TEXT",
      heading: "How A5 works",
      paragraphs: copy.how,
    },
    {
      type: "RICH_TEXT",
      heading: "Related service needs",
      paragraphs: [copy.related],
    },
    {
      type: "RICH_TEXT",
      heading: "Service area",
      paragraphs: [areaParagraph()],
    },
    {
      type: "QUESTION_ANSWER",
      items: copy.questions,
    },
    {
      type: "CTA",
      title: "Get Help With a Project",
      description: `Tell A5 what is happening with this ${SERVICES.find((service) => service.id === serviceId)?.name.toLowerCase() ?? "service"} need. A5 reviews the request and coordinates an appropriate next step.`,
    },
  ];
}

export const SERVICE_HUBS: readonly ServiceHubDefinition[] = SERVICES.map(
  (service) => {
    const copy = HUB_COPY[service.id];
    return {
      id: HUB_IDS[service.id],
      serviceId: service.id,
      slug: service.slug,
      title: copy.title,
      metaTitle: copy.metaTitle,
      metaDescription: copy.metaDescription,
      h1: copy.h1,
      primaryQuestion: `What can A5 help with for ${service.name.toLowerCase()}?`,
      directAnswer: copy.directAnswer,
      sections: buildSections(service.id),
    };
  },
);

export function serviceHubById(
  serviceId: ServiceId,
): ServiceHubDefinition | undefined {
  return SERVICE_HUBS.find((hub) => hub.serviceId === serviceId);
}

export function hubToContentPage(hub: ServiceHubDefinition): ContentPageRecord {
  return {
    id: hub.id,
    slug: hub.slug,
    page_type: "SERVICE",
    title: hub.title,
    meta_title: hub.metaTitle,
    meta_description: hub.metaDescription,
    h1: hub.h1,
    primary_service_id: hub.serviceId,
    primary_location_id: null,
    primary_problem_id: null,
    primary_question: hub.primaryQuestion,
    direct_answer: hub.directAnswer,
    sections: hub.sections,
    status: G002_HUB_STATUS,
    indexable: false,
    ai_assisted: true,
    created_by: "cursor-g002",
    reviewed_by: null,
    created_at: "2026-09-27T16:00:00.000Z",
    updated_at: "2026-09-27T16:00:00.000Z",
    reviewed_at: null,
    published_at: null,
    last_reviewed_at: null,
    cost_methodology: null,
    cost_geography: null,
    public_project_approved: false,
  };
}

export function problemsForService(serviceId: ServiceId): ProblemLink[] {
  return problemsFor(serviceId);
}

export function multiServiceProblems(): ProblemLink[] {
  return G002_PROBLEMS.filter((problem) => problem.serviceIds.length > 1);
}
