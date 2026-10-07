import { getServiceBySlug } from '../../../config/services.ts';
import { getLocationBySlug } from '../../../config/locations.ts';
export function intakeContext(params: { service?: string; location?: string; problem?: string }) {
 const service = params.service ? getServiceBySlug(params.service) : undefined;
 const location = params.location ? getLocationBySlug(params.location) : undefined;
 const problem = params.problem && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.problem) && params.problem.length <= 100 ? params.problem : undefined;
 return { service, location, problem };
}
export function requestHref(params: {service?:string|null;location?:string|null;problem?:string|null} = {}) {
 const context = intakeContext({service:params.service??undefined,location:params.location??undefined,problem:params.problem??undefined});
 const q = new URLSearchParams();
 if(context.service) q.set('service',context.service.slug);
 if(context.location) q.set('location',context.location.slug);
 if(context.problem && context.service) q.set('problem',context.problem);
 return `/request-service${q.size?'?'+q.toString():''}`;
}
