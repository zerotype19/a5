/**
 * Draft LOCATION hubs for the six registry towns.
 * DRAFT only — not wired to any route, seed, or sitemap.
 * Madison updates the live page in place. The other five are new pages.
 * This file does not create service × location URLs.
 */

import type { ClaimToVerify, LocationHubDraft } from "./types.ts";
import { LIVE_MADISON_LOCATION_PAGE_ID } from "./types.ts";

const SERVICES = [
  "/services/handyman",
  "/services/masonry",
  "/services/landscaping",
  "/services/painting",
  "/services/drywall",
  "/services/tile",
  "/services/plumbing",
  "/services/electrical",
] as const;

/** Problem URLs that are already published. Do not add the other 28 here. */
const PUBLISHED_PROBLEMS = [
  "/services/masonry/brick-step-repair",
  "/services/masonry/loose-mortar",
  "/services/masonry/sunken-pavers",
  "/services/plumbing/visible-pipe-leak",
  "/services/plumbing/running-toilet",
  "/services/drywall/water-damaged-ceiling",
  "/services/drywall/hole-in-drywall",
  "/services/drywall/drywall-crack",
  "/services/electrical/failed-light-fixture",
  "/services/electrical/dead-outlet",
  "/services/tile/crumbling-grout",
  "/services/painting/peeling-exterior-paint",
  "/services/handyman/sticking-interior-door",
  "/services/landscaping/yard-surface-grading",
] as const;

const TOWN_PATHS = [
  "/home-services/florham-park",
  "/home-services/madison",
  "/home-services/chatham",
  "/home-services/morris-township",
  "/home-services/morristown",
  "/home-services/east-hanover",
] as const;

function linksFor(locationId: string): readonly string[] {
  const own = `/home-services/${locationId}`;
  const towns = TOWN_PATHS.filter((path) => path !== own);
  const extra =
    locationId === "madison"
      ? ["/madison/masonry", "/guides/why-brick-steps-crack"]
      : [];
  return [...SERVICES, ...PUBLISHED_PROBLEMS, ...towns, ...extra];
}

const florhamParkClaim: ClaimToVerify = {
  claim:
    "Florham Park is a borough. It was incorporated on March 20, 1899, and it operates under the borough form of government.",
  sourceTitle: "Borough of Florham Park, Mayor and Council",
  sourceUrl: "https://www.florhamparknj.gov/departments/mayorandcouncil",
  exactSupportedClaim:
    "Florham Park was incorporated by the State Assembly on March 20, 1899 and operates under a Borough form of government.",
};

const madisonClaim: ClaimToVerify = {
  claim:
    "Madison is a borough in southeast Morris County. Its municipal offices are in the Hartley Dodge Memorial Building at 50 Kings Road.",
  sourceTitle: "Borough of Madison official site",
  sourceUrl: "https://www.rosenet.org/",
  exactSupportedClaim:
    "The Borough of Madison, known as the Rose City, is a small suburban community in southeast Morris County, New Jersey. Municipal contact is the Hartley Dodge Memorial Building, 50 Kings Road, Madison, NJ 07940.",
};

const chathamBoroughClaim: ClaimToVerify = {
  claim:
    "Chatham Borough's municipal site lists its offices at 54 Fairmount Avenue, Chatham, NJ 07928, and it has a borough clerk.",
  sourceTitle: "Chatham Borough official site",
  sourceUrl: "https://www.chathamborough.org/",
  exactSupportedClaim:
    "The site lists 54 Fairmount Avenue, Chatham, NJ 07928, a Borough Clerk, and a borough calendar.",
};

const chathamTownshipClaim: ClaimToVerify = {
  claim:
    "Chatham Township is a separate municipality, with offices at 58 Meyersville Road, Chatham, NJ 07928, and a mayor and township committee.",
  sourceTitle: "Township of Chatham official site",
  sourceUrl: "https://chathamtownship.org/",
  exactSupportedClaim:
    "The official site is titled for Chatham Township, lists 58 Meyersville Road, Chatham, NJ 07928, and has a Mayor and Township Committee.",
};

const morrisTownshipClaim: ClaimToVerify = {
  claim:
    "Morris Township's municipal building is at 50 Woodland Avenue, Morristown, NJ 07960. That street address is not the Town of Morristown's town hall.",
  sourceTitle: "Morris Township official site",
  sourceUrl: "https://morristwp.com/",
  exactSupportedClaim:
    "Morris Township lists its municipal building at 50 Woodland Avenue, Morristown, NJ 07960.",
};

