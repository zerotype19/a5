/** Targeted editorial correction; default read-only, compare-and-set on exact reviewed rows. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
const db=getSupabaseAdmin();if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const manifest=JSON.parse(readFileSync('content/growth-wave-3/manifest.json','utf8'));
const {data,error}=await db.from('content_pages').select('id,direct_answer,sections,updated_at').in('id',manifest.pages.map((p:{id:string})=>p.id));
if(error||data.length!==16)throw Error('Unresolved content set');
const plan=data.map(row=>({row,sections:row.sections.filter((s:{type:string;body?:string})=>!(s.type==='INTRO'&&s.body===row.direct_answer))})).filter(p=>p.sections.length!==p.row.sections.length);
console.log({repeatedIntros:plan.length});if(!process.argv.includes('--apply'))process.exit(0);
const prefix='.wrangler/growth-wave-3/intro-correction';if(existsSync(prefix+'-before.json'))throw Error('Prior attempt exists');writeFileSync(prefix+'-before.json',JSON.stringify(data),{flag:'wx',mode:0o600});
const receipt:{intent:string|null;writes:string[]}={intent:null,writes:[]};const save=()=>writeFileSync(prefix+'-receipt.json',JSON.stringify(receipt),{mode:0o600});
for(const {row,sections} of plan){receipt.intent=row.id;save();const result=await db.from('content_pages').update({sections,updated_at:new Date().toISOString()}).eq('id',row.id).eq('updated_at',row.updated_at).select('id');if(result.error||result.data.length!==1)throw Error('Concurrent or failed update');receipt.writes.push(row.id);receipt.intent=null;save();}console.log({corrected:receipt.writes.length});
