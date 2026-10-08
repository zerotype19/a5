import { SERVICES } from '../../../config/services.ts';
import { MUNICIPALITIES } from '../../../config/locations.ts';
import { hasVendorEmail } from '../admin/vendor-contact.ts';
import { isValidUsPhone } from '../../components/intake/validation.ts';

export type SignupData = {
  businessName: string; contactName: string; email: string; phone: string;
  website: string; serviceIds: string[]; locationIds: string[]; notes: string; consent: true;
};
export type SignupErrors = Record<string, string>;
export const SIGNUP_CONSENT_VERSION = '2026-10-08';
export const SIGNUP_CONSENT = 'I am authorized to represent this business and agree that A5 may email us about our signup and forward relevant homeowner project requests. I understand that leads are currently free and no volume of work is guaranteed.';
export function validateSignup(input: unknown): {ok:true; data:SignupData} | {ok:false; errors:SignupErrors} {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {ok:false, errors:{form:'Enter your business information.'}};
  const raw=input as Record<string,unknown>, errors:SignupErrors={};
  const text=(key:string,max:number,required=false)=>{
    const value=typeof raw[key]==='string'?raw[key].trim():'';
    if ((required&&!value)||value.length>max||(raw[key]!=null&&typeof raw[key]!=='string')) errors[key]=`Enter ${key==='businessName'?'a business name':key==='contactName'?'a contact name':key} (${max} characters or fewer).`;
    return value;
  };
  const businessName=text('businessName',160,true), contactName=text('contactName',160,true);
  const email=text('email',200,true).toLowerCase(), phone=text('phone',32), notes=text('notes',2000);
  let website=text('website',300);
  if(!hasVendorEmail(email)) errors.email='Enter the business email that should receive project requests.';
  if(phone&&!isValidUsPhone(phone)) errors.phone='Enter a valid US phone number or leave it blank.';
  if(website){
    if(!/^[a-z][a-z\d+.-]*:/i.test(website)) website=`https://${website}`;
    try {const url=new URL(website); if(!['http:','https:'].includes(url.protocol)||!url.hostname.includes('.')||url.username||url.password||website.length>300) throw Error();}
    catch {errors.website='Enter a valid business website, such as example.com.';}
  }
  const ids=(key:string,allowed:readonly {id:string}[])=>{
    const value=raw[key];
    if(!Array.isArray(value)||!value.length||value.length>allowed.length||value.some(id=>typeof id!=='string'||!allowed.some(item=>item.id===id))){errors[key]=key==='serviceIds'?'Choose at least one listed service.':'Choose at least one listed town.';return [];}
    return [...new Set(value as string[])].sort();
  };
  const serviceIds=ids('serviceIds',SERVICES),locationIds=ids('locationIds',MUNICIPALITIES);
  if(raw.consent!==true) errors.consent='Please confirm that A5 may contact your business about project requests.';
  return Object.keys(errors).length?{ok:false,errors}:{ok:true,data:{businessName,contactName,email,phone,website,serviceIds,locationIds,notes,consent:true}};
}

/** County actions affect only that county; no hidden expansion when registries change. */
export function setCountyCoverage(selected:string[],countyId:string,include:boolean):string[]{
  const ids=MUNICIPALITIES.filter(t=>t.countyId===countyId).map(t=>t.id);
  return include?[...new Set([...selected,...ids])]:selected.filter(id=>!ids.includes(id as typeof ids[number]));
}
