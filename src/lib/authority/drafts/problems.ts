/**
 * First problem/help pages (tranche 1). DRAFT only — not wired to any
 * route, seed, or sitemap. Slugs reuse A5-G002 problem entities.
 */

import type { ServiceId } from "../../../../config/services.ts";
import type { ContentSection, QuestionAnswerItem } from "../types.ts";
import {
  CLAIM_DEICING_SALT,
  CLAIM_EPA_RRP,
  CLAIM_MORTAR_COLD_WEATHER,
  CLAIM_NJ_811,
  CLAIM_NJ_CLIMATE,
  CLAIM_NJ_ELECTRICAL_LICENSE,
  CLAIM_NJ_PLUMBING_LICENSE,
} from "./claims.ts";
import type { ClaimToVerify, ProblemPageDraft } from "./types.ts";

export const PROBLEM_HEADINGS = {
  seeing: "What you're seeing",
  causes: "Likely causes",
  photograph: "What to photograph",
  repairOrReplace: "Repair or replace",
  whoYouNeed: "Who you need",
  related: "Related problems",
  costFactors: "What affects the cost",
} as const;

type ProblemCopy = {
  problemSlug: string;
  primaryServiceId: ServiceId;
  relatedServiceIds: readonly ServiceId[];
  title: string;
  metaTitle: string;
  metaDescription: string;
  primaryQuestion: string;
  directAnswer: string;
  intro: string;
  seeing: string[];
  firstSteps?: { heading: string; paragraphs: string[] };
  causes: string[];
  photograph: string[];
  repairOrReplace: string[];
  whoYouNeed: string[];
  costFactors: string[];
  questions?: QuestionAnswerItem[];
  related: string;
  relatedProblemSlugs: readonly string[];
  cta: { title: string; description: string };
  claimsToVerify?: readonly ClaimToVerify[];
};

function problemPage(copy: ProblemCopy): ProblemPageDraft {
  const sections: ContentSection[] = [
    { type: "INTRO", body: copy.intro },
    {
      type: "RICH_TEXT",
      heading: PROBLEM_HEADINGS.seeing,
      paragraphs: copy.seeing,
    },
  ];
  if (copy.firstSteps) {
    sections.push({
      type: "RICH_TEXT",
      heading: copy.firstSteps.heading,
      paragraphs: copy.firstSteps.paragraphs,
    });
  }
  sections.push(
    { type: "RICH_TEXT", heading: PROBLEM_HEADINGS.causes, paragraphs: copy.causes },
    {
      type: "RICH_TEXT",
      heading: PROBLEM_HEADINGS.photograph,
      paragraphs: copy.photograph,
    },
    {
      type: "RICH_TEXT",
      heading: PROBLEM_HEADINGS.repairOrReplace,
      paragraphs: copy.repairOrReplace,
    },
    {
      type: "RICH_TEXT",
      heading: PROBLEM_HEADINGS.whoYouNeed,
      paragraphs: copy.whoYouNeed,
    },
    {
      type: "COST_FACTORS",
      heading: PROBLEM_HEADINGS.costFactors,
      factors: copy.costFactors,
    },
  );
  if (copy.questions?.length) {
    sections.push({ type: "QUESTION_ANSWER", items: copy.questions });
  }
  sections.push(
    { type: "RICH_TEXT", heading: PROBLEM_HEADINGS.related, paragraphs: [copy.related] },
    { type: "RELATED_CONTENT" },
    { type: "CTA", title: copy.cta.title, description: copy.cta.description },
  );

  return {
    problemSlug: copy.problemSlug,
    primaryServiceId: copy.primaryServiceId,
    relatedServiceIds: copy.relatedServiceIds,
    title: copy.title,
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    h1: copy.title,
    primaryQuestion: copy.primaryQuestion,
    directAnswer: copy.directAnswer,
    sections,
    relatedProblemSlugs: copy.relatedProblemSlugs,
    claimsToVerify: copy.claimsToVerify ?? [],
  };
}

const brickSteps = problemPage({
  problemSlug: "brick-step-repair",
  primaryServiceId: "masonry",
  relatedServiceIds: ["masonry"],
  title: "Crumbling or cracked brick steps",
  metaTitle: "Crumbling or cracked brick steps: repair or rebuild? | A5",
  metaDescription:
    "Why brick front steps crack, crumble, or pull away from the house, what to photograph, and when a repair holds versus when the steps need rebuilding.",
  primaryQuestion:
    "Why are my brick steps crumbling or cracking, and can they be repaired?",
  directAnswer:
    "Brick steps usually crack or crumble because water gets into the mortar and brick and freezes, because the base under the steps has settled, or both. Crumbling mortar and a few damaged bricks on steps that are still level and tight to the house can usually be repaired. Steps that tilt, rock, or have pulled away from the house usually need to be rebuilt on a sound base.",
  intro:
    "Front steps take more abuse than almost any other masonry: foot traffic, snow shovels, de-icing salt, and water from roofs and downspouts, all through a northern New Jersey winter of repeated freezing and thawing.",
  seeing: [
    "Mortar between bricks that is sandy, cracked, recessed, or falling out, especially on the treads and edges.",
    "Brick faces that are flaking or popping off (spalling), or bricks cracked straight through.",
    "Loose bricks or cap stones on the treads or along the sides.",
    "Steps that tilt forward or sideways, or a gap opening between the top step and the house.",
    "Diagonal cracks running through several courses of brick on the side walls.",
  ],
  firstSteps: {
    heading: "What to do right now",
    paragraphs: [
      "If a step is loose, rocking, or has a raised edge, treat it as a trip hazard: mark it, use another entrance if you have one, and avoid carrying heavy loads over it.",
      "Hold off on filling cracks with caulk or patching compound. It can trap water and makes proper repointing harder later.",
    ],
  },
  causes: [
    "Freeze-thaw damage: water in porous brick and failed mortar expands when it freezes and opens cracks a little more each cycle.",
    "Settlement: the fill or base under the steps compacts or washes out, so the steps sink or pull away from the foundation.",
    "Water: downspouts discharging near the steps, gutters overflowing onto them, or treads that slope back toward the house and hold water.",
    "De-icing salt, which can speed up surface flaking on brick and concrete.",
    "Age: mortar wears out before brick does and eventually needs repointing even on sound steps.",
  ],
  photograph: [
    "The whole set of steps, straight on, from about ten feet back.",
    "A low side view along the steps, which shows tilting and settling.",
    "The worst crumbling or cracked area with a coin or tape measure for scale.",
    "Where the top step meets the house, including any gap.",
    "The nearest downspout and where it empties.",
  ],
  repairOrReplace: [
    "Repair usually means repointing failed joints, replacing spalled or cracked bricks, and resetting loose treads or caps. It fits when the steps are level, solid underfoot, and tight to the house.",
    "Rebuild usually means taking the steps apart, correcting or rebuilding the base, and relaying brick, reusing sound brick where practical. It fits when the steps have tilted, sunk, or separated from the house, or when repairs keep failing in the same place.",
    "Partial rebuilds are common too — for example, rebuilding the top tread and landing while repointing the lower steps.",
  ],
  whoYouNeed: [
    "A masonry professional. A5 reviews your request and photos and coordinates a local mason to look at the steps in person. A5 does not diagnose steps remotely.",
    "If the steps are pulling away because of a larger foundation or grading problem, the mason may recommend addressing that first.",
  ],
  costFactors: [
    "Repair versus partial or full rebuild.",
    "Number and width of steps, and whether there are side walls or a landing.",
    "Brick matching: common brick versus older brick that needs a reclaimed or close substitute.",
    "Condition of the base and how much has to be dug out.",
    "Railings that have to be removed and reinstalled.",
    "Drainage fixes, such as extending a downspout.",
  ],
  questions: [
    {
      question: "Can brick steps be repaired in winter?",
      answer:
        "Mortar needs to cure above freezing, so full repairs are usually scheduled in milder weather. An unsafe step can still be assessed and made safer in the meantime.",
    },
    {
      question: "Should I switch to concrete or stone steps?",
      answer:
        "That is a design choice, not a requirement. If you are open to a different material, say so in your request.",
    },
  ],
  related:
    "Mortar falling out of brick joints, sunken pavers on the walk leading to the steps, and a damaged brick walkway often show up alongside failing steps. Water pooling at the base of the steps is sometimes a yard grading question.",
  relatedProblemSlugs: [
    "loose-mortar",
    "sunken-pavers",
    "damaged-brick-walkway",
    "yard-surface-grading",
  ],
  cta: {
    title: "Get help with your brick steps",
    description:
      "Describe what is happening and add up to five photos, including one from the side. A5 reviews it and coordinates a masonry professional.",
  },
  claimsToVerify: [CLAIM_NJ_CLIMATE, CLAIM_DEICING_SALT, CLAIM_MORTAR_COLD_WEATHER],
});

