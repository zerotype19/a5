import type { ClaimToVerify } from "./types.ts";

export const CLAIM_NJ_CLIMATE: ClaimToVerify = {
  claim:
    "Winters in this part of northern New Jersey regularly cross the freezing point. At Canoe Brook, the long-record station nearest these towns, the 1991–2020 January normal is a high of 39.5°F and a low of 21.9°F.",
  sourceTitle:
    "NOAA National Centers for Environmental Information, 1991–2020 U.S. Climate Normals, station CANOE BROOK, NJ US (USC00281335)",
  sourceUrl:
    "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USC00281335&dataTypes=MLY-TMAX-NORMAL,MLY-TMIN-NORMAL&format=json",
  exactSupportedClaim:
    "Station USC00281335, CANOE BROOK, NJ US: January 1991–2020 normal maximum temperature 39.5°F and normal minimum 21.9°F. July normals are a maximum of 86.3°F and a minimum of 65.6°F. These are one station's normals, not a separate measurement for each service-area town, and they do not state summer humidity or indoor dryness.",
};

export const CLAIM_DEICING_SALT: ClaimToVerify = {
  claim:
    "On clay-paver walks, de-icing residue can penetrate the joints and result in staining and efflorescence.",
  sourceTitle:
    "Brick Industry Association Technical Note 14B, Paving Systems Using Clay Pavers on a Bituminous Setting Bed",
  sourceUrl:
    "https://www.gobrick.com/media/file/14b-paving-systems-using-clay-pavers-on-a-bituminous-setting-bed.pdf",
  exactSupportedClaim:
    "Deicing agents should be used with care, as chemical residue left on the surface can penetrate into the joints and result in staining and efflorescence.",
};

export const CLAIM_MORTAR_COLD_WEATHER: ClaimToVerify = {
  claim:
    "Mortar should not freeze while it is being placed, and newly finished masonry has to be protected from freezing.",
  sourceTitle:
    "Brick Industry Association Technical Note 1, Hot and Cold Weather Construction",
  sourceUrl: "https://www.gobrick.com/media/file/1-tn1.pdf",
  exactSupportedClaim:
    "Avoid freezing of mortar during construction, and protect mortar in newly completed masonry from freezing.",
};

export const CLAIM_NJ_PLUMBING_LICENSE: ClaimToVerify = {
  claim:
    "Plumbing contracting is a licensed trade in New Jersey. It is reasonable to ask for the plumber's license before work starts.",
  sourceTitle:
    "N.J.S.A. 45:14C-12.3, as summarized by the State Board of Examiners of Master Plumbers",
  sourceUrl: "https://www.njconsumeraffairs.gov/plu/Pages/FAQ.aspx",
  exactSupportedClaim:
    "The Board's FAQ states that N.J.S.A. 45:14C and N.J.A.C. 13:32-3.3(a)3 provide that plumbing shall only be performed by a master plumber, an authorized plumbing contractor, or by employees whose remuneration is reported on a Form W-2. N.J.S.A. 45:14C-12.3 separately prohibits working as a master plumber without a license and engaging in plumbing contracting without authorization. The rules also list limited tasks that are not reserved to licensed plumbers.",
};

export const CLAIM_NJ_ELECTRICAL_LICENSE: ClaimToVerify = {
  claim:
    "Electrical contracting is a licensed trade in New Jersey. It is reasonable to ask for the contractor's license and business permit.",
  sourceTitle:
    "N.J.S.A. 45:5A-9, Electrical Contractors Licensing Act, and the Board of Examiners of Electrical Contractors",
  sourceUrl: "https://law.justia.com/codes/new-jersey/title-45/section-45-5a-9/",
  exactSupportedClaim:
    "N.J.S.A. 45:5A-9: no person shall advertise, enter into, engage in or work in business as an electrical contractor unless that person has secured a business permit and an electrical contractor's license from the Board, and the licensee assumes responsibility for inspection and supervision of the electrical work.",
};

export const CLAIM_NJ_PERMITS: ClaimToVerify = {
  claim:
    "Replacing a water heater with one of like capacity is minor work under New Jersey's Uniform Construction Code, and minor work still requires a permit. A new electrical circuit is not ordinary maintenance.",
  sourceTitle:
    "N.J.A.C. 5:23-2.7, 5:23-2.14, and 5:23-2.17A, New Jersey Uniform Construction Code",
  sourceUrl: "https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_2.pdf",
  exactSupportedClaim:
    "N.J.A.C. 5:23-2.14 makes it unlawful to install or alter regulated equipment without a construction permit, except ordinary maintenance. N.J.A.C. 5:23-2.14 also says minor work as defined in N.J.A.C. 5:23-2.17A still requires a permit. N.J.A.C. 5:23-2.17A includes, as minor work, replacement of existing water heaters with new ones of like capacity. Ordinary electrical maintenance in N.J.A.C. 5:23-2.7 is a closed list of like-for-like replacements and a few named installations; a new circuit is not on that list.",
};

export const CLAIM_NJ_811: ClaimToVerify = {
  claim:
    "New Jersey requires notice to New Jersey One Call before excavation, except in an emergency. Member utilities are marked. Private lines such as irrigation, invisible pet fences, and landscape lighting are not marked unless that facility's owner participates.",
  sourceTitle:
    "N.J.A.C. 14:2-3.1 and New Jersey One Call, Private Facilities",
  sourceUrl: "https://www.nj1-call.org/training-safety/private-facilities/",
  exactSupportedClaim:
    "N.J.A.C. 14:2-3.1: a person shall not excavate or demolish unless notice has been given to the One-Call center by dialing 811, not less than three business days and not more than 10 business days before the work, except for an emergency under N.J.A.C. 14:2-3.6. New Jersey One Call states that unless the private-facility owner participates as a member, owners of private facilities are not notified and will not mark. Its examples include invisible dog fences and low-voltage landscape lighting.",
};

export const CLAIM_EPA_RRP: ClaimToVerify = {
  claim:
    "When someone is paid to disturb paint in a home built before 1978, federal rules generally require a certified firm and lead-safe work practices. Very small repairs, and surfaces shown to be lead-free, are outside that requirement.",
  sourceTitle:
    "40 CFR Part 745 Subpart E, and the U.S. EPA Lead Renovation, Repair and Painting Program",
  sourceUrl:
    "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-R/part-745/subpart-E",
  exactSupportedClaim:
    "40 CFR 745.81 and 745.89: on or after April 22, 2010, no firm may perform renovations for compensation in target housing or child-occupied facilities without EPA certification, unless an exception in 40 CFR 745.82 applies. EPA's program page describes the covered housing as homes, childcare facilities, and preschools built before 1978. 40 CFR 745.83 and 745.82 exclude minor repair and maintenance that disturbs 6 square feet or less per interior room or 20 square feet or less outside, with stated limits, and exclude components determined to be lead-free.",
};
