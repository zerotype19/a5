import {mkdirSync,writeFileSync,existsSync,rmSync} from 'node:fs';
const root='src/app/authority-preview';
if(process.argv.includes('--remove')){rmSync(root,{recursive:true,force:true});process.exit(0);}
if(existsSync(root))throw Error('Existing preview; inspect first');
mkdirSync(`${root}/[key]`,{recursive:true});
writeFileSync(`${root}/[key]/page.tsx`, `import {notFound} from 'next/navigation';
import {AuthorityPage} from '@/components/authority/AuthorityPage';
import {CostLibrary} from '@/components/authority/CostLibrary';
import type {ContentPageRecord,PublicContentPage} from '@/lib/authority/types';
import plan from '../../../../content/cost-guidance/publication.json';
export const metadata={robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{key:string}>}){
 if(process.env.NODE_ENV!=='development')notFound();
 const {key}=await params;
 if(key==='hub')return <CostLibrary pages={plan.pages as ContentPageRecord[]}/>;
 const row=plan.pages.find(p=>p.slug===key);if(!row)notFound();
 const page={...row,related_service_ids:row.primary_service_id?[row.primary_service_id]:[],related_location_ids:[],related_problem_ids:[],sources:plan.sources.filter(s=>plan.sourceLinks.some(l=>l.content_page_id===row.id&&l.source_id===s.id)).map(s=>({...s,relationship_type:'COST_INPUT'})),related_content:[]} as PublicContentPage;
 return <AuthorityPage page={page} discoveryPages={plan.pages as ContentPageRecord[]}/>;
}`);