const looseMortar = problemPage({
  problemSlug: "loose-mortar",
  primaryServiceId: "masonry",
  relatedServiceIds: ["masonry"],
  title: "Mortar falling out of brick joints",
  metaTitle: "Mortar falling out of brick joints: when to repoint | A5",
  metaDescription:
    "Sandy, cracked, or missing mortar between bricks: what causes it, what to photograph, and when repointing is enough versus when the bricks or wall need more work.",
  primaryQuestion:
    "Why is mortar falling out between my bricks, and do I need repointing?",
  directAnswer:
    "Mortar is meant to wear out before the brick does, so crumbling joints on an older wall, step, or walk are often normal aging sped up by water and freezing. If the bricks are sound and nothing is leaning or bulging, repointing — removing failed mortar to a set depth and packing in new — is the usual repair. Loose or cracked bricks, bulging, or cracks running through the brick point to more than a mortar problem.",
  intro:
    "You notice it as sand on the ground below a wall, a joint you can scratch out with a key, or gaps between bricks you can see into.",
  seeing: [
    "Mortar that is soft, sandy, or crumbles when scraped.",
    "Joints that have receded well behind the face of the brick.",
    "Hairline cracks along joints, or cracks that step diagonally through them.",
    "Gaps where mortar is missing entirely.",
    "Bricks next to failing joints that have loosened.",
  ],
  causes: [
    "Age: mortar is intentionally softer than brick and erodes first.",
    "Water: joints that stay wet — under a leaking gutter, near a downspout, or at ground level — fail faster.",
    "Freeze-thaw cycles, which open wet joints a little more each winter.",
    "Earlier repairs with mortar harder than the brick, which can make brick edges crack or spall instead of the joint.",
    "Movement: cracks that step diagonally through joints can mean settling, which is a different conversation from ordinary wear.",
  ],
  photograph: [
    "A wide shot of the whole wall, step, or walk.",
    "A close-up of the worst joints with a coin or key for scale.",
    "Any diagonal cracks or bulging, from the side if possible.",
    "Gutters or downspouts above or near the area.",
    "Any spot where bricks are loose or have moved.",
  ],
  repairOrReplace: [
    "Repointing fits when bricks are sound and the wall is plumb: failed mortar is removed to a consistent depth and replaced with a compatible mortar, then tooled to match the existing joints.",
    "Replacing bricks fits when some are cracked, spalled, or loose; they are cut out and replaced during repointing.",
    "Rebuilding a section fits when the wall is bulging, leaning, or cracked through the brick from movement. A retaining wall that is moving may need an engineer before any rebuild.",
  ],
  whoYouNeed: [
    "A masonry professional. Mortar selection matters, especially on older brick, so repointing is masonry work rather than a general handyman task.",
    "If the wall is a leaning retaining wall, the masonry professional may recommend an engineering assessment first. A5 does not provide structural engineering.",
  ],
  costFactors: [
    "How much joint area needs repointing, and at what height.",
    "Joint depth and how hard the old mortar is to remove.",
    "Matching mortar color and joint profile on visible walls.",
    "Brick replacement and matching.",
    "Ladders or staging for taller walls.",
  ],
  questions: [
    {
      question: "Can I fill the gaps with caulk?",
      answer:
        "Caulk and surface patches tend to trap water and fall out, and they make proper repointing harder later. They are not a lasting fix.",
    },
    {
      question: "Will the new mortar match?",
      answer:
        "New mortar is usually lighter at first and weathers over time. A mason can tint it closer to the existing color.",
    },
  ],
  related:
    "Crumbling brick steps, a shifting retaining wall, and a damaged brick walkway often start with mortar failure.",
  relatedProblemSlugs: [
    "brick-step-repair",
    "shifting-retaining-wall",
    "damaged-brick-walkway",
  ],
  cta: {
    title: "Get help with failing mortar",
    description:
      "Tell A5 where the wall or steps are and add a wide shot plus a close-up of the joints.",
  },
  claimsToVerify: [CLAIM_NJ_CLIMATE],
});

const sunkenPavers = problemPage({
  problemSlug: "sunken-pavers",
  primaryServiceId: "masonry",
  relatedServiceIds: ["masonry"],
  title: "Sunken or rocking pavers",
  metaTitle: "Sunken or rocking pavers on a walk or patio: fixes | A5",
  metaDescription:
    "Why patio and walkway pavers sink, rock, or heave, what to photograph, and when lifting and resetting works versus when the base needs to be rebuilt.",
  primaryQuestion: "Why are my pavers sinking or rocking, and can they be reset?",
  directAnswer:
    "Pavers sink or rock when the base underneath settles, washes out, or was too thin to begin with, or when the edge restraint lets pavers drift. A small dip is usually fixed by lifting the pavers, correcting the base, and relaying them — often reusing the same pavers. Widespread sinking, heaving, or standing water across a patio usually means the base needs to be rebuilt for the whole area.",
  intro:
    "A paver walk or patio should feel flat and solid. When a section dips, a paver rocks underfoot, or edges start lifting, the problem is almost always below the pavers rather than the pavers themselves.",
  seeing: [
    "A low spot where water collects after rain.",
    "Individual pavers that rock or click when stepped on.",
    "Raised edges that catch a toe or a shovel.",
    "Pavers spreading apart at the edge, with wide joints.",
    "Weeds or ant hills in joints where sand has washed out.",
  ],
  causes: [
    "Base settlement: the compacted gravel and sand under the pavers settles, or was not compacted enough when installed.",
    "Washout: water from a downspout, gutter, or slope running under the pavers carries base material away.",
    "Failed edge restraint: without a solid edge, pavers drift outward and joints open.",
    "Tree roots lifting sections.",
    "Frost heave, where freezing water in the base pushes pavers up and they do not settle back evenly.",
  ],
  photograph: [
    "A wide shot of the whole walk or patio.",
    "The low or raised area, with a level or straight board laid across it if you have one.",
    "A photo during or after rain showing where water sits.",
    "The edge where pavers meet lawn or beds.",
    "Downspouts, slopes, or trees near the problem area.",
  ],
  repairOrReplace: [
    "Lift and reset fits a defined low or high area: pavers are removed, the base is corrected and compacted, and the same pavers are relaid and re-sanded.",
    "Rebuilding the base fits when the problem is widespread, the original base was inadequate, or the patio holds water across its surface. Pavers in good condition can often still be reused.",
    "Replacing pavers fits cracked or badly stained pavers, or a wish for a different look — more a design choice than a repair requirement.",
  ],
  whoYouNeed: [
    "A masonry or hardscape professional. A5 coordinates this under masonry.",
    "If water from the yard is the cause, grading or downspout work may be part of the fix, which can be coordinated under landscaping.",
  ],
  costFactors: [
    "Size of the affected area versus the whole walk or patio.",
    "Whether the base needs correcting or fully rebuilding.",
    "Reusing existing pavers versus new pavers, and whether a matching paver is still made.",
    "Edge restraint repair or installation.",
    "Drainage corrections and equipment access.",
  ],
  questions: [
    {
      question: "Can I just add sand under the low pavers?",
      answer:
        "Adding sand without correcting and compacting the base usually brings the dip back, and it does not stop water from washing the base out.",
    },
  ],
  related:
    "Uneven stone patios, damaged brick walkways, crumbling brick steps, and water pooling in the yard are common neighbors of sunken pavers.",
  relatedProblemSlugs: [
    "uneven-stone-patio",
    "damaged-brick-walkway",
    "brick-step-repair",
    "yard-surface-grading",
  ],
  cta: {
    title: "Get help with sunken pavers",
    description:
      "Add a wide shot, a close-up of the low spot, and a photo after rain if you have one. A5 coordinates a masonry professional.",
  },
  claimsToVerify: [CLAIM_NJ_CLIMATE],
});

