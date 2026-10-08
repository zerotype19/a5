import { getServiceBySlug } from '../../../config/services.ts';
import { getLocationBySlug } from '../../../config/locations.ts';
import {getCountyById} from '../../../config/counties.ts';
export function intakeContext(params: { service?: string; location?: string; problem?: string; county?:string }) {
 const service = params.service ? getServiceBySlug(params.service) : undefined;
 const location = params.location ? getLocationBySlug(params.location) : undefined;
 const problem = params.problem && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.problem) && params.problem.length <= 100 ? params.problem : undefined;
 const county=getCountyById(location?.countyId??params.county??'');
 return { service, location, problem, county };
}
export function requestHref(params: {service?:string|null;location?:string|null;problem?:string|null;county?:string|null} = {}) {
 const context = intakeContext({service:params.service??undefined,location:params.location??undefined,problem:params.problem??undefined,county:params.county??undefined});
 const q = new URLSearchParams();
 if(context.service) q.set('service',context.service.slug);
 if(context.location) q.set('location',context.location.slug);
 if(context.county && !context.location) q.set('county',context.county.id);
 if(context.problem && context.service) q.set('problem',context.problem);
 return `/request-service${q.size?'?'+q.toString():''}`;
}
