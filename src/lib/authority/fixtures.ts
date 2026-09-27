/**
 * G001 proof fixtures — DRAFT / indexable=false by default.
 * Mirrors seed SQL; used for unit tests without a live database.
 */

import type {
  ContentPageRecord,
  ContentRelationship,
  ContentSection,
  ContentSourceLink,
  ProblemRecord,
  SourceRecord,
} from "./types.ts";

const NOW = "2026-09-23T18:00:00.000Z";

export const FIXTURE_PROBLEM: ProblemRecord = {
  id: "brick-step-repair",
  slug: "brick-step-repair",
  name: "Brick Step Repair",
  description:
    "Brick front steps that are cracking, shifting, crumbling, or becoming uneven — a common masonry concern for Northern New Jersey homeowners.",
  created_at: NOW,
};

export const FIXTURE_PROBLEM_SERVICE_IDS = ["masonry"] as const;

export const FIXTURE_SOURCE: SourceRecord = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Brick masonry maintenance overview (industry reference)",
  url: "https://www.bia.org/",
  publisher: "Brick Industry Association",
  source_type: "INDUSTRY",
  retrieved_at: NOW,
  reviewed_at: NOW,
};

function basePage(
  partial: Omit<ContentPageRecord, "created_at" | "updated_at" | "sections"> & {
    sections: ContentSection[];
  },
): ContentPageRecord {
  return {
    ...partial,
    created_at: NOW,
    updated_at: NOW,
  };
}

const masonrySections: ContentSection[] = [
  {
    type: "INTRO",
    body: "A5 coordinates masonry projects for homeowners across our approved Northern New Jersey communities — from small brick repairs to larger rebuilds.",
  },
  {
    type: "RICH_TEXT",
    heading: "Problems A5 can help coordinate",
    paragraphs: [
      "Homeowners often contact A5 about cracked brick steps, failing mortar joints, settling walkways, and damaged retaining walls.",
      "A5 reviews the request and coordinates an appropriate local masonry professional — A5 does not invent a diagnosis from photos or symptoms alone.",
    ],
  },
  {
    type: "QUESTION_ANSWER",
    items: [
      {
        question: "Does A5 perform masonry work with in-house crews?",
        answer:
          "A5 is a home-services contractor and project-coordination company. After intake, A5 connects the homeowner with an appropriate local professional for the work.",
      },
    ],
  },
  { type: "RELATED_CONTENT" },
  {
    type: "CTA",
    title: "Need help with a masonry project?",
    description:
      "Tell A5 what is happening at your home. We will review the request and coordinate next steps.",
  },
];

export const FIXTURE_SERVICE_PAGE = basePage({
  id: "10000000-0000-4000-8000-000000000001",
  slug: "masonry",
  page_type: "SERVICE",
  title: "Masonry",
  meta_title: "Masonry Services | A5 Home Services",
  meta_description:
    "A5 coordinates masonry projects for homeowners in Northern New Jersey — brick steps, walkways, walls, and related repairs.",
  h1: "Masonry",
  primary_service_id: "masonry",
  primary_location_id: null,
  primary_problem_id: null,
  primary_question: "Who can help with masonry projects near me?",
  direct_answer:
    "A5 Home Services coordinates masonry projects for homeowners in Madison, Florham Park, Chatham, Morristown, Morris Township, and East Hanover.",
  sections: masonrySections,
  status: "DRAFT",
  indexable: false,
  ai_assisted: true,
  created_by: "cursor-g001",
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
  last_reviewed_at: null,
  cost_methodology: null,
  cost_geography: null,
  public_project_approved: false,
});

const madisonSections: ContentSection[] = [
  {
    type: "INTRO",
    body: "A5 Home Services coordinates approved home-service projects for Madison, NJ homeowners — including masonry, handyman work, landscaping, painting, drywall, tile, plumbing, and electrical.",
  },
  {
    type: "RICH_TEXT",
    heading: "How A5 works in Madison",
    paragraphs: [
      "Submit a project request with what you need and where the work is. A5 reviews the request and coordinates an appropriate local professional.",
      "This page is a draft architecture fixture for G001 — it does not invent local observations or claim completed Madison projects.",
    ],
  },
  { type: "RELATED_CONTENT" },
  {
    type: "CTA",
    title: "Request service in Madison",
    description:
      "Describe the project. A5 will review and coordinate next steps.",
  },
];