const activeLeak = problemPage({
  problemSlug: "visible-pipe-leak",
  primaryServiceId: "plumbing",
  relatedServiceIds: ["plumbing"],
  title: "Active leak you can see",
  metaTitle: "Active water leak at a pipe or valve: what to do first | A5",
  metaDescription:
    "Water dripping from a pipe, valve, or supply line? How to stop it, what to photograph, repair versus replacement, and who fixes it. A5 is not an emergency plumber.",
  primaryQuestion: "I can see water leaking from a pipe or valve. What should I do?",
  directAnswer:
    "Stop the water first: close the shutoff valve for that fixture, or the home's main shutoff if the leak is not at a fixture or the valve won't close. Put down a bucket and towels and move valuables away. Once it is contained, a qualified plumber repairs or replaces the leaking fitting, valve, or section. If water is still flowing and you cannot stop it, call an emergency plumber — A5 does not offer emergency dispatch.",
  intro:
    "A visible leak is the plumbing problem you can do the most about in the first few minutes. The goal is to stop the water, limit the damage, and then schedule the repair.",
  seeing: [
    "Water dripping or spraying from a pipe joint, valve, or supply line.",
    "A wet cabinet floor under a sink, or a puddle near a toilet, water heater, or washing machine.",
    "Corrosion, green or white crust, or rust at a fitting.",
    "A braided supply line that is bulging, frayed, or kinked.",
    "Water staining on a ceiling or wall below a bathroom or kitchen.",
  ],
  firstSteps: {
    heading: "What to do right now",
    paragraphs: [
      "Close the shutoff valve under or behind the fixture by turning it clockwise.",
      "If that does not stop it, close the main water shutoff, usually where the water line enters the house — often in the basement near the water meter.",
      "Keep away from water near outlets, cords, or the electrical panel, and do not touch electrical equipment while standing in water.",
      "Once the water is off, open a faucet on the lowest floor to relieve pressure, and dry the area to limit damage.",
      "Call an emergency plumber if you cannot stop the water. A5 does not offer emergency dispatch.",
    ],
  },
  causes: [
    "Worn packing or washers, especially on older shutoff valves.",
    "Loose or corroded compression fittings and threaded joints.",
    "Aging rubber or braided supply lines to sinks, toilets, and appliances.",
    "Pinhole leaks in older copper or corroded galvanized pipe.",
    "Condensation dripping from cold pipes in humid weather, which can look like a leak.",
  ],
  photograph: [
    "The exact spot where water is coming out, as close as you can get with a sharp image.",
    "The shutoff valve and supply line for that fixture.",
    "The pipe run leading to the leak, so the material is visible.",
    "Any damage to the cabinet, floor, or ceiling below.",
    "The main shutoff valve, if you had to use it.",
  ],
  repairOrReplace: [
    "Repair fits a single failed fitting, washer, or valve on otherwise sound pipe: the part is tightened, repacked, or replaced.",
    "Replacement fits aging supply lines, corroded valves, or a pipe section with more than one leak. Supply lines and shutoff valves are commonly replaced rather than repaired.",
    "Repeated pinhole leaks in the same pipe run can point to broader pipe aging, and the plumber may discuss replacing a longer section.",
  ],
  whoYouNeed: [
    "A qualified plumbing professional. Plumbing is a licensed trade in New Jersey, and A5 office staff do not perform plumbing work. A5 coordinates the plumber after intake.",
    "If the leak damaged drywall, a ceiling, tile, or paint, A5 can coordinate those as related steps once the plumbing is fixed.",
  ],
  costFactors: [
    "Where the leak is: exposed under a sink versus inside a wall, ceiling, or finished basement.",
    "A fitting or valve repair versus replacing a section of pipe.",
    "Pipe material and age.",
    "Access, including opening walls or ceilings.",
    "Related repairs after the leak.",
  ],
  questions: [
    {
      question: "Is a slow drip under the sink urgent?",
      answer:
        "A contained drip with a bucket under it is not an emergency, but it should be scheduled soon. Slow leaks damage cabinets and subfloors over time.",
    },
    {
      question: "Can I use tape or a clamp in the meantime?",
      answer:
        "Temporary wraps and clamps can slow some leaks but are not repairs. Shutting off the water is safer than relying on them.",
    },
  ],
  related:
    "A water-stained ceiling below a bathroom, a dripping faucet, a running toilet, and fixture replacement are closely related plumbing problems.",
  relatedProblemSlugs: [
    "water-damaged-ceiling",
    "dripping-faucet",
    "running-toilet",
    "fixture-replacement",
  ],
  cta: {
    title: "Get the leak repaired",
    description:
      "Once the water is stopped, tell A5 where the leak is and add up to five photos. A5 coordinates a qualified plumbing professional.",
  },
  claimsToVerify: [CLAIM_NJ_PLUMBING_LICENSE],
});

