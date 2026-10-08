/** Local-only visual fixtures. No real identities or data; remove before building. */
import{mkdirSync,writeFileSync,rmSync,existsSync}from'node:fs';
const root='src/app/network-preview';
if(process.argv.includes('--remove')){rmSync(root,{recursive:true,force:true});process.exit(0);}
if(existsSync(root))throw Error('Already staged');mkdirSync(root,{recursive:true});
writeFileSync(`${root}/page.tsx`, `import {notFound} from 'next/navigation';
import {CheckinForm} from '@/components/network/CheckinForm';
import {NetworkPanelView} from '@/components/network/NetworkPanel';
import {AuthoritySections} from '@/components/authority/AuthoritySections';
import copy from '../../../content/network/copy-updates.json';
export default async function Page({searchParams}:{searchParams:Promise<{view?:string}>}){
 if(process.env.NODE_ENV!=='development')notFound();const view=(await searchParams).view;
 const a={id:'00000000-0000-4000-8000-000000000012',lead_id:'00000000-0000-4000-8000-000000000011',vendor_id:'fixture',status:'ACCEPTED',assigned_at:'2026-10-01',accepted_at:'2026-10-02',notification_status:'SENT',notification_sent_at:'2026-10-01',acceptance_due_at:'2026-10-02'};
 return <main style={{maxWidth:'70rem',padding:'1.25rem',margin:'auto'}}><p>Local fictional fixture. Do not submit forms.</p>{view==='operator'?<NetworkPanelView leadId={a.lead_id} assignments={[a]} reports={[{id:'00000000-0000-4000-8000-000000000013',assignment_id:a.id,party:'HOMEOWNER',contact:'NO',outcome:'DID_NOT_PROCEED',rating:null,note:'No contact after the introduction. Please follow up.',help_requested:true,created_at:'2026-10-03',disputed:false,excluded:false}]} invitations={[]} permission={{network_consent_version:'2026-10-08',network_consented_at:'2026-10-01',checkins_stopped_at:null}} events={[]} now={1791400000000}/>:view==='copy'?<><h1>Reviewed database copy: masonry</h1><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(copy.find(p=>p.slug==='masonry')?.after,null,2)}</pre></>:<><h1>How did the connection go?</h1><CheckinForm token="fictional-invalid-token" party={view==='provider'?'VENDOR':'HOMEOWNER'} accepted/></>}</main>;
}`.replace("import {AuthoritySections} from '@/components/authority/AuthoritySections';\n",''));
console.log('Staged development-only /network-preview. Remove before build.');