export const FIXTURE_LOCATION_PAGE = basePage({
  id: "10000000-0000-4000-8000-000000000002",
  slug: "madison",
  page_type: "LOCATION",
  title: "Home Services in Madison, NJ",
  meta_title: "Home Services in Madison, NJ | A5 Home Services",
  meta_description:
    "A5 coordinates home-service projects for Madison, New Jersey homeowners across approved trades.",
  h1: "Home Services in Madison, NJ",
  primary_service_id: null,
  primary_location_id: "madison",
  primary_problem_id: null,
  primary_question: "Does A5 serve Madison, NJ?",
  direct_answer:
    "Yes. Madison is one of A5's approved Northern New Jersey service locations.",
  sections: madisonSections,
  status: "DRAFT",
  indexable: false,
  ai_assisted: true,
  created_by: "cursor-g001",
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
  last_reviewed_at: null,
  cost_methodology: null,
  cost_geography: null,
  public_project_approved: false,
});

const madisonMasonrySections: ContentSection[] = [
  {
    type: "INTRO",
    body: "A5 coordinates masonry projects for Madison, NJ homeowners — including brick step concerns, walkway repairs, and related masonry work — with local context rather than a town-name swap.",
  },
  {
    type: "DIRECT_ANSWER",
    body: "Madison homeowners can request masonry help through A5. A5 reviews the project and coordinates an appropriate local professional serving Madison and nearby Morris County communities.",
  },
  {
    type: "RICH_TEXT",
    heading: "Local masonry context (draft fixture)",
    paragraphs: [
      "Older Madison neighborhoods often include brick stoops and masonry walkways that see freeze-thaw cycles each winter. When steps crack or settle, homeowners typically want clarity on repair versus rebuild before committing to work.",
      "This draft fixture exists to prove service×location architecture. It does not claim completed A5 projects in Madison and must not be published without owner review and differentiated evidence.",
    ],
  },
  { type: "RELATED_CONTENT" },
  {
    type: "CTA",
    title: "Request masonry help in Madison",
    description: "Share photos and a short description of what you are seeing.",
  },
];

export const FIXTURE_SERVICE_LOCATION_PAGE = basePage({
  id: "10000000-0000-4000-8000-000000000003",
  slug: "madison-masonry",
  page_type: "SERVICE_LOCATION",
  title: "Masonry in Madison, NJ",
  meta_title: "Masonry in Madison, NJ | A5 Home Services",
  meta_description:
    "A5 coordinates masonry projects for Madison, New Jersey homeowners — brick steps, walkways, and related repairs.",
  h1: "Masonry in Madison, NJ",
  primary_service_id: "masonry",
  primary_location_id: "madison",
  primary_problem_id: null,
  primary_question: "Can A5 help with masonry in Madison, NJ?",
  direct_answer:
    "Yes. A5 coordinates masonry projects for Madison homeowners and connects them with an appropriate local professional after intake review.",
  sections: madisonMasonrySections,
  status: "DRAFT",
  indexable: false,
  ai_assisted: true,
  created_by: "cursor-g001",
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
  last_reviewed_at: null,
  cost_methodology: null,
  cost_geography: null,
  public_project_approved: false,
});

const problemSections: ContentSection[] = [
  {
    type: "DIRECT_ANSWER",
    body: "Brick steps crack for several common reasons — settlement, freeze-thaw, failing mortar, or impact. A5 can coordinate a masonry professional to inspect and discuss repair versus rebuild options. This is not a remote diagnosis.",
  },
  {
    type: "RICH_TEXT",
    heading: "What the problem looks like",
    paragraphs: [
      "Homeowners often notice hairline cracks in treads, crumbling mortar joints, uneven risers, loose bricks, or steps that tilt away from the house.",
      "Photos help A5's intake review, but only an on-site professional can determine the right repair approach.",
    ],
  },
  {
    type: "RICH_TEXT",
    heading: "Common causes",
    paragraphs: [
      "Soil settlement, water intrusion, freeze-thaw cycles common in Northern New Jersey winters, deteriorating mortar, and age-related wear.",
    ],
  },
  {
    type: "RICH_TEXT",
    heading: "Repair vs replacement",
    paragraphs: [
      "Minor mortar and brick replacement may be enough when the structure is sound. Extensive settlement or failed foundations often call for rebuild. A5 does not present a one-size answer from a web form.",
    ],
  },
  {
    type: "QUESTION_ANSWER",
    items: [
      {
        question: "Is a cracked brick step always an emergency?",
        answer:
          "Not always, but uneven or loose steps can be a trip hazard. If steps feel unstable, limit use and request a professional assessment.",
      },
    ],
  },
  { type: "SOURCE_LIST" },
  { type: "RELATED_CONTENT" },
  {
    type: "CTA",
    title: "Get help with brick step concerns",
    description: "Request service and share what you are seeing at home.",
  },
];