const runningToilet = problemPage({
  problemSlug: "running-toilet",
  primaryServiceId: "plumbing",
  relatedServiceIds: ["plumbing"],
  title: "Toilet that keeps running",
  metaTitle: "Toilet keeps running or refilling: causes and repairs | A5",
  metaDescription:
    "A toilet that runs, hisses, or refills on its own usually has a worn flapper or fill valve. What to check, what to photograph, and when replacement makes sense.",
  primaryQuestion: "Why does my toilet keep running, and does it need to be replaced?",
  directAnswer:
    "A toilet that runs constantly or refills on its own almost always has a worn flapper, a misadjusted float, or a failing fill valve inside the tank — small parts a plumber can replace without replacing the toilet. Replacement makes sense when the tank or bowl is cracked, the toilet keeps leaking at the base after repair, or you want a different toilet.",
  intro:
    "A running toilet is easy to ignore because it is not dramatic. It does waste water continuously, and the tank refilling at random times usually means a small part inside has worn out.",
  seeing: [
    "Water keeps running into the bowl after a flush and does not stop.",
    "The tank refills briefly on its own every so often, with no one using it.",
    "A hissing sound from the tank.",
    "A weak or incomplete flush, or a handle that has to be held down.",
    "Water trickling down the inside of the bowl long after flushing.",
  ],
  firstSteps: {
    heading: "What you can check safely",
    paragraphs: [
      "Lift the tank lid and look. Water spilling into the tall overflow tube in the middle points to the float or fill valve.",
      "Add a few drops of food coloring to the tank without flushing. If color shows up in the bowl within about fifteen minutes, the flapper is leaking.",
      "If it runs constantly and you need it to stop, close the shutoff valve behind the toilet.",
    ],
  },
  causes: [
    "A worn or warped flapper that no longer seals, letting water leak from tank to bowl.",
    "A float set too high, so water spills into the overflow tube.",
    "A fill valve that does not shut off completely.",
    "A flapper chain that is too short, too long, or tangled.",
    "Mineral buildup on the flush valve seat.",
  ],
  photograph: [
    "Inside the tank with the lid off, showing the flapper, float, and fill valve.",
    "The shutoff valve and supply line behind the toilet.",
    "The base of the toilet where it meets the floor.",
    "Any cracks in the tank or bowl.",
    "The manufacturer name or model stamped inside the tank or under the lid.",
  ],
  repairOrReplace: [
    "Repair fits almost every running toilet: the flapper, fill valve, float, or chain is replaced or adjusted.",
    "Replacement fits a cracked tank or bowl, a toilet that keeps leaking at the base after the seal is redone, one that clogs constantly, or a planned upgrade.",
    "A toilet that rocks may have a failing wax seal at the base. That is still a repair, but it involves pulling the toilet.",
  ],
  whoYouNeed: [
    "A qualified plumbing professional. A5 routes toilet repairs to plumbing rather than handyman work.",
  ],
  costFactors: [
    "Which parts inside the tank need replacing.",
    "Whether the toilet has to be pulled to reset or replace the wax seal.",
    "Age and make of the toilet, which affects part availability.",
    "For replacement, the toilet you choose and the floor condition under it.",
  ],
  questions: [
    {
      question: "Is a running toilet an emergency?",
      answer:
        "No, unless it is overflowing. Close the shutoff behind it if you need it to stop until the repair.",
    },
    {
      question: "Should I just replace the whole toilet?",
      answer:
        "Usually not for a running toilet. Replacement is worth discussing if it is cracked, leaking at the base, or you want an upgrade.",
    },
  ],
  related:
    "Dripping faucets, visible pipe leaks, and fixture replacement are related plumbing problems. A stain on the ceiling below a toilet can mean a leak at the base.",
  relatedProblemSlugs: [
    "dripping-faucet",
    "visible-pipe-leak",
    "fixture-replacement",
    "water-damaged-ceiling",
  ],
  cta: {
    title: "Get the toilet fixed",
    description:
      "Add a photo inside the tank and one of the base. A5 coordinates a qualified plumbing professional.",
  },
});

const waterDamagedCeiling = problemPage({
  problemSlug: "water-damaged-ceiling",
  primaryServiceId: "drywall",
  relatedServiceIds: ["plumbing", "drywall", "painting"],
  title: "Water stain or soft spot on the ceiling",
  metaTitle: "Water stain or sagging ceiling: what to fix first | A5",
  metaDescription:
    "A ceiling stain, bubble, or soft spot after a leak: find the source, what to photograph, patch versus replace, and how plumbing, drywall, and paint fit together.",
  primaryQuestion:
    "There's a water stain or soft spot on my ceiling. What do I fix first?",
  directAnswer:
    "Find and stop the source first — usually a bathroom or pipe leak above, sometimes a roof or condensation problem. Then let the area dry or cut out wet material, repair the drywall, and prime and paint last. A dry stain on firm drywall often needs only stain-blocking primer and paint once the leak is fixed; soft, sagging, or crumbling drywall is cut out and replaced.",
  intro:
    "A ceiling stain is usually the last place a leak shows up, not the first. The stain tells you water got there; the repair starts wherever the water came from.",
  seeing: [
    "A yellow or brown ring on the ceiling, sometimes with darker edges.",
    "Paint that is bubbling, peeling, or hanging in a blister.",
    "Drywall that feels soft, sags, or bulges.",
    "Active dripping, or a stain that grows after someone showers or flushes.",
    "A musty smell or dark spotting that could be mold.",
  ],
  firstSteps: {
    heading: "What to do right now",
    paragraphs: [
      "If the ceiling is sagging with water, keep people out from underneath and put a bucket below. A bulging ceiling holding water can come down suddenly.",
      "If the stain is below a bathroom, stop using that shower, tub, or toilet until it is checked.",
      "If water is near a light fixture or ceiling fan, turn off that circuit at the breaker.",
      "If the leak is active and you cannot find the source, close the main water shutoff.",
    ],
  },
  causes: [
    "A leak from a shower, tub, toilet seal, or supply line in a bathroom above.",
    "A leaking pipe or drain running through the ceiling.",
    "A roof, flashing, or gutter leak, especially on top-floor ceilings. Roofing is not an A5 service and needs a roofer.",
    "Condensation from uninsulated pipes or ducts in an attic or ceiling space.",
    "An old leak that has been fixed but left a stain.",
  ],
  photograph: [
    "The stain or damaged area, with the whole ceiling for context.",
    "A close-up showing whether paint is bubbling or drywall is sagging.",
    "What is directly above: the bathroom, fixtures, or roofline.",
    "Under the sink and around the toilet and tub in the room above.",
    "Any light fixture or fan near the damage.",
  ],
  repairOrReplace: [
    "Stain only, with dry and firm drywall: once the leak is fixed and the area is dry, the stain is sealed with stain-blocking primer and the ceiling is painted.",
    "Soft, sagging, or crumbling drywall: the damaged section is cut out, the cavity dries, and new drywall is installed, taped, finished, primed, and painted.",
    "Suspected mold: wet, moldy drywall is removed as part of the repair. Larger mold growth may need a remediation specialist, which A5 does not provide.",
  ],
  whoYouNeed: [
    "Usually three trades in order: a qualified plumbing professional to find and fix a plumbing leak, a drywall professional to repair the ceiling, and a painter to finish it. A5 can coordinate all three as related steps.",
    "If the source is the roof, a roofer is needed before the ceiling is repaired. Roofing is outside A5's services.",
  ],
  costFactors: [
    "The source of the leak and what it takes to fix.",
    "Sealing and painting only, versus replacing a drywall section.",
    "Size of the damaged area and ceiling height.",
    "Ceiling texture, which is harder to match than a smooth ceiling.",
    "Whether the whole ceiling is repainted so the repair does not show.",
  ],
  questions: [
    {
      question: "Can I just paint over the stain?",
      answer:
        "Only after the leak is fixed and the ceiling is dry and firm. Ordinary paint lets stains bleed through; a stain-blocking primer goes on first.",
    },
    {
      question: "How long should the ceiling dry?",
      answer:
        "It depends on how wet it got and the airflow. The drywall professional checks that the area is dry before closing it up.",
    },
  ],
  related:
    "A visible pipe leak, a running toilet, cracked shower tile, ceiling drywall damage, and painting after a patch are all connected to a water-damaged ceiling.",
  relatedProblemSlugs: [
    "visible-pipe-leak",
    "running-toilet",
    "cracked-shower-tile",
    "ceiling-drywall-damage",
    "paint-after-patching",
  ],
  cta: {
    title: "Get help with a water-damaged ceiling",
    description:
      "Tell A5 whether it is still wet and what is above it. Add up to five photos. A5 coordinates the leak, the drywall, and the paint in order.",
  },
});

