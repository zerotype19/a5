/**
 * Draft LOCATION hubs for the six registry towns.
 * DRAFT only — not wired to any route, seed, or sitemap.
 * Madison updates the live page in place. The other five are new pages.
 * This file does not create service × location URLs.
 * Homeowner copy must not explain that rule.
 */

import type { ContentSection } from "../types.ts";
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

const TOWN_PATHS = [
  "/home-services/florham-park",
  "/home-services/madison",
  "/home-services/chatham",
  "/home-services/morris-township",
  "/home-services/morristown",
  "/home-services/east-hanover",
] as const;

const SERVICE_DIRECTORY =
  "Handyman, masonry, landscaping, painting, drywall, tile, plumbing, and electrical. Open the trade that matches the work, then send the request from there if you already know which one it is.";

function nearbyFor(locationId: string): readonly string[] {
  return TOWN_PATHS.filter((path) => path !== `/home-services/${locationId}`);
}

function primaryLinks(
  problemPaths: readonly string[],
  extra: readonly string[] = [],
): readonly string[] {
  return [...SERVICES, ...problemPaths, ...extra];
}

function howItWorks(example: string): ContentSection {
  return {
    type: "RICH_TEXT",
    heading: "How A5 works",
    paragraphs: [
      example,
      "Add up to five photos: one wide shot, the damaged spot, a close view, something for scale, and any sign of water.",
      "A5 reviews what you sent and coordinates an appropriate local provider.",
    ],
  };
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
  title: "Home services in Florham Park, NJ",
  metaTitle: "Home services in Florham Park, NJ | A5",
  metaDescription:
    "A5 coordinates masonry, painting, plumbing, electrical, and other home repairs in Florham Park. Start from the problem and send photos.",
  h1: "Home services in Florham Park, NJ",
  primaryQuestion: "What kinds of projects can A5 help coordinate in Florham Park?",
  directAnswer:
    "Home repairs you can point at: peeling exterior paint, mortar falling out of brick, water sitting against the house, a door that sticks, a leak, or a small list of finish items. A5 coordinates that work in Florham Park. Describe what you see, add photos, and A5 reviews the request and lines up a local provider.",
  claimsToVerify: [florhamParkClaim],
  relatedProblemSlugs: [
    "peeling-exterior-paint",
    "loose-mortar",
    "yard-surface-grading",
    "brick-step-repair",
  ],
  linkPaths: primaryLinks([
    "/services/painting/peeling-exterior-paint",
    "/services/masonry/loose-mortar",
    "/services/landscaping/yard-surface-grading",
    "/services/masonry/brick-step-repair",
  ]),
  nearbyLocationPaths: nearbyFor("florham-park"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/florham-park",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "If the house is in Florham Park, start with the repair. The borough is the place. The problem is how A5 knows who should look at it.",
    },
    {
      type: "RICH_TEXT",
      heading: "Common home projects",
      paragraphs: [
        "Exterior paint that is peeling, blistering, or coming off in sheets. The painting pages separate a coating failure from a surface that has to be repaired first.",
        "Brick steps and mortar joints that are crumbling or washing out. Masonry covers repair versus rebuilding.",
        "A yard or walk where water sits against the house after rain. Landscaping covers surface grading, not a standing lawn-care plan.",
        "Doors, trim, and a short punch list. Handyman work is the mixed small stuff, once plumbing and electrical items are pulled out of the list.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Start with what you see",
      paragraphs: [
        "Peeling exterior paint, if the coating is what failed.",
        "Loose mortar, if the joints between bricks are the problem.",
        "Yard surface grading, if water is pooling in the yard or along the foundation.",
        "Brick step repair, if the treads themselves are cracking or breaking up.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Services available",
      paragraphs: [SERVICE_DIRECTORY],
    },
    {
      type: "RICH_TEXT",
      heading: "Local context",
      paragraphs: [
        "Florham Park is a borough. It was incorporated on March 20, 1899, and it operates under the borough form of government. If a job needs a permit, that question belongs to the borough. It does not change the photos or the description A5 needs.",
      ],
    },
    howItWorks(
      "For a Florham Park house, name the borough and say what is failing: the paint, the mortar, the water, or the door.",
    ),
    {
      type: "RICH_TEXT",
      heading: "Nearby areas A5 serves",
      paragraphs: [
        "A5 also coordinates projects in Madison, Chatham, Morris Township, Morristown, and East Hanover.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "What if the job might need a permit?",
          answer:
            "Say so on the request. Florham Park handles its own permits. A5 still needs the description and photos to coordinate the work.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Sources" },
    { type: "RELATED_CONTENT", heading: "Related" },
    {
      type: "CTA",
      title: "Tell us what needs fixing",
      description: "Florham Park, the problem, and a few photos are enough to start.",
    },
  ],
};

const madison: LocationHubDraft = {
  locationId: "madison",
  title: "Home services in Madison, NJ",
  metaTitle: "Home services in Madison, NJ | A5",
  metaDescription:
    "A5 coordinates home repairs in Madison, including masonry. Start with brick steps, a ceiling stain, or another problem you can see.",
  h1: "Home services in Madison, NJ",
  primaryQuestion: "What kinds of projects can A5 help coordinate in Madison?",
  directAnswer:
    "Masonry, plumbing, electrical, painting, drywall, tile, handyman work, and yard drainage for houses in Madison. Brick steps, walks, and mortar already have a Madison masonry page. A ceiling stain, a sticking door, or a sunken paver starts from that problem. Send the description and photos, and A5 reviews the request and coordinates a local provider.",
  claimsToVerify: [madisonClaim],
  relatedProblemSlugs: [
    "brick-step-repair",
    "loose-mortar",
    "water-damaged-ceiling",
    "sunken-pavers",
  ],
  linkPaths: primaryLinks(
    [
      "/services/masonry/brick-step-repair",
      "/services/masonry/loose-mortar",
      "/services/drywall/water-damaged-ceiling",
      "/services/masonry/sunken-pavers",
    ],
    ["/madison/masonry", "/guides/why-brick-steps-crack"],
  ),
  nearbyLocationPaths: nearbyFor("madison"),
  disposition: {
    action: "update-in-place",
    canonicalPath: "/home-services/madison",
    existingContentPageId: LIVE_MADISON_LOCATION_PAGE_ID,
  },
  sections: [
    {
      type: "INTRO",
      body: "Madison homeowners can start with the trade or with the thing that is failing. Masonry in this borough already has its own page. Everything else starts from the problem.",
    },
    {
      type: "RICH_TEXT",
      heading: "Common home projects",
      paragraphs: [
        "Brick steps, walks, patios, and mortar. See masonry in Madison (/madison/masonry) for work in this borough, and use the brick-step and loose-mortar pages to sort repair from rebuilding.",
        "A water stain or a soft spot on a ceiling. That starts as a drywall problem. If a leak is still active, plumbing is part of the same request, and painting comes after the surface is sound.",
        "Pavers that sink, rock, or hold water. Masonry covers resetting them.",
        "A short list of doors, trim, and mounting. Handyman work stays on that list only when it does not change plumbing or wiring.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Start with what you see",
      paragraphs: [
        "Brick step repair, when the treads are crumbling or cracked.",
        "Loose mortar, when the joints are falling out.",
        "A water-damaged ceiling, when the stain or the soft spot is the thing you noticed.",
        "Sunken pavers, when the walk or patio moves underfoot.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Services available",
      paragraphs: [SERVICE_DIRECTORY],
    },
    {
      type: "RICH_TEXT",
      heading: "Local context",
      paragraphs: [
        "Madison is a borough in southeast Morris County. Its municipal offices are in the Hartley Dodge Memorial Building at 50 Kings Road. That is the borough office, not an A5 shop.",
      ],
    },
    howItWorks(
      "For a Madison house, say Madison, point at the masonry page if the work is brick or stone, and otherwise name the problem you can see.",
    ),
    {
      type: "RICH_TEXT",
      heading: "Nearby areas A5 serves",
      paragraphs: [
        "A5 also coordinates projects in Florham Park, Chatham, Morris Township, Morristown, and East Hanover.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Where should brick steps go?",
          answer:
            "Masonry in Madison (/madison/masonry), plus the brick-step page if you want to see what to photograph before anyone visits.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Sources" },
    { type: "RELATED_CONTENT", heading: "Related" },
    {
      type: "CTA",
      title: "Tell us what needs fixing",
      description: "Madison, the problem, and photos of the damage are enough to start.",
    },
  ],
};

const chatham: LocationHubDraft = {
  locationId: "chatham",
  title: "Home services in Chatham, NJ",
  metaTitle: "Home services in Chatham, NJ | A5",
  metaDescription:
    "A5 coordinates home repairs in Chatham. Say whether the house is in the borough or the township, then describe the problem.",
  h1: "Home services in Chatham, NJ",
  primaryQuestion: "What kinds of projects can A5 help coordinate in Chatham?",
  directAnswer:
    "Doors that stick, toilets that run, outlets with no power, drywall holes, leaks, and the other ordinary repairs in a house. A5 coordinates that work for Chatham. On the request, say whether the house is in Chatham Borough or Chatham Township so the right municipal office is obvious if a permit comes up.",
  claimsToVerify: [chathamBoroughClaim, chathamTownshipClaim],
  relatedProblemSlugs: [
    "sticking-interior-door",
    "running-toilet",
    "dead-outlet",
    "hole-in-drywall",
  ],
  linkPaths: primaryLinks([
    "/services/handyman/sticking-interior-door",
    "/services/plumbing/running-toilet",
    "/services/electrical/dead-outlet",
    "/services/drywall/hole-in-drywall",
  ]),
  nearbyLocationPaths: nearbyFor("chatham"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/chatham",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "Chatham is a place to get a repair done. Borough or township matters when you say where the house is. It does not change how you describe a sticking door or a running toilet.",
    },
    {
      type: "RICH_TEXT",
      heading: "Common home projects",
      paragraphs: [
        "Interior doors that rub, stick, or no longer latch. That is handyman work unless the frame or the floor is moving.",
        "A toilet that keeps running, or a drip you can see. Plumbing covers the fixture and the supply.",
        "A light, switch, or outlet that failed. Electrical covers the device. If you are not sure it is safe to wait, say that on the request.",
        "Holes, cracks, and ceiling stains in drywall, and tile or paint when the surface itself has failed.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Start with what you see",
      paragraphs: [
        "A sticking interior door, if the door is the complaint.",
        "A running toilet, if the water will not stop.",
        "A dead outlet, if the breaker is on and the device is not.",
        "A hole in drywall, if the wall is what needs to be patched.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Services available",
      paragraphs: [SERVICE_DIRECTORY],
    },
    {
      type: "RICH_TEXT",
      heading: "Local context",
      paragraphs: [
        "Chatham Borough and Chatham Township are separate municipalities. Chatham Borough's municipal site lists its offices at 54 Fairmount Avenue, Chatham, NJ 07928, and it has a borough clerk. Chatham Township is a separate municipality, with offices at 58 Meyersville Road, Chatham, NJ 07928, and a mayor and township committee.",
        "Use the office that matches the house if you are asking about a permit. Tell A5 which one the house is in either way.",
      ],
    },
    howItWorks(
      "For a Chatham house, write Borough or Township with the address, then describe the door, the toilet, the outlet, or whatever else failed.",
    ),
    {
      type: "RICH_TEXT",
      heading: "Nearby areas A5 serves",
      paragraphs: [
        "A5 also coordinates projects in Madison, Florham Park, Morris Township, Morristown, and East Hanover.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Borough or township — which do I put on the request?",
          answer:
            "Whichever the house is actually in. They are different offices: 54 Fairmount Avenue for the borough, 58 Meyersville Road for the township.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Sources" },
    { type: "RELATED_CONTENT", heading: "Related" },
    {
      type: "CTA",
      title: "Tell us what needs fixing",
      description:
        "Include Borough or Township with the problem and the photos.",
    },
  ],
};

const morrisTownship: LocationHubDraft = {
  locationId: "morris-township",
  title: "Home services in Morris Township, NJ",
  metaTitle: "Home services in Morris Township, NJ | A5",
  metaDescription:
    "A5 coordinates home repairs in Morris Township. A Morristown mailing address can still be the township. Start from the problem.",
  h1: "Home services in Morris Township, NJ",
  primaryQuestion:
    "What kinds of projects can A5 help coordinate in Morris Township?",
  directAnswer:
    "Tile, drywall, masonry, plumbing, electrical, painting, handyman work, and yard drainage for houses in Morris Township. A mailing label that says Morristown does not make the house part of the town. Describe the crack, the grout, the pavers, or the leak, add photos, and A5 reviews the request and coordinates a local provider.",
  claimsToVerify: [morrisTownshipClaim],
  relatedProblemSlugs: [
    "crumbling-grout",
    "drywall-crack",
    "sunken-pavers",
    "sticking-interior-door",
  ],
  linkPaths: primaryLinks([
    "/services/tile/crumbling-grout",
    "/services/drywall/drywall-crack",
    "/services/masonry/sunken-pavers",
    "/services/handyman/sticking-interior-door",
  ]),
  nearbyLocationPaths: nearbyFor("morris-township"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/morris-township",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "If the house is in Morris Township, say that on the request even when the mail says Morristown. Then describe the repair the same way you would anywhere else.",
    },
    {
      type: "RICH_TEXT",
      heading: "Common home projects",
      paragraphs: [
        "Grout that is crumbling or washing out of a floor, a backsplash, or a shower. Tile covers whether the tile has to come up.",
        "A drywall crack that opens again after it was filled. Drywall covers the patch, and whether the crack is telling you the house is moving.",
        "Pavers that rock or have dropped. Masonry covers resetting the walk or patio.",
        "Doors that stick, plus plumbing and electrical failures when those are the actual problem.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Start with what you see",
      paragraphs: [
        "Crumbling grout, if the joints are the failure.",
        "A drywall crack, if the line in the wall or ceiling keeps coming back.",
        "Sunken pavers, if the surface moves underfoot.",
        "A sticking interior door, if the door is what you want fixed.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Services available",
      paragraphs: [SERVICE_DIRECTORY],
    },
    {
      type: "RICH_TEXT",
      heading: "Local context",
      paragraphs: [
        "Morris Township's municipal building is at 50 Woodland Avenue, Morristown, NJ 07960. That street address is not the Town of Morristown's town hall. Town hall for the town is on South Street. Use Morris Township on the request when the house is in the township.",
      ],
    },
    howItWorks(
      "For a township house, write Morris Township even if the ZIP or the mail app says Morristown, then describe the grout, the crack, or the pavers.",
    ),
    {
      type: "RICH_TEXT",
      heading: "Nearby areas A5 serves",
      paragraphs: [
        "A5 also coordinates projects in Morristown, Madison, Chatham, Florham Park, and East Hanover.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "The address says Morristown. Which is it?",
          answer:
            "Look at the municipality, not only the mailing city. Township offices are at 50 Woodland Avenue. The Town of Morristown is a different government.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Sources" },
    { type: "RELATED_CONTENT", heading: "Related" },
    {
      type: "CTA",
      title: "Tell us what needs fixing",
      description: "Say Morris Township, then the problem and the photos.",
    },
  ],
};

const morristown: LocationHubDraft = {
  locationId: "morristown",
  title: "Home services in Morristown, NJ",
  metaTitle: "Home services in Morristown, NJ | A5",
  metaDescription:
    "A5 coordinates home repairs in the Town of Morristown. Leaks, lights, and wall damage start from the problem you can see.",
  h1: "Home services in Morristown, NJ",
  primaryQuestion: "What kinds of projects can A5 help coordinate in Morristown?",
  directAnswer:
    "Leaks you can see, lights that failed, holes in drywall, running toilets, and the rest of the repair list for houses in the Town of Morristown. Morris Township is a different place, with its own page. Describe the failure, add photos, and A5 reviews the request and coordinates a local provider.",
  claimsToVerify: [morristownClaim],
  relatedProblemSlugs: [
    "visible-pipe-leak",
    "failed-light-fixture",
    "hole-in-drywall",
    "running-toilet",
  ],
  linkPaths: primaryLinks([
    "/services/plumbing/visible-pipe-leak",
    "/services/electrical/failed-light-fixture",
    "/services/drywall/hole-in-drywall",
    "/services/plumbing/running-toilet",
  ]),
  nearbyLocationPaths: nearbyFor("morristown"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/morristown",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "This is the Town of Morristown. If the house is in the township instead, use that area. Either way, the repair starts from what failed.",
    },
    {
      type: "RICH_TEXT",
      heading: "Common home projects",
      paragraphs: [
        "A pipe, valve, or supply line you can see leaking. Shut the water off if you can, then plumbing takes it from the description and photos.",
        "A light that quit, flickers, or sparked. Electrical sorts a bulb from a fixture from wiring you should leave alone.",
        "A hole or a soft spot in a wall or ceiling. Drywall covers the patch. If the spot is wet, say that.",
        "Paint, tile, masonry, and small carpentry when those are the surfaces that failed.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Start with what you see",
      paragraphs: [
        "A visible pipe leak, if water is coming out now.",
        "A failed light fixture, if the light is the complaint.",
        "A hole in drywall, if the opening in the wall is what you want closed.",
        "A running toilet, if the tank will not stop filling.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Services available",
      paragraphs: [SERVICE_DIRECTORY],
    },
    {
      type: "RICH_TEXT",
      heading: "Local context",
      paragraphs: [
        "Morristown is a town with a strong mayor–council government under the Faulkner Act. Town hall is at 200 South Street. That building is the town's, not Morris Township's. Township offices are on Woodland Avenue.",
      ],
    },
    howItWorks(
      "For a house in the town, write Town of Morristown, then say whether it is a leak, a light, a hole, or something else.",
    ),
    {
      type: "RICH_TEXT",
      heading: "Nearby areas A5 serves",
      paragraphs: [
        "A5 also coordinates projects in Morris Township, Madison, Chatham, Florham Park, and East Hanover.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Is this the township page?",
          answer:
            "No. This is the Town of Morristown. Town hall is at 200 South Street. Morris Township is the other area A5 serves.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Sources" },
    { type: "RELATED_CONTENT", heading: "Related" },
    {
      type: "CTA",
      title: "Tell us what needs fixing",
      description: "Town of Morristown, the failure, and photos are enough to start.",
    },
  ],
};

const eastHanover: LocationHubDraft = {
  locationId: "east-hanover",
  title: "Home services in East Hanover, NJ",
  metaTitle: "Home services in East Hanover, NJ | A5",
  metaDescription:
    "A5 coordinates drainage, paint, masonry, and other home repairs in East Hanover. Start from what the yard or the house is doing.",
  h1: "Home services in East Hanover, NJ",
  primaryQuestion: "What kinds of projects can A5 help coordinate in East Hanover?",
  directAnswer:
    "Yard drainage, peeling exterior paint, loose mortar, sunken pavers, and the other home repairs in East Hanover. Describe where the water sits or what the surface is doing, add photos, and A5 reviews the request and coordinates a local provider. A river on the township map is not a finding about your lot.",
  claimsToVerify: [eastHanoverClaim],
  relatedProblemSlugs: [
    "yard-surface-grading",
    "peeling-exterior-paint",
    "sunken-pavers",
    "loose-mortar",
  ],
  linkPaths: primaryLinks([
    "/services/landscaping/yard-surface-grading",
    "/services/painting/peeling-exterior-paint",
    "/services/masonry/sunken-pavers",
    "/services/masonry/loose-mortar",
  ]),
  nearbyLocationPaths: nearbyFor("east-hanover"),
  disposition: {
    action: "create",
    canonicalPath: "/home-services/east-hanover",
    existingContentPageId: null,
  },
  sections: [
    {
      type: "INTRO",
      body: "East Hanover repairs start the same way as any other house A5 takes on: what you can see, photos, and a request. The township map is only there so the place is clear.",
    },
    {
      type: "RICH_TEXT",
      heading: "Common home projects",
      paragraphs: [
        "Water that pools in the yard or against the foundation. Landscaping covers surface grading. It is not a promise of recurring lawn care.",
        "Exterior paint that is peeling or flaking. Painting covers the prep, including when older paint has to be treated carefully.",
        "Brick steps and mortar, and pavers that have settled or rock when you step on them. Masonry covers those repairs.",
        "Plumbing, electrical, drywall, tile, and handyman items when the failure is inside the house.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Start with what you see",
      paragraphs: [
        "Yard surface grading, if water is the problem outside.",
        "Peeling exterior paint, if the coating is failing.",
        "Sunken pavers, if the walk or patio has dropped.",
        "Loose mortar, if the brick joints are emptying out.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Services available",
      paragraphs: [SERVICE_DIRECTORY],
    },
    {
      type: "RICH_TEXT",
      heading: "Local context",
      paragraphs: [
        "East Hanover is a township incorporated in 1928. Its own description puts the Passaic River on the east side, the Whippany River on the west, and Florham Park among the adjacent municipalities. That describes the township. It does not mean a particular property floods.",
      ],
    },
    howItWorks(
      "For an East Hanover house, say where the water sits or which surface failed, and send the photos from the yard or the wall.",
    ),
    {
      type: "RICH_TEXT",
      heading: "Nearby areas A5 serves",
      paragraphs: [
        "A5 also coordinates projects in Florham Park, Madison, Chatham, Morris Township, and Morristown.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Does a river nearby mean the yard floods?",
          answer:
            "No. The township's description names the rivers and the Florham Park border. Your request should say what this lot actually does after rain.",
        },
      ],
    },
    { type: "SOURCE_LIST", heading: "Sources" },
    { type: "RELATED_CONTENT", heading: "Related" },
    {
      type: "CTA",
      title: "Tell us what needs fixing",
      description: "East Hanover, what you see, and photos are enough to start.",
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

export const LOCATION_SECTION_HEADINGS = [
  "Common home projects",
  "Start with what you see",
  "Services available",
  "Local context",
  "How A5 works",
  "Nearby areas A5 serves",
] as const;

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
