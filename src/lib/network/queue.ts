import {publicReferenceFromLeadId} from '../admin/format.ts';
import type {WorkItem} from '../admin/work-queue.ts';
import type {NetworkAssignment} from './evidence.ts';
import {connectionState,latestReports,type NetworkReport} from './policy.ts';
import type {NetworkInvitation} from './data.ts';
export function networkQueue(assignments:NetworkAssignment[],reports:NetworkReport[],invitations:NetworkInvitation[],now:string):WorkItem[]{
 const time=Date.parse(now);return assignments.filter(a=>['ASSIGNED','ACCEPTED'].includes(a.status)).flatMap(a=>{
 const base={id:a.lead_id,kind:'request' as const,title:publicReferenceFromLeadId(a.lead_id),href:`/admin/leads/${a.lead_id}#network`,since:a.assigned_at};
 const history=invitations.filter(i=>i.assignment_id===a.id&&!i.revoked_at);
 if(history.some(i=>['FAILED','UNCERTAIN'].includes(i.status)||(i.status==='SENDING'&&Date.parse(i.created_at)<time-15*60000)))return[{...base,action:'Inspect check-in delivery',detail:'A check-in failed or its delivery is uncertain. Inspect the attempt before sending a replacement.',priority:0}];
 if(a.status==='ASSIGNED'&&a.acceptance_due_at&&Date.parse(a.acceptance_due_at)<=time)return[{...base,action:'Release expired offer',detail:'Acceptance deadline passed. Release the old offer, then manually choose another provider.',priority:1}];
 const rows=reports.filter(r=>r.assignment_id===a.id),state=connectionState(rows,!!a.accepted_at);
 if(['Reports need review','Connection needs follow-up'].includes(state))return[{...base,action:state,detail:'Inspect the party-specific reports. Confirm homeowner wishes before another introduction.',priority:1}];
 const home=latestReports(rows).find(r=>r.party==='HOMEOWNER'&&!r.excluded);
 if(home?.outcome==='COMPLETED')return[];
 const last=history.filter(i=>i.party==='HOMEOWNER'&&i.status==='SENT').sort((x,y)=>y.created_at.localeCompare(x.created_at))[0];
 const origin=a.accepted_at??a.notification_sent_at;
 if(origin&&Date.parse(origin)<=time-86400000&&(!last||Date.parse(last.created_at)<=time-7*86400000))return[{...base,action:home?'Request project update':'Check homeowner connection',detail:'Review permission and send a check-in if appropriate. Missing responses are unknown, not a vendor failure.',priority:3}];
 return[];
 });
}