const holeInWall = problemPage({
  problemSlug: "hole-in-drywall",
  primaryServiceId: "drywall",
  relatedServiceIds: ["drywall"],
  title: "Hole in a wall",
  metaTitle: "Hole in drywall: patch or replace the section? | A5",
  metaDescription:
    "Doorknob holes, anchor holes, and bigger damage: how drywall holes are patched or cut out, what to photograph, and what makes the repair invisible after paint.",
  primaryQuestion: "How is a hole in drywall repaired, and will it show?",
  directAnswer:
    "Small holes are filled; doorknob-size holes get a mesh or backer patch and several coats of compound; holes bigger than a hand get a new piece of drywall fastened to framing or backing, then taped and finished. Done well, the patch is flat and disappears once it is primed and painted. It shows until it is painted.",
  intro:
    "Drywall holes happen: a doorknob without a stop, a moving day, a removed TV mount. Almost all of them are repairable without replacing the whole wall.",
  seeing: [
    "Small holes from nails, screws, or wall anchors.",
    "A round hole behind a door from the knob.",
    "A larger hole or crushed area from an impact.",
    "Torn paper around an old anchor or mount.",
    "An access hole cut by a plumber or electrician that was never closed.",
  ],
  causes: [
    "Doors swinging into the wall without a stop.",
    "Furniture, moving, or other impact.",
    "Removed mounts, shelves, or anchors.",
    "Access openings from other repairs.",
    "Soft board from water, which crumbles instead of denting — a different repair that starts with the leak.",
  ],
  photograph: [
    "A close-up of the hole with a tape measure or coin next to it for scale.",
    "The wall around it, so texture and paint finish are visible.",
    "What is behind the hole, if you can see in — wires, pipes, or framing.",
    "Other holes in the same room, if there are several.",
    "The paint color name or can, if you want the repair painted.",
  ],
  repairOrReplace: [
    "Filling fits nail and screw holes and small anchor holes.",
    "Patching fits holes up to about doorknob size, using mesh or a backer and several coats of compound.",
    "Cutting in a new piece fits holes bigger than a hand or a crushed area: the damaged part is cut square, backing is added, and new drywall is installed and finished.",
    "Replacing a larger section fits soft, water-damaged, or moldy board, after the source of the water is fixed.",
  ],
  whoYouNeed: [
    "A drywall professional for anything bigger than nail holes. A single small patch can go on a handyman list; several holes, large holes, or ceiling holes are drywall work.",
    "A painter, or the same professional if painting is included, to prime and paint the repair.",
    "If wires or pipes are visible in the hole, or it is an access hole from a plumbing or electrical repair, say so in your request.",
  ],
  costFactors: [
    "Size and number of holes.",
    "Wall texture, which takes more work to match.",
    "Whether priming and painting are included.",
    "Height and location, such as stairwells or ceilings.",
    "Plaster walls instead of drywall.",
  ],
  questions: [
    {
      question: "Will the patch match my wall texture?",
      answer:
        "Smooth walls are easiest to blend. Textured walls can be matched closely, but mention the texture in your request.",
    },
    {
      question: "Can I paint just the patch?",
      answer:
        "Touch-up paint on a patch often shows, especially on older or flat paint. Painting the wall corner to corner gives the most even result.",
    },
  ],
  related:
    "Drywall cracks, unfinished drywall repairs, painting after a patch, and wall mounting are closely related.",
  relatedProblemSlugs: [
    "drywall-crack",
    "unfinished-drywall-repair",
    "paint-after-patching",
    "wall-mounting",
  ],
  cta: {
    title: "Get a hole in the wall repaired",
    description:
      "Add a close-up with something for scale and a wider shot of the wall. A5 coordinates a drywall professional.",
  },
});

const drywallCrack = problemPage({
  problemSlug: "drywall-crack",
  primaryServiceId: "drywall",
  relatedServiceIds: ["drywall"],
  title: "Wall or ceiling crack that keeps coming back",
  metaTitle: "Drywall crack that keeps coming back: causes and fixes | A5",
  metaDescription:
    "Cracks over doors, along ceiling seams, and nail pops: why drywall cracks return, what to photograph, and when a crack is cosmetic versus worth a closer look.",
  primaryQuestion: "Why does this drywall crack keep coming back, and is it a problem?",
  directAnswer:
    "Most drywall cracks — over door and window corners, along ceiling seams, and nail pops — come from normal seasonal movement in the framing and are cosmetic. They come back when they are only filled and painted; a lasting repair usually opens the crack, re-tapes it, and refinishes it. Cracks that are wide, growing, or paired with sticking doors and sloping floors are worth a closer look.",
  intro:
    "Hairline cracks in drywall are common, and a crack returning after a quick fix is one of the most familiar homeowner annoyances. Where the crack is and what shape it takes say a lot about why.",
  seeing: [
    "A diagonal crack running from the corner of a door or window.",
    "A straight crack along a ceiling or wall seam.",
    "Small round bumps or popped circles where screws or nails push through the finish.",
    "A crack where a wall meets the ceiling.",
    "A crack that was patched and painted and has reappeared.",
  ],
  causes: [
    "Seasonal movement: wood framing shrinks and swells with humidity through the year, stressing corners and seams.",
    "Joints taped without enough compound, or with tape that did not bond.",
    "Nail pops from framing shrinkage pushing fasteners out.",
    "Truss uplift in some top-floor ceilings, where roof framing moves seasonally and pulls the ceiling away from walls.",
    "Settlement or structural movement, which is less common and usually comes with other signs.",
  ],
  photograph: [
    "The whole crack from end to end, including the door, window, or corner it runs from.",
    "A close-up with a coin or ruler to show width.",
    "Any nail pops nearby.",
    "If you suspect movement, a nearby door that sticks or a level on the floor.",
    "Previous patches, if the crack has been repaired before.",
  ],
  repairOrReplace: [
    "Cosmetic cracks are opened slightly, re-taped with the right tape for the location, refinished with several coats of compound, then primed and painted.",
    "Nail pops are fixed by driving a new screw next to the popped fastener and refinishing.",
    "Cracks from ongoing movement may return even after a proper repair; flexible tapes or corner bead can help at problem joints.",
    "Replacing drywall is rarely needed for cracks alone unless the board itself is damaged.",
  ],
  whoYouNeed: [
    "A drywall professional for the repair.",
    "If the crack is wide, growing, or paired with sticking doors, sloping floors, or foundation cracks, mention it. A structural assessment is a separate question from the drywall repair, and A5 does not provide structural engineering.",
  ],
  costFactors: [
    "Length and number of cracks.",
    "Walls versus ceilings.",
    "Texture matching.",
    "Whether painting is included.",
    "Removing earlier patches that failed.",
  ],
  questions: [
    {
      question: "When is a drywall crack a structural problem?",
      answer:
        "Most are not. Wide cracks, cracks that keep widening, or cracks alongside sticking doors and sloping floors are reasons to get a closer look.",
    },
    {
      question: "Why do cracks show up in winter?",
      answer:
        "Indoor air gets dry during the heating season, framing shrinks, and cracks often appear or widen then.",
    },
  ],
  related:
    "Holes in drywall, damaged ceiling drywall, unfinished repairs, and a sticking interior door can share the same seasonal causes.",
  relatedProblemSlugs: [
    "hole-in-drywall",
    "ceiling-drywall-damage",
    "unfinished-drywall-repair",
    "sticking-interior-door",
  ],
  cta: {
    title: "Get a recurring crack repaired",
    description:
      "Photograph the whole crack and a close-up for width. Mention if it has been patched before.",
  },
  claimsToVerify: [CLAIM_NJ_CLIMATE],
});

