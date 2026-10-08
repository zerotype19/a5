/** North Jersey request geography. Registry membership does not confirm provider coverage. */
import {LOCATION_RECORDS} from './municipalities.ts';
import type {CountyId} from './counties.ts';
export type LocationId = typeof LOCATION_RECORDS[number]['id'];
export type Location = {id:LocationId;name:string;slug:string;state:'NJ';countyId:CountyId;requestReviewRequired?:boolean;hubSlug?:string;legacyArea?:boolean};
export const LOCATIONS:readonly Location[]=LOCATION_RECORDS;
export const MUNICIPALITIES=LOCATIONS.filter(l=>!l.legacyArea);
/** Stable, authored town hubs from the first two releases; not every request municipality has an article. */
export const LOCATION_HUBS=LOCATIONS.filter(l=>l.hubSlug===l.slug);
export function getLocationById(id:LocationId):Location|undefined{return LOCATIONS.find(l=>l.id===id);}
export function getLocationBySlug(slug:string):Location|undefined{return LOCATIONS.find(l=>l.slug===slug);}
export function locationSearchText(location:Location){return `${location.name} ${location.countyId}`.toLowerCase().replace(/[^a-z0-9]/g,'');}
export function matchesLocationSearch(location:Location,query:string){return locationSearchText(location).includes(query.toLowerCase().replace(/[^a-z0-9]/g,''));}
