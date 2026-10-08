/** Audited text-only manifest. Read-only unless explicitly invoked with --apply. */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
const raw=readFileSync('content/network/copy-updates.json','utf8');
type Edit={id:string;slug:string;updated_at:string;indexable:boolean;before:Record<string,unknown>;after:Record<string,unknown>};
const edits=JSON.parse(raw) as Edit[];
const digest=createHash('sha256').update(raw).digest('hex');
const manifest=JSON.parse(readFileSync('docs/network/CONTENT-MANIFEST.json','utf8'));
if(digest!==manifest.sha256)throw Error('Unreviewed manifest changes');
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong database');
const db=getSupabaseAdmin();
const fields=['title','h1','meta_description','direct_answer','sections'];
for(const edit of edits){
 if(JSON.stringify(Object.keys(edit.after).sort())!==JSON.stringify([...fields].sort()))throw Error('Unexpected field');
 const {data,error}=await db.from('content_pages').select('id,status,indexable,updated_at,title,h1,meta_description,direct_answer,sections').eq('id',edit.id).single();
 if(error||!data||data.status!=='PUBLISHED'||data.indexable!==edit.indexable||data.updated_at!==edit.updated_at)throw Error(`Stale baseline: ${edit.slug}`);
 for(const key of fields)if(JSON.stringify(data[key as keyof typeof data])!==JSON.stringify(edit.before[key]))throw Error(`Changed text: ${edit.slug}/${key}`);
}
console.log({preflight:'passed',pages:edits.length,sha256:digest});
if(!process.argv.includes('--apply'))process.exit(0);
mkdirSync('.wrangler/network',{recursive:true});const path='.wrangler/network/content-receipt.json';
if(existsSync(path))throw Error('Existing receipt: inspect partial release before resuming');
const receipt:{started:string;sha256:string;intent:string|null;writes:unknown[];completed?:string}={started:new Date().toISOString(),sha256:digest,intent:null,writes:[]};
const save=()=>writeFileSync(path,JSON.stringify(receipt,null,2),{mode:0o600});save();
for(const edit of edits){
 receipt.intent=edit.id;save();const now=new Date().toISOString();
 const {data,error}=await db.from('content_pages').update({...edit.after,updated_at:now}).eq('id',edit.id).eq('updated_at',edit.updated_at).eq('status','PUBLISHED').eq('indexable',edit.indexable).select('id,updated_at');
 if(error||data?.length!==1)throw Error(`Write failed or stale: ${edit.slug}`);
 receipt.writes.push(data[0]);receipt.intent=null;save();
}
receipt.completed=new Date().toISOString();save();console.log({completed:receipt.completed,pages:receipt.writes.length});