const lightingFailure = problemPage({
  problemSlug: "failed-light-fixture",
  primaryServiceId: "electrical",
  relatedServiceIds: ["electrical"],
  title: "Light that stopped working or flickers",
  metaTitle: "Light fixture not working or flickering: what to check | A5",
  metaDescription:
    "A light that won't turn on or flickers: safe checks you can make, whether it's the bulb, fixture, or circuit, what to photograph, and who should fix it.",
  primaryQuestion:
    "My light stopped working or flickers. Is it the bulb, the fixture, or the wiring?",
  directAnswer:
    "Start with the bulb and the breaker: a new bulb of the right type and a check for a tripped breaker solve many dead lights. If one fixture still fails or flickers with a good bulb, the fixture, its socket, or the switch is the likely cause, and a qualified electrician can usually replace it. Several lights flickering together, flickering when appliances start, or any burning smell or heat point to a circuit problem that should not wait.",
  intro:
    "A light that fails is usually a small problem, but the fix depends on whether it is the bulb, the fixture, the switch, or the circuit feeding them.",
  seeing: [
    "A light that will not turn on with a new bulb.",
    "A light that flickers, dims, or buzzes.",
    "A fixture that works sometimes and not others.",
    "Several lights in one area that flicker or dim together.",
    "Bulbs in one fixture that burn out unusually often.",
  ],
  firstSteps: {
    heading: "What you can check safely",
    paragraphs: [
      "Replace the bulb with a new one of the correct type and wattage. With LED bulbs on a dimmer, check that the bulb is labeled dimmable.",
      "Check the breaker panel for a tripped breaker and reset it once.",
      "Flip the switch a few times and notice whether the flicker changes when you touch it.",
      "Stop if you smell burning, see scorching, hear buzzing, or the cover is hot. Turn off the breaker if you can reach it safely.",
      "Do not remove the fixture or open the switch box.",
    ],
  },
  causes: [
    "A burned-out or incompatible bulb, including non-dimmable LEDs on a dimmer.",
    "A worn socket or failed fixture, common with older fixtures and outdoor lights exposed to weather.",
    "A worn or failing switch or dimmer.",
    "A loose connection in the fixture, switch, or box.",
    "A circuit problem, if several lights are affected or lights dim when appliances start.",
  ],
  photograph: [
    "The fixture from below, with the light off.",
    "The switch and cover plate that controls it.",
    "The bulb type and label.",
    "Your breaker panel with the door open and labels readable.",
    "Any discoloration or scorch marks, from a safe distance.",
  ],
  repairOrReplace: [
    "Replacing the bulb or switch fits when the fixture itself is sound.",
    "Replacing the fixture fits a failed socket or internal wiring, a corroded fixture, or a wish for a different fixture.",
    "Looking further fits several flickering lights, lights that dim with appliances, or a problem that continues after the fixture and switch are replaced.",
  ],
  whoYouNeed: [
    "A qualified electrical professional. Electrical work in New Jersey is a licensed trade, and A5 routes fixture and switch work to electrical, not handyman visits.",
    "A5 does not offer emergency electrical dispatch. For burning smells, sparking, or heat, turn off the breaker if safe, and call 911 if there is smoke or fire.",
  ],
  costFactors: [
    "Bulb, switch, or fixture replacement versus troubleshooting a circuit.",
    "The fixture you choose, and whether it is heavier than the old one.",
    "Ceiling height and access.",
    "Age and condition of the existing wiring and box.",
    "Outdoor fixtures, which need weather-rated parts.",
  ],
  questions: [
    {
      question: "Why do LED bulbs flicker on my dimmer?",
      answer:
        "Many older dimmers are not designed for LED loads. A compatible dimmer or bulb usually fixes it, and an electrician can replace the dimmer.",
    },
    {
      question: "Is flickering dangerous?",
      answer:
        "A single flickering bulb is usually a bulb or socket problem. Flickering across several lights, or with a burning smell, heat, or buzzing, should be looked at promptly.",
    },
  ],
  related:
    "Faulty switches, dead outlets, lighting updates, and recurring electrical issues are related electrical problems.",
  relatedProblemSlugs: [
    "faulty-switch",
    "dead-outlet",
    "lighting-update",
    "recurring-electrical-issue",
  ],
  cta: {
    title: "Get the light fixed",
    description:
      "Tell A5 what you have already checked and add photos of the fixture, switch, and panel labels. A5 coordinates a qualified electrical professional.",
  },
  claimsToVerify: [CLAIM_NJ_ELECTRICAL_LICENSE],
});

const deadOutlet = problemPage({
  problemSlug: "dead-outlet",
  primaryServiceId: "electrical",
  relatedServiceIds: ["electrical"],
  title: "Outlet with no power",
  metaTitle: "Outlet not working: GFCIs, breakers, and next steps | A5",
  metaDescription:
    "An outlet that's dead or works on and off: how to check GFCIs and breakers safely, what to photograph, and when a qualified electrician needs to look at it.",
  primaryQuestion: "Why is my outlet not working when the breaker is on?",
  directAnswer:
    "The most common cause is a tripped GFCI outlet elsewhere on the same circuit — often in a bathroom, kitchen, garage, basement, or outside — which cuts power to outlets downstream. Reset any GFCIs and check for a tripped breaker. If the outlet is still dead, works intermittently, or is warm, loose, or scorched, it needs a qualified electrician; the cause is often a worn outlet or a loose connection.",
  intro:
    "A dead outlet is one of the most common electrical requests, and it is often solved before anyone arrives.",
  seeing: [
    "An outlet with no power while others in the room work.",
    "Several outlets out in one area.",
    "An outlet that works only when a plug is wiggled.",
    "Plugs that fall out because the outlet no longer grips.",
    "A cover plate that is warm, cracked, or discolored.",
  ],
  firstSteps: {
    heading: "What you can check safely",
    paragraphs: [
      "Look for GFCI outlets — with test and reset buttons — in nearby bathrooms, the kitchen, garage, basement, and outdoors. Press reset firmly on each.",
      "Check the breaker panel for a tripped breaker and reset it once. If it trips again, leave it off.",
      "Check whether the outlet is controlled by a wall switch; some rooms have switched outlets for lamps.",
      "Stop if the outlet is warm, smells like burning, is scorched, or sparks. Turn off the breaker if safe.",
      "Do not remove the cover plate or pull the outlet out.",
    ],
  },
  causes: [
    "A tripped GFCI upstream on the same circuit.",
    "A tripped breaker.",
    "A worn outlet that no longer makes good contact.",
    "A loose connection at this outlet or one upstream.",
    "A switched outlet with the switch turned off.",
  ],
  photograph: [
    "The outlet with the cover plate on.",
    "Nearby GFCI outlets, showing whether the reset button has popped out.",
    "Your breaker panel with the door open and labels readable.",
    "Any discoloration, scorch marks, or melted plastic, from a safe distance.",
    "What you normally plug in there, if it draws a lot of power.",
  ],
  repairOrReplace: [
    "Resetting fits a tripped GFCI or breaker with no other signs.",
    "Replacing the outlet fits one that is worn, loose, cracked, or no longer grips plugs.",
    "Looking further fits several outlets still out after resets, a breaker that keeps tripping, or any sign of heat.",
    "Older homes with two-prong outlets may need more than a simple swap to add grounding; the electrician explains the options.",
  ],
  whoYouNeed: [
    "A qualified electrical professional. A5 routes outlet work to electrical, not a handyman visit.",
    "A5 does not offer emergency electrical dispatch. For heat, burning smells, or sparking, turn off the breaker if safe and call 911 if there is smoke or fire.",
  ],
  costFactors: [
    "A simple outlet replacement versus troubleshooting a circuit.",
    "Number of outlets affected.",
    "Whether the location calls for GFCI protection.",
    "Age and type of wiring, including two-prong ungrounded outlets.",
    "Access to the connection that failed.",
  ],
  questions: [
    {
      question: "Why did a GFCI in the bathroom kill an outlet in another room?",
      answer:
        "A GFCI protects every outlet wired after it on the same circuit, and those may not be in the same room. It is a common setup.",
    },
    {
      question: "Can a two-prong outlet be swapped for a three-prong one?",
      answer:
        "Not by simply swapping it. Without a ground, there are specific approaches an electrician can explain. A5 does not advise doing it yourself.",
    },
  ],
  related:
    "Failed light fixtures, faulty switches, and recurring electrical issues are related problems.",
  relatedProblemSlugs: [
    "failed-light-fixture",
    "faulty-switch",
    "recurring-electrical-issue",
  ],
  cta: {
    title: "Get the outlet looked at",
    description:
      "Tell A5 which GFCIs and breakers you checked and add photos with covers on. A5 coordinates a qualified electrical professional.",
  },
  claimsToVerify: [CLAIM_NJ_ELECTRICAL_LICENSE],
});

