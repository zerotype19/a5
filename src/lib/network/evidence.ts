import {latestReports,connectionState,type NetworkReport} from './policy.ts';
export type NetworkAssignment={id:string;lead_id:string;vendor_id:string;vendor_name?:string;status:string;assigned_at:string;accepted_at:string|null;notification_status:string|null;notification_sent_at:string|null;acceptance_due_at:string|null};
export function vendorEvidence(vendorId:string,assignments:NetworkAssignment[],reports:NetworkReport[]){
 const own=assignments.filter(a=>a.vendor_id===vendorId),sent=own.filter(a=>a.notification_status==='SENT'),accepted=sent.filter(a=>a.accepted_at);
 const valid=own.flatMap(a=>{const rows=latestReports(reports.filter(r=>r.assignment_id===a.id)).filter(r=>!r.excluded);return connectionState(rows,!!a.accepted_at)==='Reports need review'?[]:rows.filter(r=>r.party==='HOMEOWNER'&&!r.disputed&&!!a.accepted_at&&Date.parse(r.created_at)>=Date.parse(a.accepted_at));});
 const known=valid.filter(r=>['YES','NO'].includes(r.contact)),contacted=known.filter(r=>r.contact==='YES');
 const ratings=valid.filter(r=>r.outcome==='COMPLETED'&&r.rating!==null&&own.some(a=>a.id===r.assignment_id&&a.accepted_at));
 const acceptanceTimes=accepted.map(a=>(Date.parse(a.accepted_at!)-Date.parse(a.notification_sent_at!))/3600000).filter(n=>Number.isFinite(n)&&n>=0).sort((a,b)=>a-b);
 return{offered:sent.length,accepted:accepted.length,contactResponses:known.length,contacted:contacted.length,failedContact:known.length-contacted.length,unknownContact:own.filter(a=>!known.some(r=>r.assignment_id===a.id)).length,completed:valid.filter(r=>r.outcome==='COMPLETED').length,reviewCount:ratings.length,averageStars:ratings.length?ratings.reduce((sum,r)=>sum+r.rating!,0)/ratings.length:null,medianAcceptanceHours:acceptanceTimes.length?(acceptanceTimes[Math.floor((acceptanceTimes.length-1)/2)]+acceptanceTimes[Math.floor(acceptanceTimes.length/2)])/2:null};
}
export type VendorEvidence=ReturnType<typeof vendorEvidence>;
export function recommendation(e:VendorEvidence,serviceMatch:boolean,townMatch:boolean){
 if(!serviceMatch||!townMatch)return{tier:3,label:'Coverage needs review',reason:'The recorded service or town does not match this request. Operator review is required.'};
 if(e.contactResponses>=5&&e.contacted/e.contactResponses>=.8)return{tier:0,label:'Supported by contact history',reason:`Service and town match; homeowners confirmed contact on ${e.contacted} of ${e.contactResponses} answered check-ins. This is a suggestion, not a guarantee.`};
 if(e.contactResponses>=5&&e.failedContact/e.contactResponses>.5)return{tier:2,label:'Review contact history',reason:`Service and town match; ${e.failedContact} of ${e.contactResponses} answered check-ins reported no contact. Inspect the requests before deciding.`};
 return{tier:1,label:'Coverage match',reason:'Service and town match. Contact evidence is limited or mixed; missing responses are unknown, not failures.'};
}
