import type {VendorStatus} from '../db/schema.ts';
/** Email is the delivery prerequisite for the owner-approved free-lead model. */
export function hasVendorEmail(email:string|null|undefined):boolean {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim()??'');
}
export function vendorContactState(email:string|null|undefined,status:VendorStatus,acceptingLeads:boolean){
 return hasVendorEmail(email)?{status,acceptingLeads:status==='ACTIVE'&&acceptingLeads}:{status:'INACTIVE' as VendorStatus,acceptingLeads:false};
}
