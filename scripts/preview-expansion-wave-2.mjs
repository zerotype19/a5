/** Local review only. Stage/remove a development-gated route; never deploy this route. */
import {mkdirSync,writeFileSync,unlinkSync,rmdirSync,existsSync} from 'node:fs';
const root='src/app/authority-preview';
if(process.argv.includes('--remove')){
 for(const f of [`${root}/[key]/page.tsx`,`${root}/page.tsx`])if(existsSync(f))unlinkSync(f);
 for(const d of [`${root}/[key]`,root])if(existsSync(d))rmdirSync(d);
 console.log('Authority preview route removed.');
}else{
 if(existsSync(root))throw new Error('Remove existing preview first');
 mkdirSync(`${root}/[key]`,{recursive:true});
 writeFileSync(`${root}/page.tsx`, `import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ServiceDirectory} from '@/components/authority/ServiceDirectory';
import type {ContentPageRecord} from '@/lib/authority/types';
import plan from '../../../.wrangler/expansion-wave-2/plan.json';
export const metadata={robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{by?:string}>}){
 if(process.env.NODE_ENV!=='development')notFound();
 const by=(await searchParams).by==='town'?'town':'service';
 const records=plan.all.map(p=>({...p,status:'PUBLISHED',indexable:true})) as ContentPageRecord[];
 return <><aside style={{padding:'2rem',background:'#e4ecdf'}}><h1>Draft content review — not published</h1><p>Review all 35 drafts below. Canonical links within pages lead to existing published pages until release.</p><p><Link href='/authority-preview?by=service'>Service directory</Link> · <Link href='/authority-preview?by=town'>Town directory</Link></p><ul>{plan.pages.map(p=><li key={p.id}><Link href={'/authority-preview/'+p.slug}>{p.title}</Link></li>)}</ul></aside><ServiceDirectory by={by} records={records}/></>;
}`);
 writeFileSync(`${root}/[key]/page.tsx`, `import Link from 'next/link';
import {notFound} from 'next/navigation';
import {AuthorityPage} from '@/components/authority/AuthorityPage';
import {buildContentPathFromRecord} from '@/lib/authority/urls';
import type {ContentPageRecord,PublicContentPage} from '@/lib/authority/types';
import plan from '../../../../.wrangler/expansion-wave-2/plan.json';
export const metadata={robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{key:string}>}){
 if(process.env.NODE_ENV!=='development')notFound();
 const {key}=await params;const row=plan.pages.find(p=>p.slug===key);if(!row)notFound();
 const all=plan.all.map(p=>({...p,status:'PUBLISHED',indexable:true})) as ContentPageRecord[];
 const page={...row,status:'PUBLISHED',indexable:true,related_service_ids:[row.primary_service_id],related_location_ids:row.primary_location_id?[row.primary_location_id]:[],related_problem_ids:[],sources:plan.sources.filter(s=>plan.sourceLinks.some(l=>l.content_page_id===row.id&&l.source_id===s.id)).map(s=>({...s,relationship_type:'SUPPORTS'})),related_content:plan.relationships.filter(r=>r.from_page_id===row.id).flatMap(r=>{const p=all.find(p=>p.id===r.to_page_id);return p?[{id:p.id,slug:p.slug,page_type:p.page_type,title:p.title,path:buildContentPathFromRecord(p),relationship_type:r.relationship_type}]:[]})} as PublicContentPage;
 return <><aside style={{padding:'1rem 2rem',background:'#e4ecdf'}}>Draft — not published. <Link href='/authority-preview'>All drafts</Link></aside><AuthorityPage page={page} discoveryPages={all}/></>;
}`);
 console.log('Development preview staged at /authority-preview. Remove before builds.');
}