const crumblingGrout = problemPage({
  problemSlug: "crumbling-grout",
  primaryServiceId: "tile",
  relatedServiceIds: ["tile"],
  title: "Grout crumbling or washing out",
  metaTitle: "Crumbling or cracked grout: regrout or retile? | A5",
  metaDescription:
    "Grout that cracks, crumbles, or washes out of floors and showers: what causes it, what to photograph, and when regrouting is enough versus when tile needs attention.",
  primaryQuestion:
    "My grout is crumbling. Can it be regrouted, or does the tile need to come out?",
  directAnswer:
    "If the tiles are solid and well bonded, crumbling grout can usually be ground out and replaced without removing tile. If tiles are loose, sound hollow, or crack in a line — or a shower wall feels soft — the problem is under the tile, and regrouting alone will not hold. In showers, grout is not waterproofing, so failed grout is also a reason to check whether water has reached the backing.",
  intro:
    "Grout does quiet work: it locks tiles in place and keeps debris and most water out of the joints. When it cracks or washes out, repairing it early keeps water and movement from causing bigger problems.",
  seeing: [
    "Grout that crumbles or powders when scratched.",
    "Cracks along grout lines, especially in a line across a floor.",
    "Missing grout, leaving open joints.",
    "Dark, stained grout that does not clean up, often in showers.",
    "Tiles next to failing grout that move or sound hollow when tapped.",
  ],
  causes: [
    "Age and wear, especially on high-traffic floors and heavily used showers.",
    "Water exposure without the sealing or maintenance the grout type calls for.",
    "Harsh or acidic cleaners that break down cement-based grout.",
    "Movement in the floor or wall, which cracks grout in lines.",
    "Grout that was mixed or installed poorly originally.",
  ],
  photograph: [
    "A close-up of the worst grout with a coin for scale.",
    "A wide shot of the floor or shower wall.",
    "Any tiles that are cracked or loose.",
    "For showers, the wall or ceiling on the other side.",
    "Grout in good condition elsewhere, for color matching.",
  ],
  repairOrReplace: [
    "Regrouting fits sound, well-bonded tiles: old grout is removed and new grout packed in, in a color that matches or refreshes the look.",
    "Replacing tiles fits a few cracked or loose tiles, replaced along with the grout around them.",
    "Redoing the area fits many loose or hollow tiles, cracks running in lines from movement, or a shower with wet or soft backing.",
  ],
  whoYouNeed: [
    "A tile professional. A5 coordinates grout and tile repair as ordinary residential tile work, not specialty restoration.",
    "If a shower valve or pipe leak is suspected, that is coordinated as plumbing.",
  ],
  costFactors: [
    "Area to regrout and joint width.",
    "Grout type and color matching.",
    "Condition of the tile and what is behind it.",
    "Showers versus floors or backsplashes.",
    "Replacing caulk at corners and where surfaces meet.",
  ],
  questions: [
    {
      question: "Can new grout go over old grout?",
      answer:
        "Thin layers over old grout usually do not bond well and flake off. Failed grout is removed to a depth before regrouting.",
    },
    {
      question: "Do I need to seal grout?",
      answer:
        "It depends on the grout type. The tile professional can advise for the grout used.",
    },
  ],
  related:
    "Cracked shower tile, cracked floor tile, loose backsplash tile, and bathroom floor tile repair often go along with failing grout.",
  relatedProblemSlugs: [
    "cracked-shower-tile",
    "cracked-floor-tile",
    "loose-backsplash-tile",
    "bathroom-floor-tile-repair",
  ],
  cta: {
    title: "Get grout repaired",
    description:
      "Add a close-up of the grout, a wide shot, and any cracked tiles. A5 coordinates a tile professional.",
  },
});

const peelingExteriorPaint = problemPage({
  problemSlug: "peeling-exterior-paint",
  primaryServiceId: "painting",
  relatedServiceIds: ["painting"],
  title: "Peeling exterior paint",
  metaTitle: "Peeling exterior paint: causes, prep, and repainting | A5",
  metaDescription:
    "Why house paint peels, blisters, or chalks, what to photograph, spot repair versus full repaint, and what homes built before 1978 need to know about lead.",
  primaryQuestion:
    "Why is the paint on my house peeling, and do I need a full repaint?",
  directAnswer:
    "Exterior paint usually peels because moisture is getting behind it, because a new coat did not bond to what was underneath, or because old layers have lost flexibility. Small, isolated failures can be scraped, primed, and touched up; widespread peeling usually calls for full prep and repaint of that side or surface. On homes built before 1978, scraping old paint must be done with lead-safe practices.",
  intro:
    "Peeling paint is more than cosmetic. Once paint lifts, bare wood takes on water, and trim and siding can start to rot.",
  seeing: [
    "Paint lifting off in flakes or strips, down to bare wood.",
    "Paint peeling off an older coat of paint rather than the wood.",
    "Bubbles or blisters, sometimes with water inside.",
    "A powdery residue that rubs off on your hand.",
    "Soft or rotted wood under peeling paint, often on sills and lower trim.",
  ],
  causes: [
    "Moisture behind the paint from gutters, roof edges, missing caulk, or humid rooms like bathrooms and kitchens.",
    "Poor bonding when a new coat went over a dirty, glossy, or chalky surface.",
    "Many old layers that have become brittle and crack.",
    "Paint applied in poor conditions, such as cold, damp, or direct hot sun.",
    "Sun and weather exposure, which is harder on some sides of the house than others.",
  ],
  photograph: [
    "A close-up of the peeling, showing whether it is down to bare wood or between layers.",
    "Each side of the house you want painted.",
    "Trim, sills, and doors with the worst damage.",
    "Gutters, roof edges, and vents above the peeling area.",
    "Any soft or rotted wood.",
  ],
  repairOrReplace: [
    "Spot repair fits isolated failures: scrape, sand the edges, prime bare wood, and touch up. Touch-ups can show on faded paint.",
    "A full repaint fits widespread peeling, chalking, or cracking across a side or the whole house: wash, scrape, sand, repair, caulk, prime, and paint.",
    "Wood repair or replacement comes first for soft or rotted trim and siding.",
    "Fixing the moisture source — gutters, caulking, venting — keeps the new paint from failing the same way.",
  ],
  whoYouNeed: [
    "A painting professional for prep and paint. On homes built before 1978, work that disturbs paint has to be done by a firm certified for lead-safe renovation under federal rules.",
    "Rotted wood repair may be handled by the painter or a carpenter; mention it in your request.",
  ],
  costFactors: [
    "How much scraping and preparation the surface needs.",
    "Area and height: one side versus the whole house, one story versus two.",
    "Wood repair or replacement found during prep.",
    "Lead-safe work practices on homes built before 1978.",
    "Number of colors for body, trim, and doors.",
  ],
  questions: [
    {
      question: "When can exterior painting be done?",
      answer:
        "When surfaces are dry and temperatures, including overnight, are above the minimum on the paint label. In northern New Jersey that usually means late spring through early fall.",
    },
    {
      question: "Can I pressure-wash and paint over it?",
      answer:
        "Washing is part of prep, but loose paint still has to be scraped and bare wood primed. On homes built before 1978, washing and scraping old paint need lead-safe methods.",
    },
  ],
  related:
    "Trim paint failure, worn interior paint, and painting after a patch are related painting problems.",
  relatedProblemSlugs: [
    "trim-paint-failure",
    "worn-interior-paint",
    "paint-after-patching",
  ],
  cta: {
    title: "Get peeling paint addressed",
    description:
      "Add a close-up of the peeling and a photo of each side you want painted, and mention if the house was built before 1978.",
  },
  claimsToVerify: [CLAIM_EPA_RRP, CLAIM_NJ_CLIMATE],
});

