/**
 * Draft rewrites of the eight SERVICE hubs as distinct help centers.
 * DRAFT only — not wired to any route, seed, or sitemap.
 */

import {
  CLAIM_DEICING_SALT,
  CLAIM_EPA_RRP,
  CLAIM_MORTAR_COLD_WEATHER,
  CLAIM_NJ_811,
  CLAIM_NJ_CLIMATE,
  CLAIM_NJ_ELECTRICAL_LICENSE,
  CLAIM_NJ_PERMITS,
  CLAIM_NJ_PLUMBING_LICENSE,
} from "./claims.ts";
import type { ServiceHubDraft } from "./types.ts";

const handyman: ServiceHubDraft = {
  serviceId: "handyman",
  title: "Handyman repairs",
  metaTitle: "Handyman help for doors, trim, and small repairs | A5",
  metaDescription:
    "Is your repair list handyman work? What belongs on it, what to photograph, and what changes scope — for homes across Northern New Jersey.",
  h1: "Handyman repairs: building a list that gets done right",
  primaryQuestion: "What counts as a handyman job, and what doesn't?",
  directAnswer:
    "Handyman work is the small, mixed stuff: a door that sticks, trim pulling off the wall, a shelf or TV to mount, a worn hinge or handle, a short punch list. Anything that changes plumbing supply or drain lines, or adds or alters electrical wiring, is not handyman work — A5 routes those to the plumbing or electrical path so the right trade handles them.",
  sections: [
    {
      type: "INTRO",
      body: "Most handyman requests start as a note on the fridge: the bathroom door that won't latch, the baseboard the vacuum keeps catching, the curtain rod that never got hung. The useful move is to write the list down once, pull out anything that belongs to a licensed trade, and send the rest together. This page helps you do that.",
    },
    {
      type: "RICH_TEXT",
      heading: "What belongs on a handyman list",
      paragraphs: [
        "Doors and hardware: doors that rub, stick, swing on their own, or no longer latch; loose hinges; handles, locksets, and closers that are worn or wobbly.",
        "Trim and small carpentry: baseboard, casing, and shoe molding that is loose, split, or gapped; a shelf, casing return, or short run of trim that needs repair rather than a remodel.",
        "Mounting: televisions, shelves, mirrors, and curtain rods, where the real question is what the wall will hold and where the framing is.",
        "Punch-list items: the small finish repairs left after a bigger project, or a handful of minor fixes you would rather handle in one visit than five.",
      ],
    },
    {
      type: "COMPARISON_TABLE",
      optionALabel: "Fits a handyman list",
      optionBLabel: "Belongs with another trade",
      rows: [
        {
          criterion: "Lights and outlets",
          optionA: "Mounting a TV or shelf near an outlet without touching the wiring",
          optionB: "Replacing a fixture, switch, or outlet, or running a wire to a new TV location — electrical",
        },
        {
          criterion: "Faucets and toilets",
          optionA: "Tightening a loose towel bar or toilet seat",
          optionB: "Replacing a faucet, fixing a running toilet, or anything on a supply or drain line — plumbing",
        },
        {
          criterion: "Walls",
          optionA: "Filling a few nail holes; choosing the right anchor for drywall or plaster",
          optionB: "A hole larger than a hand, water-damaged board, or ceiling damage — drywall",
        },
        {
          criterion: "Tile",
          optionA: "Re-caulking a small gap where a tub meets the wall",
          optionB: "Cracked or loose tile, or grout washing out of a shower — tile",
        },
        {
          criterion: "Paint",
          optionA: "Touching up a small spot after a repair",
          optionB: "Repainting a room, trim throughout, or any exterior — painting",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "How to write the list so it is scoped correctly",
      paragraphs: [
        "Give each item one line: the room, the thing, and what it is doing. \"Upstairs hall bath door rubs at the top corner and won't latch\" tells a professional far more than \"fix door.\"",
        "Say what outcome you want. Re-secure the existing trim, or replace it? Mount the TV flat, or on an arm? The answer changes the parts and the time.",
        "Note anything you already have on hand — the new handle, the shelf brackets, leftover trim from the builder. Matching an existing trim profile is often the hardest part of a small carpentry repair.",
        "Leave uncertain items on the list and say you are unsure. A5 sorts them during review; you do not need to pick the trade first.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Fix it or replace it: doors, trim, and hardware",
      paragraphs: [
        "A sticking door is usually adjusted before anything is replaced: tightening or shimming hinges, planing an edge, or moving the strike plate. Replacement comes up when the door is split, badly warped, or the frame itself has moved.",
        "Loose trim is usually re-secured and caulked. Split or water-stained trim is replaced, and the question becomes whether the profile can be matched. Common profiles usually can; older or custom profiles may need a close substitute.",
        "Worn hardware is usually replaced rather than rebuilt. Tell A5 the finish you want matched and whether the door is a privacy, passage, or keyed door.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Photos that help a handyman list",
      paragraphs: [
        "One photo per item, taken from a few steps back so the location is clear. The request form takes up to five photos, so on a longer list, photograph the items you are least sure about.",
        "For a door, a shot of the gaps along the top and latch side with the door closed. Uneven gaps show which way it has moved.",
        "For trim, a close-up of the damaged section with something for scale, plus an undamaged piece so the profile can be matched.",
        "For mounting, the wall where the item will go and the item itself, including its weight or mounting instructions if you have them.",
      ],
    },
    {
      type: "COST_FACTORS",
      heading: "What makes a handyman visit bigger or smaller",
      factors: [
        "How many items are on the list, and whether they are in the same part of the house.",
        "Whether parts are on hand, need to be bought, or must match an existing finish or trim profile.",
        "Wall type behind a mounted item: drywall over studs, plaster over lath, masonry, or tile.",
        "Whether any item turns out to be plumbing, electrical, drywall, or tile once it is looked at.",
        "Access: ceiling height, furniture that has to move, or work above stairs.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Seasonal movement in northern New Jersey homes",
      paragraphs: [
        "Wood doors and trim move with the seasons. A door that sticks in August and swings freely in January is often seasonal swelling rather than a failing door.",
        "That affects the fix. If a door only sticks in summer, say so — the adjustment is different from a door that has sagged on its hinges year-round.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Typical handyman projects",
      paragraphs: [
        "Typical projects include rehanging an interior door that no longer latches, re-securing baseboard after a floor refinish, mounting a television on a stud wall, replacing a set of worn interior door handles, and working through a short punch list after a renovation.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Can a handyman replace a light fixture or a faucet?",
          answer:
            "Not through A5. Replacing a fixture, switch, outlet, faucet, or toilet is electrical or plumbing work, and A5 treats it that way. Put it on your request anyway; A5 routes it to the right trade.",
        },
        {
          question: "Is there a minimum number of items?",
          answer:
            "A single item is a valid request. A few items together are often easier to schedule than several separate requests.",
        },
        {
          question: "Do I need to buy the parts first?",
          answer:
            "No. If you already have them, say so. If not, describe what you want and the professional can confirm what to get.",
        },
        {
          question: "Can my existing trim be matched?",
          answer:
            "Common profiles usually can. Older or custom profiles sometimes cannot be matched exactly; the professional tells you what is available before anything is replaced.",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Related handyman problems",
      paragraphs: [
        "Problems that usually land on a handyman list: a sticking interior door, loose or damaged trim, worn door hardware, wall mounting, and punch-list repairs. Holes in drywall and paint after a patch often show up on the same list; those are drywall and painting.",
      ],
    },
    { type: "RELATED_CONTENT", heading: "Handyman help pages" },
    {
      type: "CTA",
      title: "Send A5 your list",
      description:
        "Put each item on its own line and add up to five photos. A5 sorts out what belongs together and what needs a licensed trade.",
    },
  ],
  typicalProjectVisuals: [
    "Typical projects: interior door with an uneven gap at the top latch-side corner (before) and even gaps after adjustment.",
    "Typical projects: a run of baseboard pulled away from the wall after flooring work.",
    "Typical projects: a television mounted flat on a living-room stud wall with no visible cords.",
  ],
  relatedProblemSlugs: [
    "sticking-interior-door",
    "loose-or-damaged-trim",
    "worn-door-hardware",
    "wall-mounting",
    "punch-list-repairs",
    "hole-in-drywall",
  ],
  claimsToVerify: [],
};

const masonry: ServiceHubDraft = {
  serviceId: "masonry",
  title: "Masonry repair",
  metaTitle: "Masonry repair: cracked steps, mortar, and pavers | A5",
  metaDescription:
    "Is it the brick, the mortar, or the ground underneath? How to read cracked steps, loose mortar, and sunken pavers, and when repair beats rebuilding — northern NJ.",
  h1: "Masonry repair: steps, walks, patios, and low walls",
  primaryQuestion:
    "Can cracked brick steps or loose mortar be repaired, or do they need rebuilding?",
  directAnswer:
    "Often they can be repaired. The deciding question is what failed: individual bricks or stones, the mortar joints between them, or the base underneath. Failed units and joints can usually be replaced or repointed. When the base has settled or washed out, the section usually has to come apart and be rebuilt on a sound base — patching the surface will not hold.",
  sections: [
    {
      type: "INTRO",
      body: "Masonry tells you a lot if you know where to look. A crack that runs straight through bricks means something different from one that follows the mortar lines, and a step that tips away from the house is a different problem from one that is crumbling at the edges. This page walks through how to read what you are seeing before anyone scopes a repair.",
    },
    {
      type: "RICH_TEXT",
      heading: "Start with what failed: the unit, the joint, or the base",
      paragraphs: [
        "The unit — the brick, block, paver, or stone itself. Look for spalling, where the face flakes or pops off, and cracks that cut through individual bricks. A few damaged units in a sound structure can often be cut out and replaced.",
        "The joint — the mortar between units. Look for mortar that is sandy, recessed, cracked, or missing. When joints fail but bricks are sound, repointing is the usual repair: old mortar is ground out to a set depth and new mortar is packed in.",
        "The base — whatever the masonry sits on. Steps that tilt or pull away from the house, pavers that rock or dip, and walls that lean all point to movement underneath. Surface repairs on a moving base tend to crack again.",
        "Most problems are a mix. Water in failed joints loosens units, and water under the base causes settling, so a good repair plan also deals with where the water comes from.",
      ],
    },
    {
      type: "COMPARISON_TABLE",
      optionALabel: "Repair in place",
      optionBLabel: "Take apart and rebuild",
      rows: [
        {
          criterion: "What you see",
          optionA: "Crumbling mortar, a few spalled or cracked bricks, minor chips",
          optionB: "Tilting or separating steps, rocking pavers across an area, a leaning wall",
        },
        {
          criterion: "What is still sound",
          optionA: "The base and most of the units",
          optionB: "Neither the base nor the layout can be trusted",
        },
        {
          criterion: "Typical work",
          optionA: "Repointing, replacing individual units, resetting a few pavers",
          optionB: "Removing the section, correcting the base, relaying or rebuilding",
        },
        {
          criterion: "Appearance",
          optionA: "New mortar and brick are blended in; color can differ at first",
          optionB: "Sound units may be reused; otherwise new material across the section",
        },
        {
          criterion: "Warning sign",
          optionA: "The same spot has been patched more than once",
          optionB: "Drainage that caused the movement has not been addressed",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Winter is the pattern in northern New Jersey",
      paragraphs: [
        "Madison, Chatham, Florham Park, Morristown, Morris Township, and East Hanover sit near the Canoe Brook weather station. Winters in this part of northern New Jersey regularly cross the freezing point. At that station, the 1991–2020 January normal is a high of 39.5°F and a low of 21.9°F. Water that gets into cracked mortar or porous brick expands when it freezes.",
        "On clay-paver walks, de-icing residue can penetrate the joints and result in staining and efflorescence. If you use a de-icer on a walk or on steps, mention it.",
        "Downspouts and grading matter as much as the masonry. A downspout that empties at the base of the front steps, or a walk that slopes toward the house, keeps feeding water to the same spot. Say where your downspouts discharge.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "When masonry is not the first call",
      paragraphs: [
        "A retaining wall that is leaning noticeably, bulging, or holding back a significant grade can be a structural question. A5 will not treat that as a repointing job; an engineer's assessment may be needed before anyone rebuilds it.",
        "Cracks in the house foundation are not the same as cracks in exterior steps or walks. Describe exactly where the crack is so A5 can tell the difference.",
        "If a step or walk is an immediate trip hazard, block it off or use another entrance until it is looked at.",
      ],
    },
    {
      type: "COST_FACTORS",
      heading: "What drives masonry repair scope",
      factors: [
        "Which layer failed: joints only, individual units, or the base underneath.",
        "How much is affected — a few joints, one step, or a whole run of walk or patio.",
        "Material: common brick and concrete pavers are easier to source than older brick or natural stone.",
        "Whether existing units can be cleaned and reused in a rebuild.",
        "Access for equipment and removal of old material, especially for rear patios and walls.",
        "Drainage corrections, such as extending a downspout, that keep the repair from failing again.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Photos that let a mason read the problem",
      paragraphs: [
        "A straight-on photo of the whole step, walk, or wall from about ten feet back, so the overall shape and any tilt are visible.",
        "A close-up of the worst crack or crumbling area with a coin or tape measure for scale.",
        "A side view along the steps or walk, taken low to the ground. It shows settling that straight-on photos hide.",
        "The spot where the masonry meets the house, including any gap.",
        "The nearest downspout and where it empties.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Typical masonry projects",
      paragraphs: [
        "Typical projects include repointing the mortar on a brick front stoop, replacing spalled bricks on a step riser, lifting and resetting a sunken section of paver walk, rebuilding brick steps that have pulled away from the house, and resetting loose stones on a low garden wall.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Will the new mortar match?",
          answer:
            "New mortar is usually lighter at first and weathers over time. A professional can adjust the mix toward the existing color, but A5 does not promise an exact match on day one.",
        },
        {
          question: "Should I seal my brick steps?",
          answer:
            "Sealers are debated for brick because some trap moisture. Ask the masonry professional whether one makes sense for your material after the repair, rather than sealing damaged masonry first.",
        },
        {
          question: "Can masonry repair happen in winter?",
          answer:
            "Mortar needs to cure above freezing, so exterior repairs are usually scheduled in milder weather. An unsafe step can still be looked at and made safer sooner.",
        },
        {
          question: "Can my old brick be matched?",
          answer:
            "Sometimes. Common sizes and colors are often available; older brick may need a reclaimed or close substitute. The professional confirms after seeing it.",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Related masonry problems",
      paragraphs: [
        "Crumbling or cracked brick steps, mortar falling out of joints, sunken pavers, damaged brick walkways, uneven stone patios, and shifting retaining walls are the masonry problems homeowners raise most. Water pooling where a walk meets the lawn is often a grading question that belongs with landscaping.",
      ],
    },
    { type: "RELATED_CONTENT", heading: "Masonry help pages" },
    {
      type: "CTA",
      title: "Show A5 what moved",
      description:
        "Describe where the steps, walk, patio, or wall is and what changed. Add up to five photos, including one from the side. A5 reviews it and coordinates a masonry professional.",
    },
  ],
  typicalProjectVisuals: [
    "Typical projects: brick front steps with recessed, sandy mortar joints on the treads.",
    "Typical projects: side view of a stoop whose top step has separated from the house foundation.",
    "Typical projects: a paver walk with a visible dip where water collects after rain.",
  ],
  relatedProblemSlugs: [
    "brick-step-repair",
    "loose-mortar",
    "sunken-pavers",
    "damaged-brick-walkway",
    "uneven-stone-patio",
    "shifting-retaining-wall",
  ],
  claimsToVerify: [
    CLAIM_NJ_CLIMATE,
    CLAIM_DEICING_SALT,
    CLAIM_MORTAR_COLD_WEATHER,
  ],
};

const landscaping: ServiceHubDraft = {
  serviceId: "landscaping",
  title: "Landscaping",
  metaTitle: "Landscaping: cleanup, planting beds, and yard grading | A5",
  metaDescription:
    "Cleanup, new beds, or water sitting in the yard? How to tell which landscape job you have, a northern NJ seasonal calendar, and what to photograph first.",
  h1: "Landscaping: cleanup, planting, and fixing where water sits",
  primaryQuestion:
    "Is this yard problem a cleanup, a planting project, or a grading issue?",
  directAnswer:
    "Most landscape requests are one of three jobs. Cleanup clears what is there — leaves, overgrowth, spent plants. Planting adds something new — edged beds, soil, and plants. Grading reshapes the surface so water runs away from the house instead of pooling. Naming the job is the fastest way to a clear scope. A5 does not design buried drainage systems through this service.",
  sections: [
    {
      type: "INTRO",
      body: "A yard rarely has one problem. The beds along the front walk have filled in, the back corner stays soggy after rain, and the fall leaves never quite got cleared. It helps to separate those into jobs, because each is scoped and timed differently.",
    },
    {
      type: "RICH_TEXT",
      heading: "Three jobs, three different conversations",
      paragraphs: [
        "Cleanup: removing leaves, debris, weeds, and overgrowth; cutting back perennials and shrubs; refreshing beds so the property is usable and tidy. The outcome is the same yard, cleaned up.",
        "Planting: edging new beds or reworking old ones, improving soil, and installing plants. The outcome is a changed yard, so it helps to know roughly what you want — or to say you would like suggestions.",
        "Surface grading: reshaping soil so rain moves away from the foundation or out of a low spot. This is surface work. Buried pipes, dry wells, and engineered drainage are outside what A5 offers here.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "A northern New Jersey yard calendar",
      paragraphs: [
        "Madison, Chatham, Florham Park, Morristown, Morris Township, and East Hanover sit near the Canoe Brook weather station. Winters in this part of northern New Jersey regularly cross the freezing point. At that station, the 1991–2020 January normal is a high of 39.5°F and a low of 21.9°F. The timing below follows that winter, then the growing season.",
        "Early spring: clearing winter debris and last year's growth, cutting back perennials, and checking beds and edges before growth starts. A good time to notice where water sat over the winter.",
        "Late spring into early summer: planting beds and filling gaps once the ground has warmed and dried enough to work.",
        "Summer: maintenance and watering matter more than big changes; new plantings need consistent water through hot, dry stretches.",
        "Fall: leaf cleanup, cutbacks, and a good window for many planting projects while the soil is still warm. In neighborhoods with mature trees, leaf drop is heavy, and beds left buried under leaves through winter tend to struggle in spring.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Water sitting in the yard or against the house",
      paragraphs: [
        "Water that pools against the foundation after rain is worth addressing before it becomes a basement or masonry problem. Common causes are soil that has settled toward the house, beds built up higher than the lawn, and downspouts emptying right at the foundation.",
        "Surface grading — building up and sloping soil so it falls away from the house — solves many of these. Extending a downspout onto a splash block or into the lawn often goes with it.",
        "If water comes up through the basement floor, the basement floods regularly, or the yard stays saturated for days in every season, the problem may be groundwater or a drainage-system question beyond surface grading. Say so in your request so A5 does not scope it as a regrade.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Keep, cut back, or replace",
      paragraphs: [
        "Overgrown shrubs can often be renewed by pruning over one or two seasons instead of being replaced. Shrubs that are dead in large sections, badly diseased, or simply too big for the spot are usually replaced.",
        "Beds that are more weed than plant are sometimes quicker to clear and replant than to rescue plant by plant. Tell A5 which plants you want kept.",
        "Lawn that stays bare where water pools is usually a grading problem first and a seeding problem second.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Before anyone digs",
      paragraphs: [
        "New Jersey requires notice to New Jersey One Call before excavation, except in an emergency. Member utilities are marked. Private lines such as irrigation, invisible pet fences, and landscape lighting are not marked unless that facility's owner participates. On planting and grading jobs, the professional doing the digging normally makes that request; it is fine to ask whether it has been done.",
        "Know where your irrigation lines, pet containment wire, and low-voltage landscape lighting run, if you have them. Private lines like these are not marked by the utility request.",
      ],
    },
    {
      type: "COST_FACTORS",
      heading: "What changes the size of a landscape job",
      factors: [
        "Which job it is — cleanup, planting, or grading — and whether the request combines them.",
        "Area and access: a front bed along the walk versus a back slope reached only through a gate.",
        "Volume of material going out (debris, old plants, sod) or coming in (soil, mulch, plants).",
        "Plant choices and sizes, if you are planting.",
        "For grading, how much soil has to move and whether downspout extensions are part of it.",
        "Timing: cleanup requests tend to cluster in spring and fall.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Photos that show the yard as it is",
      paragraphs: [
        "A wide shot of the whole area from the street or the back door, so the size of the job is clear.",
        "For beds, a closer shot of the worst section and any plants you want to keep.",
        "For water, a photo during or right after rain showing where it pools, plus the nearest downspout.",
        "A low-angle shot along the foundation showing whether soil slopes toward or away from the house.",
        "Anything in the way: fences, gates, steep slopes, or narrow side yards.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Can A5 install a French drain or dry well?",
          answer:
            "Not through this service. Surface grading is in scope; designing and installing buried drainage is not something A5 offers here.",
        },
        {
          question: "Do I need a landscape design first?",
          answer:
            "Not for cleanup or a straightforward bed. For a larger change, describe what you have in mind and say whether you want suggestions.",
        },
        {
          question: "Does this include weekly lawn mowing?",
          answer:
            "This page covers cleanup, planting, and grading projects. If you are looking for recurring lawn maintenance, say so in your request and A5 will tell you whether it fits.",
        },
        {
          question: "When is the right time to plant?",
          answer:
            "Spring and fall are the usual planting windows here, avoiding frozen ground and the hottest part of summer. The professional can advise for specific plants.",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Typical landscaping projects",
      paragraphs: [
        "Typical projects include a spring cleanup and cutback of overgrown foundation beds, clearing and replanting a bed that has filled with weeds, edging and planting a new bed along a front walk, fall leaf cleanup from beds and lawn, and regrading a strip along the foundation so rain drains away from the house.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Related yard problems",
      paragraphs: [
        "Overgrown planting beds, landscape cleanup, new planting beds, seasonal yard cleanup, and water pooling in the yard are the landscape problems homeowners raise most. Sunken pavers or a loose wall at the edge of a bed are masonry.",
      ],
    },
    { type: "RELATED_CONTENT", heading: "Landscaping help pages" },
    {
      type: "CTA",
      title: "Tell A5 which yard job this is",
      description:
        "Cleanup, planting, grading — or a mix. Add up to five photos, including a wide shot. A5 reviews the request and coordinates a landscape professional.",
    },
  ],
  typicalProjectVisuals: [
    "Typical projects: foundation beds overgrown with shrubs touching the siding, before a spring cutback.",
    "Typical projects: a newly edged and mulched bed along a front walk.",
    "Typical projects: a puddle along a foundation after rain, next to a downspout with no extension.",
  ],
  relatedProblemSlugs: [
    "overgrown-planting-beds",
    "landscape-cleanup",
    "new-planting-beds",
    "seasonal-yard-cleanup",
    "yard-surface-grading",
  ],
  claimsToVerify: [CLAIM_NJ_811, CLAIM_NJ_CLIMATE],
};

const painting: ServiceHubDraft = {
  serviceId: "painting",
  title: "Painting",
  metaTitle: "House painting: peeling paint, prep, and repainting | A5",
  metaDescription:
    "Why paint peels, blisters, or chalks, when a touch-up works and when a full repaint is needed, and what older-home prep involves — for northern NJ homeowners.",
  h1: "Painting: read the failure, then plan the prep",
  primaryQuestion:
    "Why is my paint failing, and does it need prep or just a new coat?",
  directAnswer:
    "If the old paint is sound and only faded or scuffed, a clean surface and a new coat is usually enough. If paint is peeling, blistering, cracking, or chalking, the cause has to be addressed and the failed paint removed first — otherwise the new coat fails the same way. On homes built before 1978, prep that disturbs old paint also has to account for possible lead.",
  sections: [
    {
      type: "INTRO",
      body: "A paint job is mostly preparation. Color is the part people think about, but whether the new coat lasts depends on what is underneath: moisture, loose layers, bare wood, or an unfinished repair. This page helps you read what your paint is doing so your request describes the real job.",
    },
    {
      type: "RICH_TEXT",
      heading: "What the failure is telling you",
      paragraphs: [
        "Peeling down to bare wood usually points to moisture getting behind the paint — from a gutter or roof-edge leak, missing caulk, or humidity from inside the house. The source matters as much as the scraping.",
        "Peeling between coats, where the top layer lifts off an older one, usually means the new paint did not bond — often from a dirty or glossy surface, or incompatible paint types.",
        "Blistering shows up as bubbles. Bubbles with water inside point to moisture; others can come from painting in direct hot sun.",
        "Chalking is a powdery residue that rubs off on your hand. It is normal aging of exterior paint, and the surface must be cleaned before recoating so new paint sticks.",
        "Crisscross cracking, sometimes called alligatoring, usually means many old layers have lost flexibility. Those layers generally have to come off.",
        "Mildew looks like dark spotting, often on shaded sides of the house. It has to be cleaned and treated; painting over it does not stop it.",
      ],
    },
    {
      type: "COMPARISON_TABLE",
      optionALabel: "Touch up and spot-prime",
      optionBLabel: "Full repaint of the surface",
      rows: [
        {
          criterion: "Condition",
          optionA: "A few small failed spots on otherwise sound paint",
          optionB: "Failure across a wall, a side of the house, or most of the trim",
        },
        {
          criterion: "Prep",
          optionA: "Scrape, sand, and prime the spots",
          optionB: "Wash, scrape, sand, repair, caulk, and prime the whole surface",
        },
        {
          criterion: "Appearance",
          optionA: "Touch-ups can show, especially on flat or faded paint",
          optionB: "Uniform color and sheen",
        },
        {
          criterion: "Makes sense when",
          optionA: "The paint is fairly recent and the color is still available",
          optionB: "The paint is old, faded, or failing in more than a few places",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Prep is most of the job",
      paragraphs: [
        "Interior prep usually means moving and covering furniture, filling nail holes and small cracks, sanding patched areas, cleaning greasy kitchen and bath surfaces, and priming stains or repairs so they do not show through.",
        "Exterior prep usually means washing, scraping loose paint, sanding edges, repairing or replacing rotted wood, caulking gaps, and priming bare wood. The amount of scraping is the biggest variable in an exterior job.",
        "Open drywall, a crack that keeps coming back, or a soft ceiling from an old leak is a drywall repair first. Painting over it does not fix it.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Older homes and lead paint",
      paragraphs: [
        "When someone is paid to disturb paint in a home built before 1978, federal rules generally require a certified firm and lead-safe work practices. Very small repairs, and surfaces shown to be lead-free, are outside that requirement.",
        "If your home was built before 1978, say so in your request. It affects how prep is done and who can do it. In the meantime, do not dry-sand or heat-strip old paint yourself.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Exterior painting season here",
      paragraphs: [
        "Exterior paint needs dry surfaces and temperatures above the minimum on the product label, including overnight. In Madison, Chatham, Florham Park, Morristown, Morris Township, and East Hanover that usually means late spring through early fall; cold nights and morning dew narrow the window at both ends.",
        "Interior work is not seasonal, which makes winter a practical time for rooms, ceilings, and trim.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Photos that show the surface, not just the room",
      paragraphs: [
        "A close-up of the worst failed area, sharp enough to show whether paint is peeling to bare wood or between layers.",
        "A wider shot showing how much of the wall, side, or trim is affected.",
        "For exteriors, one photo of each side of the house you want painted.",
        "Anything above the failure: gutters, roof edges, or a bathroom vent that might be adding moisture.",
        "The paint can label or color name, if you have it.",
      ],
    },
    {
      type: "COST_FACTORS",
      heading: "What drives a painting scope",
      factors: [
        "How much preparation the surface needs — a wash-and-coat versus heavy scraping.",
        "Surface area and number of colors, especially separate trim, door, and accent colors.",
        "Height and access: second-story exteriors, stairwells, and tall ceilings.",
        "Repairs discovered during prep, such as rotted trim or drywall damage.",
        "Lead-safe work practices on homes built before 1978.",
        "Whether moving and covering furniture is part of the job.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Can you paint over a water stain on the ceiling?",
          answer:
            "Only after the leak has stopped and the ceiling is dry and sound. A stain-blocking primer keeps the stain from bleeding through; it does not fix the leak.",
        },
        {
          question: "Will a touch-up match?",
          answer:
            "Touch-ups on older or faded paint often show, even with the same color. If matching matters, painting a full wall or a full piece of trim usually looks better than a spot.",
        },
        {
          question: "Can paint fix rotted wood?",
          answer:
            "No. Soft or rotted trim should be repaired or replaced before painting. The painter can point it out during prep.",
        },
        {
          question: "Do I need to pick colors first?",
          answer:
            "No. You can request the work and settle colors later. If you are matching existing paint, the color name or a chip helps.",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Typical painting projects",
      paragraphs: [
        "Typical projects include repainting a bedroom's walls and ceiling, scraping and repainting peeling exterior trim and window sills, repainting a porch ceiling, painting a wall after a drywall repair so the patch disappears, and repainting a stairwell.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Related paint problems",
      paragraphs: [
        "Peeling exterior paint, trim paint failure, worn interior paint, and painting after a drywall patch are the painting problems homeowners raise most. A water-damaged ceiling starts with the leak and the drywall; paint is the last step.",
      ],
    },
    { type: "RELATED_CONTENT", heading: "Painting help pages" },
    {
      type: "CTA",
      title: "Show A5 what the paint is doing",
      description:
        "Describe the rooms or sides of the house, add a close-up of the worst spot, and mention if your home was built before 1978.",
    },
  ],
  typicalProjectVisuals: [
    "Typical projects: close-up of exterior window trim with paint peeling to bare wood.",
    "Typical projects: interior wall with a drywall patch primed but not yet painted, then the finished wall.",
    "Typical projects: a porch ceiling with flaking paint before prep.",
  ],
  relatedProblemSlugs: [
    "peeling-exterior-paint",
    "trim-paint-failure",
    "worn-interior-paint",
    "paint-after-patching",
    "water-damaged-ceiling",
  ],
  claimsToVerify: [CLAIM_EPA_RRP],
};

const drywall: ServiceHubDraft = {
  serviceId: "drywall",
  title: "Drywall repair",
  metaTitle: "Drywall repair: holes, cracks, and ceiling damage | A5",
  metaDescription:
    "Patch or replace? How to size up a drywall hole, a returning crack, or a damaged ceiling, what to photograph, and what happens first when water is involved.",
  h1: "Drywall repair: size up the damage first",
  primaryQuestion:
    "Can this hole, crack, or ceiling damage be patched, or does the section need replacing?",
  directAnswer:
    "Small holes, dents, nail pops, and hairline cracks are patched. Holes bigger than a hand usually get a new piece of drywall fastened to backing and finished. Board that is soft, crumbling, moldy, or sagging — often from water — is cut out and replaced. In every case the leak or cause is stopped first, and the finished repair still needs paint to disappear.",
  sections: [
    {
      type: "INTRO",
      body: "Drywall damage usually looks worse than it is. A doorknob hole, a crack over a doorway, or a stain on the ceiling is almost always repairable. Size and cause decide how: a skim of compound, a new piece of board, or a larger section opened up to deal with what is behind it.",
    },
    {
      type: "RICH_TEXT",
      heading: "Four sizes of drywall damage",
      paragraphs: [
        "Surface marks: nail pops, dents, small dings, and hairline cracks. These are filled, sanded, and painted.",
        "Small holes: roughly doorknob-sized or smaller. These usually take a patch — mesh or a backer piece and several coats of compound.",
        "Large holes and torn sections: bigger than a hand, or where paper and gypsum are torn over an area. A new piece of drywall is cut in, fastened to framing or backing, taped, and finished.",
        "Ceilings: cracks along seams, sagging, or water damage. Ceiling work is overhead and harder to finish smoothly, and sagging or wet board is replaced rather than patched.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Water first, then board, then paint",
      paragraphs: [
        "If water caused the damage, order matters. First the source is found and stopped — a plumbing leak, a failed shower seal, a roof or gutter problem. Then wet material is dried or cut out. Then the drywall is repaired. Then it is primed and painted.",
        "A5 can coordinate plumbing, drywall, and painting as related steps. Roofing is outside A5's services; if water is coming from the roof, a roofer is needed before the ceiling is closed up.",
        "Board that stays soft, stained, or damp after a few days is a sign the leak is still active or the material needs to come out.",
      ],
    },
    {
      type: "COMPARISON_TABLE",
      optionALabel: "Patch",
      optionBLabel: "Replace a section",
      rows: [
        {
          criterion: "Board condition",
          optionA: "Solid around the damage",
          optionB: "Soft, crumbling, moldy, or sagging",
        },
        {
          criterion: "Size",
          optionA: "Up to roughly hand-sized",
          optionB: "Larger than a hand, or several holes close together",
        },
        {
          criterion: "Cause",
          optionA: "Impact, a nail pop, minor seasonal movement",
          optionB: "Water, repeated movement, or an old repair that failed",
        },
        {
          criterion: "Result",
          optionA: "Blended into the existing wall; needs paint",
          optionB: "New board taped and finished; needs primer and paint",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Drywall or plaster?",
      paragraphs: [
        "In Madison, Chatham, Florham Park, Morristown, Morris Township, and East Hanover, the first question is which material is on the wall. Plaster and drywall are repaired differently. Plaster often feels harder, sounds more solid when tapped, and can crack in long branching lines. The year a house was built does not by itself tell you which one is on the wall.",
        "Plaster repair uses different methods and materials from drywall. If you are not sure which you have, tap the wall and describe the sound, or photograph the edge of a hole where the material is visible.",
      ],
    },
    {
      type: "COST_FACTORS",
      heading: "What sets the size of a drywall repair",
      factors: [
        "Number and size of damaged areas, and whether they are in the same room.",
        "Walls versus ceilings — ceiling work is overhead and harder to finish.",
        "Water involvement, which can add drying, removal, and related plumbing or painting work.",
        "Texture: smooth walls blend more easily than textured walls or ceilings.",
        "Plaster rather than drywall.",
        "Whether the job includes painting, or stops at a primed, paint-ready surface.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Why does the same crack keep coming back?",
          answer:
            "Cracks at door and window corners or along ceiling seams often return when they are only filled. They usually need to be opened, re-taped, and refinished; seasonal movement in the framing is a common cause.",
        },
        {
          question: "Will I see the patch?",
          answer:
            "A finished patch should be flat and smooth, but it shows until it is primed and painted. Matching a textured wall is a separate skill, so mention texture in your request.",
        },
        {
          question: "Can drywall be repaired while the ceiling is still wet?",
          answer:
            "It should not be closed up wet. The leak is stopped and the area is dried or cut out first.",
        },
        {
          question: "What if I see mold?",
          answer:
            "Dark spotting or a musty smell on water-damaged drywall can mean mold. Mention it in your request. Removing wet, moldy board is part of the repair; larger mold problems may need a remediation specialist, which A5 does not provide.",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Photos that show size and cause",
      paragraphs: [
        "A close-up of the damage with a tape measure or common object next to it for scale.",
        "A wider shot of the wall or ceiling so the location and surrounding finish are visible.",
        "For a crack, a shot showing where it starts and ends — at a door or window corner, along a ceiling seam, or across open wall.",
        "For water damage, a photo of what is directly above: a bathroom, a pipe run, or the roofline.",
        "A low-angle shot across the wall with a light on, which shows texture and bulges.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Typical drywall projects",
      paragraphs: [
        "Typical projects include patching a doorknob hole behind a door, cutting in a new section where a TV mount was removed, re-taping a ceiling seam crack, replacing a stained and sagging ceiling section after the leak has been fixed, and finishing a patch someone started but never sanded.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Related wall and ceiling problems",
      paragraphs: [
        "Holes in drywall, cracks that keep returning, damaged ceiling drywall, water-damaged ceilings, and patches that were never finished are the drywall problems homeowners raise most. Paint after a patch is covered under painting; a leak above the ceiling is plumbing.",
      ],
    },
    { type: "RELATED_CONTENT", heading: "Drywall help pages" },
    {
      type: "CTA",
      title: "Show A5 the damage",
      description:
        "Add a close-up with something for scale and a wider shot of the room. If water was involved, say whether it is still dripping.",
    },
  ],
  typicalProjectVisuals: [
    "Typical projects: a round doorknob hole in drywall behind a door, with a tape measure for scale.",
    "Typical projects: a ceiling seam crack running across a bedroom ceiling.",
    "Typical projects: a stained ceiling section cut out and replaced, primed and ready for paint.",
  ],
  relatedProblemSlugs: [
    "hole-in-drywall",
    "drywall-crack",
    "ceiling-drywall-damage",
    "water-damaged-ceiling",
    "unfinished-drywall-repair",
  ],
  claimsToVerify: [],
};

const tile: ServiceHubDraft = {
  serviceId: "tile",
  title: "Tile repair",
  metaTitle: "Tile repair: cracked tile, loose backsplash, and grout | A5",
  metaDescription:
    "Can a few cracked tiles be replaced without redoing the floor? How matching, grout, and what's behind the tile decide a repair — and what to photograph first.",
  h1: "Tile repair: can it be matched, and is it dry behind?",
  primaryQuestion:
    "Can a few cracked tiles be replaced without redoing the whole floor or wall?",
  directAnswer:
    "Usually, if a matching tile can be found and the surface underneath is sound. Individual cracked tiles are cut out and replaced, and failing grout can be removed and regrouted. When the tile is discontinued with no spares, many tiles are loose, or the backing behind a shower wall is wet or soft, the conversation shifts to a larger repair of that area.",
  sections: [
    {
      type: "INTRO",
      body: "Tile repairs come down to two questions most homeowners do not think to ask: do you have — or can you find — matching tile, and is what's behind the tile still solid and dry? The answers decide whether this is a small repair or a larger one. A5 coordinates tile repair for homeowners in Madison, Chatham, Florham Park, Morristown, Morris Township, and East Hanover.",
    },
    {
      type: "RICH_TEXT",
      heading: "The matching question",
      paragraphs: [
        "Check the basement, garage, or attic for a leftover box. Builders and previous owners often leave spares, and a box with a label makes a repair much simpler.",
        "Without spares, a close match may be available for common sizes and colors. Older, handmade, or discontinued tile may have no match, and the choice becomes a visible substitute or a larger repair.",
        "A5 does not promise that discontinued tile can be matched. This service is ordinary residential tile repair, not specialty historic restoration.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Grout, tile, or what's behind it",
      paragraphs: [
        "Grout problems — cracking, crumbling, or washing out of joints — are the most common and least invasive. Failed grout can be ground out and replaced.",
        "Tile problems — a cracked or chipped tile, or one that sounds hollow when tapped — are handled tile by tile if the surface underneath is sound.",
        "Substrate problems — tiles cracking in a line, a floor that flexes, or a shower wall that feels soft — mean the surface under the tile has moved or gotten wet. New tile on a bad substrate cracks or loosens again.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Showers and wet areas get a different conversation",
      paragraphs: [
        "In a shower, tile is the finish, not the waterproofing. Cracked grout or tile can let water reach the backing. A shower wall that feels soft, tiles that move when pressed, or staining on the ceiling or wall on the other side can mean the backing is wet.",
        "A5 does not diagnose water damage behind tile from a photo. A tile professional checks the area; if a plumbing leak is involved, that is coordinated as plumbing.",
        "Until it is looked at, limiting use of a shower with open grout or cracked tile reduces how much water gets behind it.",
      ],
    },
    {
      type: "COMPARISON_TABLE",
      optionALabel: "Replace a few tiles",
      optionBLabel: "Redo the area",
      rows: [
        {
          criterion: "What you see",
          optionA: "One to a handful of cracked or loose tiles",
          optionB: "Many loose or hollow tiles, cracks running in lines, or a soft surface",
        },
        {
          criterion: "Matching",
          optionA: "Spares or a close match are available",
          optionB: "No match exists and a visible patch is not acceptable",
        },
        {
          criterion: "Underneath",
          optionA: "Solid and dry",
          optionB: "Flexing, wet, or damaged",
        },
        {
          criterion: "Wet areas",
          optionA: "Grout and tile only, with a sound waterproof layer behind",
          optionB: "Water getting behind the tile, so the backing has to be addressed",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Photos that help a tile repair",
      paragraphs: [
        "A close-up of the damaged tile or grout with a coin for scale.",
        "A wider shot of the whole floor, backsplash, or shower wall so the layout and pattern are clear.",
        "Any leftover tile box, especially the label.",
        "For showers, the ceiling or wall on the other side, even if it looks fine.",
        "Grout in good condition somewhere else in the room, for color matching.",
      ],
    },
    {
      type: "COST_FACTORS",
      heading: "What drives a tile repair",
      factors: [
        "Number of tiles, and whether they are scattered or together.",
        "Tile type and size: large-format tile, natural stone, and small mosaics take more care to remove without damaging neighbors.",
        "Whether a match is on hand, has to be sourced, or does not exist.",
        "Grout type and color matching.",
        "Condition of what's underneath, especially in wet areas.",
        "Fixtures, vanities, or appliances that sit on or against the tile.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Typical tile projects",
      paragraphs: [
        "Typical projects include replacing a few cracked floor tiles using spares from a basement box, resetting loose backsplash tiles behind a range, regrouting a shower where grout is washing out, and replacing a cracked bathroom floor tile next to the toilet.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Can you regrout without replacing tile?",
          answer:
            "Often, if the tiles are sound and well bonded. Old grout is removed and new grout packed in, in a color that matches or refreshes the look.",
        },
        {
          question: "Is regrouting the same as waterproofing?",
          answer:
            "No. Grout is not a waterproof layer. If water is already getting behind shower tile, the backing needs to be checked.",
        },
        {
          question: "Will new grout match the old?",
          answer:
            "Fresh grout often looks different from aged grout. Regrouting a whole wall or floor gives a uniform look; a small area may show.",
        },
        {
          question: "Do you restore antique or historic tile?",
          answer: "No. This service is ordinary residential tile repair.",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Related tile problems",
      paragraphs: [
        "Cracked floor tile, loose backsplash tile, crumbling grout, cracked shower tile, and small bathroom floor repairs are the tile problems homeowners raise most. A leak from a shower valve or supply line is plumbing.",
      ],
    },
    { type: "RELATED_CONTENT", heading: "Tile help pages" },
    {
      type: "CTA",
      title: "Show A5 the tile — and any spares",
      description:
        "Add a close-up, a wide shot, and a photo of any leftover tile box. A5 reviews it and coordinates a tile professional.",
    },
  ],
  typicalProjectVisuals: [
    "Typical projects: a single cracked ceramic floor tile in a kitchen, with a coin for scale.",
    "Typical projects: shower wall grout washed out of the lower joints near the tub.",
    "Typical projects: a basement shelf with a labeled box of spare tile.",
  ],
  relatedProblemSlugs: [
    "cracked-floor-tile",
    "loose-backsplash-tile",
    "crumbling-grout",
    "cracked-shower-tile",
    "bathroom-floor-tile-repair",
  ],
  claimsToVerify: [],
};

const plumbing: ServiceHubDraft = {
  serviceId: "plumbing",
  title: "Plumbing",
  metaTitle: "Plumbing help: leaks, running toilets, and fixtures | A5",
  metaDescription:
    "Is water moving right now? What to do first, how to tell a repair from a replacement, what to photograph, and who does plumbing work in New Jersey.",
  h1: "Plumbing: first stop the water, then plan the repair",
  primaryQuestion: "Is this plumbing problem urgent, and who should fix it?",
  directAnswer:
    "If water is actively escaping and you cannot stop it at the fixture valve, close the home's main shutoff and treat it as urgent — A5 does not offer emergency dispatch, so call an emergency plumber. A drip, a running toilet, a contained leak, or a planned fixture or water-heater replacement is a scheduled job that A5 can coordinate with a qualified plumbing professional.",
  sections: [
    {
      type: "INTRO",
      body: "Plumbing problems sort into two groups fast: water that is going somewhere it shouldn't right now, and everything else. This page starts with the first group, because what you do in the first few minutes matters more than anything else here.",
    },
    {
      type: "RICH_TEXT",
      heading: "First: is water moving right now?",
      paragraphs: [
        "Most sinks and toilets have a small shutoff valve on the supply line underneath or behind them. Turning it clockwise stops water to that fixture.",
        "If the leak is not at a fixture, or the valve will not close, use the main shutoff. It is usually where the water line enters the house, often in the basement near the water meter. Find it before you need it.",
        "If water has reached outlets, cords, or the electrical panel, do not touch them or stand in the water near them. Call an electrician or your utility.",
        "A5 does not offer emergency plumbing dispatch. If water is causing damage you cannot stop, call an emergency plumber. Once it is contained, A5 can coordinate the repair and any related drywall or painting.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Then: which kind of plumbing problem is it?",
      paragraphs: [
        "A drip or a run: a faucet that drips, or a toilet that refills on its own or runs constantly. Usually worn internal parts — cartridges, washers, flappers, fill valves.",
        "A visible leak: water at a pipe joint, valve, supply line, or drain under a sink. Once contained, the fitting or section is repaired or replaced on a scheduled visit.",
        "A replacement you have decided on: a new faucet, toilet, or similar fixture. This is a planned project, and knowing the model you want helps.",
        "A water heater that is old, leaking at the base, or not keeping up: evaluated and, if needed, replaced as a scheduled project rather than an urgent dispatch.",
      ],
    },
    {
      type: "COMPARISON_TABLE",
      optionALabel: "Repair it",
      optionBLabel: "Replace it",
      rows: [
        {
          criterion: "Faucets",
          optionA: "Drip from a worn cartridge or washer on a faucet you like",
          optionB: "Corroded body, parts no longer available, or you want a different style",
        },
        {
          criterion: "Toilets",
          optionA: "Running or weak flush from a flapper, fill valve, or handle",
          optionB: "Cracked tank or bowl, or leaking at the base after the seal is redone",
        },
        {
          criterion: "Supply lines",
          optionA: "A loose connection that can be tightened",
          optionB: "Old, bulging, or kinked lines, which are usually replaced",
        },
        {
          criterion: "Water heaters",
          optionA: "A failed part on a unit in otherwise good condition",
          optionB: "A leaking tank, or a unit near the end of its expected life",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "What a leak can involve besides the plumbing",
      paragraphs: [
        "Water rarely stays where the leak is. A drip under a bathroom sink can damage the vanity floor; a slow leak behind a wall can stain the ceiling below.",
        "A5 can keep plumbing, drywall, tile, and painting connected as related steps: fix the leak, let things dry, repair the wall or ceiling, then paint. The plumbing repair always comes first.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Who does plumbing work",
      paragraphs: [
        "Plumbing contracting is a licensed trade in New Jersey. It is reasonable to ask for the plumber's license before work starts. A5 coordinates qualified plumbing professionals; A5 office staff do not perform plumbing work.",
        "Replacing a water heater with one of like capacity is minor work under New Jersey's Uniform Construction Code, and minor work still requires a permit. Ask whether your job is in that category; the town construction office applies the code.",
        "A5 coordinates plumbing projects for homes in Madison, Chatham, Florham Park, Morristown, Morris Township, and East Hanover. If you know whether your home is on public water or a private well, include it.",
      ],
    },
    {
      type: "COST_FACTORS",
      heading: "What drives a plumbing job",
      factors: [
        "Repair of internal parts versus replacement of the fixture or pipe section.",
        "Access: an exposed pipe under a sink versus one inside a wall, ceiling, or finished basement.",
        "Age and material of the existing pipes and valves, which affects whether a small repair stays small.",
        "For replacements, the fixture you choose and whether it fits the existing connections.",
        "Permits and inspections, where they apply.",
        "Related repairs after a leak: drywall, flooring, tile, or paint.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Photos a plumber can use",
      paragraphs: [
        "The leak or fixture itself, close enough to see where the water is coming from.",
        "The shutoff valve and supply line under or behind the fixture.",
        "The area around it, including any damage to the cabinet, floor, or ceiling below.",
        "For a water heater or fixture, the manufacturer label with model and date information.",
        "For a replacement, a screenshot of the fixture you want.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Is A5 an emergency plumber?",
          answer:
            "No. A5 does not offer emergency dispatch. Stop the water if you can do so safely, and call an emergency plumber for active damage.",
        },
        {
          question: "Can a handyman fix my faucet?",
          answer:
            "Not through A5. Faucets, toilets, supply lines, and drains are plumbing, and A5 routes them to a qualified plumbing professional.",
        },
        {
          question: "How do I know if my water heater needs replacing?",
          answer:
            "Water at the base of the tank, rusty hot water, or a unit that no longer keeps up are common signs, and the label shows its age. A plumbing professional can say whether a repair makes sense.",
        },
        {
          question: "Will my walls need to be opened?",
          answer:
            "Only if the leak is inside a wall or ceiling and needs access. The plumber explains what access is needed, and the drywall repair afterward can be coordinated.",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Typical plumbing projects",
      paragraphs: [
        "Typical projects include repairing a dripping kitchen faucet, fixing a toilet that runs between flushes, replacing a leaking supply line under a bathroom sink, swapping an old toilet for a new one, and replacing an aging water heater as a planned project.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Related water and fixture problems",
      paragraphs: [
        "Dripping faucets, running toilets, visible pipe leaks, fixture replacements, and water heater projects are the plumbing problems homeowners raise most. A stained or sagging ceiling below a bathroom is usually a leak first, then drywall and paint.",
      ],
    },
    { type: "RELATED_CONTENT", heading: "Plumbing help pages" },
    {
      type: "CTA",
      title: "Tell A5 what the water is doing",
      description:
        "Say whether it is still leaking, where it is, and what is below it. Add up to five photos, including the fixture label if you can see it.",
    },
  ],
  typicalProjectVisuals: [
    "Typical projects: the open cabinet under a bathroom sink showing shutoff valves and braided supply lines.",
    "Typical projects: inside a toilet tank with the lid off, showing the flapper and fill valve.",
    "Typical projects: the manufacturer label on a basement water heater.",
  ],
  relatedProblemSlugs: [
    "dripping-faucet",
    "running-toilet",
    "visible-pipe-leak",
    "fixture-replacement",
    "water-heater-replacement-project",
    "water-damaged-ceiling",
  ],
  claimsToVerify: [CLAIM_NJ_PLUMBING_LICENSE, CLAIM_NJ_PERMITS],
};

const electrical: ServiceHubDraft = {
  serviceId: "electrical",
  title: "Electrical",
  metaTitle: "Electrical help: lights, outlets, switches, and fans | A5",
  metaDescription:
    "Is it one device or the whole circuit? Safety stop signs, what you can check without opening anything, what to photograph, and who does electrical work in NJ.",
  h1: "Electrical: know when to stop, then describe the device",
  primaryQuestion:
    "Is this electrical problem safe to wait on, and who should fix it?",
  directAnswer:
    "A single dead light, outlet, or switch with no other symptoms can usually wait for a scheduled visit from a qualified electrical professional, which A5 can coordinate. Burning smells, scorch marks, sparking, buzzing, hot outlets or plates, or a breaker that trips again right after reset are not wait-and-see problems: turn off power at the breaker if you can do it safely and get immediate help. A5 does not offer emergency electrical dispatch.",
  sections: [
    {
      type: "INTRO",
      body: "Electrical requests start with a device that stopped doing its job: a light that won't come on, a dead outlet, a switch that feels wrong, a fan you want installed. The first job is making sure it is safe to wait. The second is describing it clearly without taking anything apart.",
    },
    {
      type: "RICH_TEXT",
      heading: "Stop signs: do not wait for a scheduled visit",
      paragraphs: [
        "A burning or hot-plastic smell near an outlet, switch, fixture, or the panel.",
        "Scorch marks, melted plastic, or discoloration on a cover plate or plug.",
        "Sparking, crackling, or buzzing from a device or the panel.",
        "An outlet, switch, or cover plate that is hot to the touch.",
        "A breaker that trips again immediately after it is reset.",
        "If you see any of these, turn off the breaker for that area if you can reach it safely. If there is smoke or fire, leave the house and call 911.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "One device or a whole circuit? What you can check safely",
      paragraphs: [
        "Check the breaker panel for a tripped breaker — one sitting in the middle or off position. Resetting it once is fine. If it trips again, leave it off.",
        "Look for GFCI outlets, the ones with test and reset buttons, in kitchens, bathrooms, garages, basements, and outdoors. One tripped GFCI can cut power to other outlets downstream, sometimes in another room. Press reset firmly.",
        "For a light, try a new bulb of the correct type and wattage before assuming the fixture failed.",
        "Note what else is off. If several outlets and lights in one area are dead, it is a circuit question, not a device question.",
        "Do not remove cover plates, pull devices out of boxes, or take off the panel's inner cover. Describing what you see is enough.",
      ],
    },
    {
      type: "COMPARISON_TABLE",
      optionALabel: "Replace the device",
      optionBLabel: "Look further",
      rows: [
        {
          criterion: "Light fixture",
          optionA: "Fails or flickers with a good bulb, and nothing else is affected",
          optionB: "Several lights flicker or dim together, or bulbs burn out unusually fast",
        },
        {
          criterion: "Outlet",
          optionA: "Loose, cracked, or worn, and no longer grips a plug",
          optionB: "Still dead after breakers and GFCIs are checked, or several are out",
        },
        {
          criterion: "Switch",
          optionA: "Cracked, loose, or feels mushy",
          optionB: "Warm, buzzing, or the light still misbehaves after replacement",
        },
        {
          criterion: "Breaker",
          optionA: "One trip with an obvious overload, like two heaters on one circuit",
          optionB: "Trips repeatedly without an obvious cause",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Fans and heavier fixtures",
      paragraphs: [
        "A ceiling fan or heavy light needs an electrical box rated to carry it and secured to framing. Many boxes installed for an ordinary light are not fan-rated.",
        "If you are replacing a light with a fan, or adding a fixture where there was none, say so. The professional confirms the box, support, and wiring before anything is promised.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Older wiring",
      paragraphs: [
        "Two-prong outlets, cloth-covered wiring, or a fuse box instead of breakers are signs of older wiring. They are not an emergency by themselves, but they change what a simple device replacement involves.",
        "If you know or suspect your home has older wiring, include it in your request so the professional can plan the visit.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Who does electrical work",
      paragraphs: [
        "Electrical contracting is a licensed trade in New Jersey. It is reasonable to ask for the contractor's license and business permit. A new electrical circuit is not ordinary maintenance, so ask whether your job needs a construction permit. The town construction office applies the code.",
        "A5 coordinates qualified electrical professionals for homes in Madison, Chatham, Florham Park, Morristown, Morris Township, and East Hanover. A5 office staff do not perform electrical work, and handyman visits through A5 do not include wiring.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Photos to take without opening anything",
      paragraphs: [
        "The device or fixture with its cover plate on, from a few feet away.",
        "Your breaker panel with the door open and the labels readable — the door only, not the inner cover.",
        "Any GFCI outlets nearby, showing whether the reset button has popped out.",
        "For a fan or new fixture, the ceiling where it will go and the product you want.",
        "Anything discolored or damaged, photographed from a safe distance.",
      ],
    },
    {
      type: "COST_FACTORS",
      heading: "What drives an electrical job",
      factors: [
        "A like-for-like device swap versus a new location, new circuit, or added fixture.",
        "The fixture or fan you choose, and whether the existing box can support it.",
        "Ceiling height and access, including attic access above a ceiling.",
        "Age and type of the existing wiring.",
        "Troubleshooting time when the cause is not obvious, such as an intermittent outlet.",
        "Permits and inspections, where they apply.",
      ],
    },
    {
      type: "QUESTION_ANSWER",
      items: [
        {
          question: "Is A5 an emergency electrician?",
          answer:
            "No. For burning smells, sparking, or heat, turn off the breaker if you safely can, and call 911 if there is smoke or fire.",
        },
        {
          question: "Why is one outlet dead when the breaker is on?",
          answer:
            "A tripped GFCI elsewhere on the circuit is a common cause, as is a loose connection. Check GFCIs first; if that does not fix it, it needs a professional.",
        },
        {
          question: "Can any ceiling box hold a fan?",
          answer:
            "No. The box has to be rated for a fan and secured to framing. The professional confirms before installing.",
        },
        {
          question: "Should I replace an outlet myself?",
          answer:
            "A5 does not advise homeowners on doing their own electrical work. If you want it done through A5, a qualified electrical professional handles it.",
        },
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Typical electrical projects",
      paragraphs: [
        "Typical projects include replacing a porch light that fails even with a new bulb, replacing a cracked or loose outlet, swapping a worn switch, installing a ceiling fan on a properly supported box, and updating the light fixtures in a room.",
      ],
    },
    {
      type: "RICH_TEXT",
      heading: "Related lighting and power problems",
      paragraphs: [
        "Failed light fixtures, dead outlets, faulty switches, ceiling fan projects, lighting updates, and recurring electrical issues are the electrical problems homeowners raise most. Mounting a TV or shelf without touching wiring is handyman work.",
      ],
    },
    { type: "RELATED_CONTENT", heading: "Electrical help pages" },
    {
      type: "CTA",
      title: "Describe the device, not the wiring",
      description:
        "Tell A5 what is not working and what you have already checked, and add up to five photos taken with covers on.",
    },
  ],
  typicalProjectVisuals: [
    "Typical projects: a breaker panel with the door open and hand-written circuit labels visible.",
    "Typical projects: a GFCI outlet in a bathroom with the reset button popped out.",
    "Typical projects: a ceiling fan installed in a bedroom where a light fixture used to be.",
  ],
  relatedProblemSlugs: [
    "failed-light-fixture",
    "dead-outlet",
    "faulty-switch",
    "ceiling-fan-project",
    "lighting-update",
    "recurring-electrical-issue",
  ],
  claimsToVerify: [CLAIM_NJ_ELECTRICAL_LICENSE, CLAIM_NJ_PERMITS],
};

export const SERVICE_HUB_DRAFTS: readonly ServiceHubDraft[] = [
  handyman,
  masonry,
  landscaping,
  painting,
  drywall,
  tile,
  plumbing,
  electrical,
];
