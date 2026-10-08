/** Owner-authorized North Jersey browse geography; county hubs are CORE records. */
export const COUNTIES = [
  {
    "id": "bergen",
    "name": "Bergen County",
    "slug": "bergen-county",
    "municipalityCount": 70,
    "sourceUrl": "https://bergencountynj.gov/municipalities/"
  },
  {
    "id": "essex",
    "name": "Essex County",
    "slug": "essex-county",
    "municipalityCount": 22,
    "sourceUrl": "https://essexcountynj.org/wp-content/uploads/2020/05/2020-2024-Five-Year-Plan-Draft-May-21.pdf"
  },
  {
    "id": "hudson",
    "name": "Hudson County",
    "slug": "hudson-county",
    "municipalityCount": 12,
    "sourceUrl": "https://hudsoncountyculturalaffairs.org/municipalities/"
  },
  {
    "id": "morris",
    "name": "Morris County",
    "slug": "morris-county",
    "municipalityCount": 39,
    "sourceUrl": "https://www.morriscountynj.gov/Residents/Community-Information/Cities-and-Towns"
  },
  {
    "id": "passaic",
    "name": "Passaic County",
    "slug": "passaic-county",
    "municipalityCount": 16,
    "sourceUrl": "https://www.passaiccountynj.org/home/showpublisheddocument/6594/638759880958430000"
  },
  {
    "id": "sussex",
    "name": "Sussex County",
    "slug": "sussex-county",
    "municipalityCount": 24,
    "sourceUrl": "https://www.sussex.nj.us/275/Participating-Jurisdictions"
  },
  {
    "id": "union",
    "name": "Union County",
    "slug": "union-county",
    "municipalityCount": 21,
    "sourceUrl": "https://ucnj.org/municipalities/"
  },
  {
    "id": "warren",
    "name": "Warren County",
    "slug": "warren-county",
    "municipalityCount": 22,
    "sourceUrl": "https://www.warrencountynj.gov/our-county/municipalities"
  }
] as const;
export type CountyId=typeof COUNTIES[number]['id'];
export type County=typeof COUNTIES[number];
export function getCountyById(id:string){return COUNTIES.find(c=>c.id===id);}
export function getCountyBySlug(slug:string){return COUNTIES.find(c=>c.slug===slug);}
export function countyPath(county:County){return `/home-services/county/${county.slug}`;}