const morristownClaim: ClaimToVerify = {
  claim:
    "Morristown is a town with a strong mayor–council government under the Faulkner Act. Town hall is at 200 South Street.",
  sourceTitle: "Town of Morristown, local government",
  sourceUrl: "https://www.townofmorristown.org/government",
  exactSupportedClaim:
    "The Town of Morristown has a strong Mayor–Council form of government. The functioning of the Town Council exists under the Faulkner Act. The town lists 200 South Street, Morristown, NJ 07960.",
};

const eastHanoverClaim: ClaimToVerify = {
  claim:
    "East Hanover is a township incorporated in 1928. Its own description puts the Passaic River on the east side, the Whippany River on the west, and Florham Park among the adjacent municipalities.",
  sourceTitle: "Township of East Hanover, About East Hanover",
  sourceUrl: "https://www.easthanovertownship.com/pages/about-east-hanover",
  exactSupportedClaim:
    "Incorporated in 1928, the Township of East Hanover covers an area of 8.2 square miles. The Passaic River is on its eastern border and the Whippany River is on its western side. Florham Park is one of the municipalities adjacent to East Hanover.",
};

const florhamPark: LocationHubDraft = {
  locationId: "florham-park",
  title: "Florham Park home repairs",
  metaTitle: "Florham Park home repairs | A5",
  metaDescription:
    "A Florham Park starting point for paint, mortar, leaks, and grading — then the service page that matches the job.",
  h1: "Florham Park: start with the house, not a town slogan",
  primaryQuestion: "What should a Florham Park homeowner open first?",
  directAnswer:
    "Open the problem, not a generic 'home services in Florham Park' page. A5 takes project requests in the borough. The useful next click is the service or problem page that matches what you can see: failing paint, loose mortar, a leak, or water sitting against the house.",
  claimsToVerify: [florhamParkClaim],
  relatedProblemSlugs: [
    "peeling-exterior-paint",
    "loose-mortar",
    "yard-surface-grading",
  ],
  linkPaths: linksFor("florham-park"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/florham-park",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "Florham Park is one borough, with its own municipal site, inside the small set of towns A5 serves. This page is the local front door. It does not repeat the same sentence with a different town name, and it does not invent a Florham Park job history.",
    },
    {
      type: "RICH_TEXT",
      heading: "Florham Park is its own borough",
      paragraphs: [
        "Florham Park is a borough. It was incorporated on March 20, 1899, and it operates under the borough form of government. Permits and inspections, when a job needs them, belong to that borough's offices.",
        "Madison and East Hanover are separate A5 location pages. East Hanover's own site names Florham Park as an adjacent municipality. A request still has to name Florham Park if that is the house. Towns that are not in the registry are outside this page.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Three published pages that do not depend on a local study",
      paragraphs: [
        "Peeling exterior paint is a prep problem. The painting page says whether the failure is the coating or the surface under it.",
        "Loose mortar is a joint problem. The masonry page separates repointing from a wall that needs rebuilding.",
        "Water pooling against the house is a grading question. The landscaping page covers surface drainage and stops short of promising a lawn program.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Is there a Florham Park plumbing or electrical page?",
          answer:
            "Not yet. Plumbing and electrical stay on /services/plumbing and /services/electrical. A town-and-trade URL would be a separate page, and this batch does not create one.",
        },
        {
          question: "Where do photos go?",
          answer:
            "On the request. Up to five: the whole elevation or room, the failed spot, a close view of the material, anything that shows water, and a shot that shows how large the area is.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Florham Park source" },
    { type: "RELATED_CONTENT", heading: "Florham Park related pages" },
    {
      type: "CTA",
      title: "Request service in Florham Park",
      description:
        "Name the town, the problem, and what you can see. A5 reviews the request.",
    },
  ],
};

const madison: LocationHubDraft = {
  locationId: "madison",
  title: "Madison home repairs",
  metaTitle: "Madison, NJ home repairs | A5",
  metaDescription:
    "Madison's help center: borough context, the existing masonry page, and the problem pages that already exist.",
  h1: "Madison: the borough page, plus one masonry page that already exists",
  primaryQuestion: "Where does a Madison project start?",
  directAnswer:
    "Start here if the useful fact is the town, then go to the problem. Madison is a borough in southeast Morris County. A5 already has one town-and-trade page, masonry in Madison. Every other trade still lives on its service hub until a later, separate page is approved.",
  claimsToVerify: [madisonClaim],
  relatedProblemSlugs: ["brick-step-repair", "water-damaged-ceiling", "loose-mortar"],
  linkPaths: linksFor("madison"),
  disposition: {
    action: "update-in-place",
    canonicalPath: "/home-services/madison",
    existingContentPageId: LIVE_MADISON_LOCATION_PAGE_ID,
  },
  sections: [
    {
      type: "INTRO",
      body: "This replaces the thin Madison page that only said A5 serves the town. The borough is real, the masonry-in-Madison page is already published, and the rest of the help still lives on the service and problem URLs.",
    },
    {
      type: "RICH_TEXT",
      heading: "What the borough site actually establishes",
      paragraphs: [
        "Madison is a borough in southeast Morris County. Its municipal offices are in the Hartley Dodge Memorial Building at 50 Kings Road. That is the local context this page will stand on. It is not a ranking, a housing census, or a list of jobs A5 has finished.",
        "Brick steps and loose mortar already have their own pages, and the Madison masonry page is the local variant of that trade. A water stain on a ceiling still starts at the drywall problem page, with plumbing and painting as related trades, not as alternate Madison URLs.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "The one town-and-trade URL that is live",
      paragraphs: [
        "/madison/masonry is published. It is masonry in this borough, not a template for /madison/plumbing or /madison/electrical.",
        "The brick-step guide at /guides/why-brick-steps-crack stays linked from masonry. This town page does not replace that guide.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Does this page claim Madison houses are a certain age or material?",
          answer:
            "No. Age and wall material are questions for the house in front of you. The drywall hub already says the first question is which material is on the wall.",
        },
        {
          question: "What should the request include?",
          answer:
            "Madison as the town, the service or problem, and up to five photos: the approach to the house or room, the damage, a close-up, a size reference, and any active water.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Madison source" },
    { type: "RELATED_CONTENT", heading: "Madison related pages" },
    {
      type: "CTA",
      title: "Request service in Madison",
      description: "Say what is failing and send the photos with the request.",
    },
  ],
};

const chatham: LocationHubDraft = {
  locationId: "chatham",
  title: "Chatham home repairs",
  metaTitle: "Chatham home repairs | A5",
  metaDescription:
    "Chatham Borough and Chatham Township are different offices. This page routes the repair without pretending they are one building department.",
  h1: "Chatham: two municipalities, one service-area page",
  primaryQuestion: "Which Chatham is this page for?",
  directAnswer:
    "A5's registry has one Chatham service area. Chatham Borough and Chatham Township are separate municipalities, with different offices. This page does not choose a construction department for you. It sends the repair to the service or problem page, and the request should say which municipality the house is in.",
  claimsToVerify: [chathamBoroughClaim, chathamTownshipClaim],
  relatedProblemSlugs: ["sticking-interior-door", "running-toilet", "dead-outlet"],
  linkPaths: linksFor("chatham"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/chatham",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "Typing 'Chatham' into a home-services page hides a real split. The borough and the township share a name and a ZIP conversation, and they do not share a government. A repair page that ignores that will send someone to the wrong counter.",
    },
    {
      type: "RICH_TEXT",
      heading: "Two offices, both on the record",
      paragraphs: [
        "Chatham Borough's municipal site lists its offices at 54 Fairmount Avenue, Chatham, NJ 07928, and it has a borough clerk. Chatham Township is a separate municipality, with offices at 58 Meyersville Road, Chatham, NJ 07928, and a mayor and township committee. Use the office that matches the house. A5 does not merge those governments into one permit desk.",
        "There is no /chatham/plumbing page and no /chatham/electrical page. Licensed-trade questions stay on the plumbing and electrical hubs, which already cite the state license rules.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Interior problems that do not need a town legend",
      paragraphs: [
        "A door that sticks or will not latch is on the handyman problem page. Say whether the house is in the borough or the township when you send it.",
        "A toilet that keeps running is a plumbing problem, not a Chatham-specific fixture.",
        "An outlet with no power is an electrical problem. The dead-outlet page is the place to sort the breaker, the device, and when to stop.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Will A5 add a second Chatham location?",
          answer:
            "Not in this batch. The registry has one Chatham id. Splitting borough and township into two location records would be a registry change, which this draft does not make.",
        },
        {
          question: "How many photos does the form take?",
          answer:
            "Five. For these interior jobs: the closed door or fixture, the gap or the running water, the hardware or the outlet, the nearby wall, and one wider shot of the room.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Chatham sources" },
    { type: "RELATED_CONTENT", heading: "Chatham related pages" },
    {
      type: "CTA",
      title: "Request service in Chatham",
      description:
        "Say borough or township, then describe the problem. The request form is the intake.",
    },
  ],
};

const morrisTownship: LocationHubDraft = {
  locationId: "morris-township",
  title: "Morris Township home repairs",
  metaTitle: "Morris Township home repairs | A5",
  metaDescription:
    "Morris Township is not the Town of Morristown. Start here, then use the service page for the actual repair.",
  h1: "Morris Township: a Morristown street address, a different government",
  primaryQuestion: "Is Morris Township the same as Morristown?",
  directAnswer:
    "No. Morris Township's municipal building is at 50 Woodland Avenue, which uses a Morristown street address. The Town of Morristown is a separate government, with its own page. A project in the township should be requested as Morris Township.",
  claimsToVerify: [morrisTownshipClaim],
  relatedProblemSlugs: ["crumbling-grout", "drywall-crack", "sunken-pavers"],
  linkPaths: linksFor("morris-township"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/morris-township",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "The confusing part of this town is the mail, not the masonry. A Woodland Avenue address can look like Morristown and still be the township. This page exists so that mix-up happens before intake, not after.",
    },
    {
      type: "RICH_TEXT",
      heading: "Read the government, not only the ZIP",
      paragraphs: [
        "Morris Township's municipal building is at 50 Woodland Avenue, Morristown, NJ 07960. That street address is not the Town of Morristown's town hall. Town hall for the Town of Morristown is a different building, on South Street, and it is described on the Morristown page.",
        "A5 serves both. They are two location hubs. A service-in-this-township URL, such as a plumbing page under the township slug, is not part of this draft.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Problems that stay on the service URL",
      paragraphs: [
        "Grout that is washing out is a tile problem. The crumbling-grout page asks whether the tile has to come up.",
        "A crack that keeps returning is a drywall problem until someone sees whether the house is moving.",
        "Pavers that rock or sink are a masonry reset, covered on the sunken-pavers page, not a township program.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Which page should a Convent Station address use?",
          answer:
            "If the house is in Morris Township, use this page and say Morris Township on the request. Convent Station is a mailing name that shows up on the township's own contact block. It is not a seventh A5 town.",
        },
        {
          question: "What photos help?",
          answer:
            "Five at most: the area, the crack or the loose unit, a straight-on close view, a shot with a ruler or a hand for scale, and one that shows the floor or wall around it.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Morris Township source" },
    { type: "RELATED_CONTENT", heading: "Morris Township related pages" },
    {
      type: "CTA",
      title: "Request service in Morris Township",
      description: "Use the township name even if the mailing city says Morristown.",
    },
  ],
};

const morristown: LocationHubDraft = {
  locationId: "morristown",
  title: "Morristown home repairs",
  metaTitle: "Morristown home repairs | A5",
  metaDescription:
    "The Town of Morristown has its own government and its own help page. Leaks and electrical faults stay on the trade pages.",
  h1: "Morristown: the town, not the township around it",
  primaryQuestion: "What does the Town of Morristown page cover?",
  directAnswer:
    "Houses in the Town of Morristown. The town uses a strong mayor–council government under the Faulkner Act, and town hall is at 200 South Street. Morris Township is the neighboring page. A leak or a dead light is still a plumbing or electrical problem, not a town-hall service.",
  claimsToVerify: [morristownClaim],
  relatedProblemSlugs: ["visible-pipe-leak", "failed-light-fixture", "hole-in-drywall"],
  linkPaths: linksFor("morristown"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/morristown",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "Morristown is the compact town government, with wards, a mayor, and a council under the Faulkner Act. Treating it as a synonym for Morris Township sends the request to the wrong place and the wrong municipal office.",
    },
    {
      type: "RICH_TEXT",
      heading: "Town hall is on South Street",
      paragraphs: [
        "Morristown is a town with a strong mayor–council government under the Faulkner Act. Town hall is at 200 South Street. That is the civic fact for this hub. It is not a claim about how many brick houses or rental units are on a given block.",
        "There is no /morristown/plumbing URL in this batch. State licensing for plumbing and electrical is already on those service hubs.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Urgent problems still use the trade page",
      paragraphs: [
        "Water you can see coming from a pipe or valve starts on the visible-leak page: stop the water, then describe it.",
        "A light that quit or flickers starts on the failed-fixture page, which separates a bulb from wiring.",
        "A hole in drywall starts on that problem page. Patch versus replace is about the hole, not about which Morristown ward it is in.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Does A5 dispatch from town hall?",
          answer:
            "No. Town hall is the municipality. A5 intake is the request form. The town page only makes the place unambiguous.",
        },
        {
          question: "Which photos, if the problem is a leak or a light?",
          answer:
            "Up to five: the fixture or the wet area, the shutoff if you can see it, a close view of the failed part, the surrounding ceiling or wall, and one wide shot.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Morristown source" },
    { type: "RELATED_CONTENT", heading: "Morristown related pages" },
    {
      type: "CTA",
      title: "Request service in Morristown",
      description: "Say Town of Morristown if that is the house, then describe the failure.",
    },
  ],
};

const eastHanover: LocationHubDraft = {
  locationId: "east-hanover",
  title: "East Hanover home repairs",
  metaTitle: "East Hanover home repairs | A5",
  metaDescription:
    "East Hanover is a township incorporated in 1928, next to Florham Park. Grading and exterior paint start on the published problem pages.",
  h1: "East Hanover: a township between two rivers, next to Florham Park",
  primaryQuestion: "What is locally true about East Hanover, and what is not?",
  directAnswer:
    "The township was incorporated in 1928. Its municipal description puts the Passaic River on the east, the Whippany River on the west, and Florham Park on the border. That is geography from the township's own page. It is not a statement that a particular yard floods, and it is not a promise of a lawn-care route.",
  claimsToVerify: [eastHanoverClaim],
  relatedProblemSlugs: ["yard-surface-grading", "peeling-exterior-paint", "sunken-pavers"],
  linkPaths: linksFor("east-hanover"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/east-hanover",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "East Hanover's useful local fact is the map the township publishes: a township of about 8.2 square miles, rivers on two sides, and Florham Park next door. The repair still starts from the symptom.",
    },
    {
      type: "RICH_TEXT",
      heading: "Use the township description, then stop",
      paragraphs: [
        "East Hanover is a township incorporated in 1928. Its own description puts the Passaic River on the east side, the Whippany River on the west, and Florham Park among the adjacent municipalities. Those sentences are the sourced local context.",
        "The same page also promotes local employers and shopping. This help center does not repeat that. A homeowner with a soft spot in the lawn does not need a corporate directory.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Water, coating, and paving — without a flood claim",
      paragraphs: [
        "If water pools in the yard or against the house, the grading page is the published place to sort surface drainage. A river on the township border does not mean your lot floods.",
        "Peeling exterior paint is the painting problem page. Prep matters more than the town name.",
        "Sunken or rocking pavers are the masonry reset page. De-icing guidance, where it applies, stays on that masonry material, not on an East Hanover legend.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Is Hanover Township included?",
          answer:
            "No. East Hanover's own adjacent-town list includes Hanover Township. Hanover Township is not an A5 location. A house there is outside this page.",
        },
        {
          question: "What should a grading or paint request show?",
          answer:
            "Five photos at most: the yard or elevation, the low spot or the peeled area, a close view, a shot after rain if you have one, and one that shows the house wall or the walk next to it.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "East Hanover source" },
    { type: "RELATED_CONTENT", heading: "East Hanover related pages" },
    {
      type: "CTA",
      title: "Request service in East Hanover",
      description:
        "Describe where the water sits or what the surface is doing. Intake decides the next step.",
    },
  ],
};

export const LOCATION_HUB_DRAFTS: readonly LocationHubDraft[] = [
  florhamPark,
  madison,
  chatham,
  morrisTownship,
  morristown,
  eastHanover,
];

export const LOCATION_BATCH_PROBLEM_SLUGS = [
  "peeling-exterior-paint",
  "loose-mortar",
  "yard-surface-grading",
  "brick-step-repair",
  "water-damaged-ceiling",
  "sticking-interior-door",
  "running-toilet",
  "dead-outlet",
  "crumbling-grout",
  "drywall-crack",
  "sunken-pavers",
  "visible-pipe-leak",
  "failed-light-fixture",
  "hole-in-drywall",
] as const;