export const FIXTURE_PROBLEM_PAGE = basePage({
  id: "10000000-0000-4000-8000-000000000004",
  slug: "brick-step-repair",
  page_type: "PROBLEM",
  title: "Brick Step Repair",
  meta_title: "Brick Step Repair | A5 Home Services",
  meta_description:
    "What cracked or settling brick steps can mean for homeowners — and how A5 coordinates masonry help in Northern New Jersey.",
  h1: "Brick Step Repair",
  primary_service_id: "masonry",
  primary_location_id: null,
  primary_problem_id: "brick-step-repair",
  primary_question: "Why are my brick steps cracking?",
  direct_answer:
    "Brick steps often crack due to settlement, freeze-thaw, or failing mortar. A5 can coordinate a masonry professional to inspect options — not diagnose remotely.",
  sections: problemSections,
  status: "DRAFT",
  indexable: false,
  ai_assisted: true,
  created_by: "cursor-g001",
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
  last_reviewed_at: null,
  cost_methodology: null,
  cost_geography: null,
  public_project_approved: false,
});

const guideSections: ContentSection[] = [
  {
    type: "DIRECT_ANSWER",
    body: "Brick steps crack when movement, moisture, freeze-thaw, or aging mortar exceeds what the assembly can tolerate. Homeowners can safely note visible cracks and trip hazards; structural conclusions require an on-site professional.",
  },
  {
    type: "RICH_TEXT",
    heading: "What homeowners can inspect safely",
    paragraphs: [
      "From a safe standing position, note crack location, whether steps feel loose, and whether water pools near the base. Do not dig out joints or pry bricks.",
    ],
  },
  {
    type: "RICH_TEXT",
    heading: "When professional help may make sense",
    paragraphs: [
      "If steps are uneven, bricks are loose, or cracks are widening, request a professional assessment. A5 can coordinate masonry help after intake.",
    ],
  },
  { type: "SOURCE_LIST" },
  { type: "RELATED_CONTENT" },
  {
    type: "CTA",
    title: "Talk to A5 about brick steps",
    description: "Share a short description and optional photos.",
  },
];

export const FIXTURE_GUIDE_PAGE = basePage({
  id: "10000000-0000-4000-8000-000000000005",
  slug: "why-brick-steps-crack",
  page_type: "GUIDE",
  title: "Why Brick Steps Crack",
  meta_title: "Why Brick Steps Crack | A5 Home Services",
  meta_description:
    "A practical guide for Northern New Jersey homeowners on why brick steps crack and when to request professional help.",
  h1: "Why Brick Steps Crack",
  primary_service_id: "masonry",
  primary_location_id: null,
  primary_problem_id: "brick-step-repair",
  primary_question: "Why do brick steps crack?",
  direct_answer:
    "Movement, moisture, freeze-thaw, and aging mortar are common causes. Visible symptoms help prioritize inspection; they do not replace an on-site assessment.",
  sections: guideSections,
  status: "DRAFT",
  indexable: false,
  ai_assisted: true,
  created_by: "cursor-g001",
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
  last_reviewed_at: null,
  cost_methodology: null,
  cost_geography: null,
  public_project_approved: false,
});

/** Contract-only COST_GUIDE sample for validation tests (not seeded as a page). */
export const FIXTURE_COST_GUIDE_CONTRACT = basePage({
  id: "10000000-0000-4000-8000-000000000006",
  slug: "brick-step-repair-cost-nj",
  page_type: "COST_GUIDE",
  title: "Brick Step Repair Cost (NJ context)",
  meta_title: null,
  meta_description: null,
  h1: "Brick Step Repair Cost Context",
  primary_service_id: "masonry",
  primary_location_id: null,
  primary_problem_id: "brick-step-repair",
  primary_question: null,
  direct_answer: null,
  sections: [],
  status: "DRAFT",
  indexable: false,
  ai_assisted: false,
  created_by: "cursor-g001",
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
  last_reviewed_at: NOW,
  cost_methodology:
    "Market context only — not an A5 quote. Ranges must cite sources before publish.",
  cost_geography: "Northern New Jersey",
  public_project_approved: false,
});