const stickingDoor = problemPage({
  problemSlug: "sticking-interior-door",
  primaryServiceId: "handyman",
  relatedServiceIds: ["handyman"],
  title: "Interior door that sticks or won't latch",
  metaTitle: "Interior door sticking or not latching: common fixes | A5",
  metaDescription:
    "A door that rubs, sticks, or won't latch: seasonal swelling vs. sagging hinges, what to photograph, and when adjusting works versus when the door needs replacing.",
  primaryQuestion:
    "Why is my interior door sticking or not latching, and can it be fixed?",
  directAnswer:
    "Most sticking interior doors are fixed without replacing anything. Loose hinge screws let a door sag so it rubs at the top latch-side corner; humidity swells wood doors in summer; and a latch that misses the strike plate usually needs the plate adjusted. Tightening or shimming hinges, planing an edge, or moving the strike solves most cases. Replacement is for split, badly warped, or damaged doors.",
  intro:
    "A door that rubs or won't click shut is small, daily friction. It is also one of the most fixable things in a house.",
  seeing: [
    "The door rubs at the top corner on the latch side.",
    "The door sticks in humid months and works fine in winter.",
    "The latch does not catch, or you have to lift or push the door to latch it.",
    "Uneven gaps around the door when it is closed.",
    "The door swings open or closed on its own.",
  ],
  causes: [
    "Loose hinge screws, especially at the top hinge, which let the door sag.",
    "Seasonal swelling of wood in humid weather; northern New Jersey summers are humid and heated winters are dry.",
    "A strike plate that no longer lines up with the latch.",
    "Paint buildup on the door edge or jamb.",
    "A frame that has shifted from settling, which is less common and often shows as uneven gaps on several doors.",
  ],
  photograph: [
    "The door closed, showing the gap along the top and latch side.",
    "The hinges, especially the top one.",
    "The latch and strike plate.",
    "Any spot where paint is worn from rubbing.",
    "The whole door from the hallway.",
  ],
  repairOrReplace: [
    "Adjusting fits most cases: tighten or replace hinge screws with longer ones, shim a hinge, plane or sand the rubbing edge, or move the strike plate.",
    "Replacing hardware fits worn hinges or a latch that no longer retracts properly.",
    "Replacing the door fits a split, warped, or damaged door, or a wish for a different style; matching the existing door size and hinge locations is part of that job.",
  ],
  whoYouNeed: [
    "A handyman. Door adjustments, hardware, and trim are standard handyman list items.",
    "If several doors started sticking at once along with new cracks in walls, mention it; that can point to movement worth a closer look.",
  ],
  costFactors: [
    "Adjustment versus hardware or door replacement.",
    "Number of doors.",
    "Whether a planed edge needs to be sealed or repainted.",
    "Matching an existing door, especially older or non-standard sizes.",
  ],
  questions: [
    {
      question: "Should I plane a door that only sticks in summer?",
      answer:
        "Sometimes, but a door planed at peak humidity can have a large gap in winter. Adjusting the hinges is often the first step.",
    },
    {
      question: "Can other small repairs be done at the same visit?",
      answer:
        "Yes. List them in your request; A5 can group handyman items together.",
    },
  ],
  related:
    "Worn door hardware, loose or damaged trim, and punch-list repairs are related handyman problems. Wall cracks near sticking doors are covered under drywall.",
  relatedProblemSlugs: [
    "worn-door-hardware",
    "loose-or-damaged-trim",
    "punch-list-repairs",
    "drywall-crack",
  ],
  cta: {
    title: "Get the door working again",
    description:
      "Add a photo of the closed door showing the gaps, and list any other small repairs. A5 coordinates a handyman.",
  },
  claimsToVerify: [CLAIM_NJ_CLIMATE],
});

const waterPooling = problemPage({
  problemSlug: "yard-surface-grading",
  primaryServiceId: "landscaping",
  relatedServiceIds: ["landscaping"],
  title: "Water pooling in the yard or against the house",
  metaTitle: "Water pooling in the yard or by the foundation: grading | A5",
  metaDescription:
    "Water that sits in the lawn or against the house after rain: common causes, what to photograph, and when surface grading fixes it versus a bigger drainage question.",
  primaryQuestion:
    "Why does water pool in my yard or against the house, and can grading fix it?",
  directAnswer:
    "Water usually pools because the ground slopes toward the house or into a low spot, because beds or soil have settled, or because downspouts empty right where the water collects. Surface grading — reshaping soil so it slopes away from the foundation — plus extending downspouts fixes many of these. Water coming up through a basement floor, or a yard that stays saturated for days in every season, may need a drainage approach beyond surface grading, which A5 does not offer through this service.",
  intro:
    "Water that sits against the foundation after every rain is worth fixing before it becomes a basement, masonry, or paver problem.",
  seeing: [
    "Puddles along the foundation after rain.",
    "A low area of lawn that stays soggy or bare.",
    "Soil or mulch that slopes toward the house.",
    "Downspouts that empty onto soil right next to the house.",
    "Water running across a walk or patio toward the house.",
  ],
  causes: [
    "Soil that has settled near the foundation, reversing the slope.",
    "Beds built up higher than the lawn or against the siding.",
    "Downspouts without extensions or splash blocks.",
    "Low spots in the lawn with nowhere for water to go.",
    "Compacted soil that does not absorb water well.",
  ],
  photograph: [
    "A photo during or right after rain, showing where water collects.",
    "A low-angle shot along the foundation showing the slope.",
    "Each downspout and where it discharges.",
    "The low spot in the lawn, with something for scale.",
    "Walks, patios, and beds near the problem area.",
  ],
  repairOrReplace: [
    "Regrading fits most surface pooling: soil is added and shaped to slope away from the foundation, and beds are lowered or reshaped where needed.",
    "Downspout extensions or splash blocks often go with regrading so roof water discharges away from the house.",
    "Reseeding or replanting finishes the regraded area.",
    "A drainage system — buried pipes, dry wells, or a sump — is a different project that A5 does not offer through landscaping. If water comes up through the basement floor or the yard stays wet in every season, say so.",
  ],
  whoYouNeed: [
    "A landscape professional for surface grading. A5 coordinates it under landscaping.",
    "If a sunken walk or patio is part of the water path, masonry can be coordinated as a related step.",
    "In New Jersey, digging generally starts with a call to 811 to mark underground utilities; the professional doing the work normally handles it.",
  ],
  costFactors: [
    "Length of foundation and area to regrade.",
    "Amount of soil brought in or moved.",
    "Access for equipment or wheelbarrows.",
    "Beds, plants, or walks that have to be removed and replaced.",
    "Downspout extensions and reseeding.",
  ],
  questions: [
    {
      question: "Will regrading stop water in my basement?",
      answer:
        "It helps when surface water is running toward the foundation. It does not address groundwater coming up through the floor, which is a different problem.",
    },
    {
      question: "Can I just add mulch?",
      answer:
        "Mulch sloped toward the house can make it worse. The soil underneath needs to slope away.",
    },
  ],
  related:
    "Sunken pavers, uneven stone patios, and seasonal yard cleanup are related, as are overgrown beds built up against the house.",
  relatedProblemSlugs: [
    "sunken-pavers",
    "uneven-stone-patio",
    "seasonal-yard-cleanup",
    "overgrown-planting-beds",
  ],
  cta: {
    title: "Get help with standing water",
    description:
      "Add a photo after rain, a low-angle shot along the foundation, and your downspouts. A5 coordinates a landscape professional.",
  },
  claimsToVerify: [CLAIM_NJ_811],
});

export const PROBLEM_PAGE_DRAFTS: readonly ProblemPageDraft[] = [
  brickSteps,
  looseMortar,
  sunkenPavers,
  activeLeak,
  runningToilet,
  waterDamagedCeiling,
  holeInWall,
  drywallCrack,
  lightingFailure,
  deadOutlet,
  crumblingGrout,
  peelingExteriorPaint,
  stickingDoor,
  waterPooling,
];
