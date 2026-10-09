/** Local, development-only review. Remove the ignored route before either build. */
import {mkdirSync,writeFileSync,readFileSync,existsSync,unlinkSync,rmdirSync} from 'node:fs';
const root='src/app/authority-preview';
if(process.argv.includes('--remove')){
 const file=`${root}/[key]/page.tsx`;if(existsSync(file))unlinkSync(file);
 for(const dir of [`${root}/[key]`,root])if(existsSync(dir))rmdirSync(dir);
}else{
 if(existsSync(root))throw Error('Existing preview must be removed first');
 const before=JSON.parse(readFileSync('.wrangler/customer-copy/before.json','utf8'));
 const {updates}=JSON.parse(readFileSync('content/customer-copy/manifest.json','utf8'));
 writeFileSync('.wrangler/customer-copy/public-preview.json',JSON.stringify({pages:updates,all:before.content_pages.map(p=>updates.find(u=>u.id===p.id)??p),sources:before.sources,sourceLinks:before.content_sources,relationships:before.content_relationships}));
 mkdirSync(`${root}/[key]`,{recursive:true});
 writeFileSync(`${root}/[key]/page.tsx`, `import {notFound} from 'next/navigation';
import {AuthorityPage} from '@/components/authority/AuthorityPage';
import {buildContentPathFromRecord} from '@/lib/authority/urls';
import type {ContentPageRecord,PublicContentPage} from '@/lib/authority/types';
import plan from '../../../../.wrangler/customer-copy/public-preview.json';
export const metadata={robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{key:string}>}){
 if(process.env.NODE_ENV!=='development')notFound();
 const {key}=await params;const row=plan.pages.find(p=>p.slug===key);if(!row)notFound();
 const all=plan.all as ContentPageRecord[];
 const page={...row,related_service_ids:[],related_location_ids:[row.primary_location_id],related_problem_ids:[],sources:plan.sources.filter(s=>plan.sourceLinks.some(l=>l.content_page_id===row.id&&l.source_id===s.id)).map(s=>({...s,relationship_type:'SUPPORTS'})),related_content:plan.relationships.filter(r=>r.from_page_id===row.id).flatMap(r=>{const p=all.find(p=>p.id===r.to_page_id);return p?[{id:p.id,slug:p.slug,page_type:p.page_type,title:p.title,path:buildContentPathFromRecord(p),relationship_type:r.relationship_type}]:[]})} as PublicContentPage;
 return <AuthorityPage page={page} discoveryPages={all}/>;
}`);
}