/** Contract-only COMPARISON sample. */
export const FIXTURE_COMPARISON_CONTRACT = basePage({
  id: "10000000-0000-4000-8000-000000000007",
  slug: "pavers-vs-bluestone",
  page_type: "COMPARISON",
  title: "Pavers vs Bluestone",
  meta_title: null,
  meta_description: null,
  h1: "Pavers vs Bluestone",
  primary_service_id: "masonry",
  primary_location_id: null,
  primary_problem_id: null,
  primary_question: null,
  direct_answer: null,
  sections: [
    {
      type: "COMPARISON_TABLE",
      optionALabel: "Pavers",
      optionBLabel: "Bluestone",
      rows: [
        {
          criterion: "Maintenance",
          optionA: "Joints may need re-sanding over time.",
          optionB: "Sealing may be recommended depending on finish.",
        },
      ],
    },
  ],
  status: "DRAFT",
  indexable: false,
  ai_assisted: false,
  created_by: "cursor-g001",
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
  last_reviewed_at: null,
  cost_methodology: null,
  cost_geography: null,
  public_project_approved: false,
});

/** Contract-only PROJECT sample — not publishable without approval flag. */
export const FIXTURE_PROJECT_CONTRACT = basePage({
  id: "10000000-0000-4000-8000-000000000008",
  slug: "example-public-project",
  page_type: "PROJECT",
  title: "Example Public Project",
  meta_title: null,
  meta_description: null,
  h1: "Example Public Project",
  primary_service_id: "masonry",
  primary_location_id: "madison",
  primary_problem_id: null,
  primary_question: null,
  direct_answer: null,
  sections: [
    {
      type: "PROJECT_EVIDENCE",
      body: "Public project pages must be explicitly approved. They are never a public rendering of a Lead or private ProjectPhoto.",
    },
  ],
  status: "DRAFT",
  indexable: false,
  ai_assisted: false,
  created_by: "cursor-g001",
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
  last_reviewed_at: null,
  cost_methodology: null,
  cost_geography: null,
  public_project_approved: false,
});

export const ALL_PROOF_FIXTURES: ContentPageRecord[] = [
  FIXTURE_SERVICE_PAGE,
  FIXTURE_LOCATION_PAGE,
  FIXTURE_SERVICE_LOCATION_PAGE,
  FIXTURE_PROBLEM_PAGE,
  FIXTURE_GUIDE_PAGE,
];

export const FIXTURE_CONTENT_SOURCES: ContentSourceLink[] = [
  {
    content_page_id: FIXTURE_PROBLEM_PAGE.id,
    source_id: FIXTURE_SOURCE.id,
    relationship_type: "BACKGROUND",
  },
  {
    content_page_id: FIXTURE_GUIDE_PAGE.id,
    source_id: FIXTURE_SOURCE.id,
    relationship_type: "BACKGROUND",
  },
];

export const FIXTURE_RELATIONSHIPS: ContentRelationship[] = [
  {
    from_page_id: FIXTURE_SERVICE_PAGE.id,
    to_page_id: FIXTURE_PROBLEM_PAGE.id,
    relationship_type: "RELATED",
  },
  {
    from_page_id: FIXTURE_SERVICE_PAGE.id,
    to_page_id: FIXTURE_GUIDE_PAGE.id,
    relationship_type: "SUPPORTING_GUIDE",
  },
  {
    from_page_id: FIXTURE_LOCATION_PAGE.id,
    to_page_id: FIXTURE_SERVICE_LOCATION_PAGE.id,
    relationship_type: "LOCAL_VARIANT",
  },
  {
    from_page_id: FIXTURE_SERVICE_LOCATION_PAGE.id,
    to_page_id: FIXTURE_PROBLEM_PAGE.id,
    relationship_type: "RELATED",
  },
  {
    from_page_id: FIXTURE_PROBLEM_PAGE.id,
    to_page_id: FIXTURE_GUIDE_PAGE.id,
    relationship_type: "SUPPORTING_GUIDE",
  },
  {
    from_page_id: FIXTURE_GUIDE_PAGE.id,
    to_page_id: FIXTURE_PROBLEM_PAGE.id,
    relationship_type: "RELATED",
  },
];
