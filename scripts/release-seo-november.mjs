/** Guarded owner-authorized editorial patch. No operational data changes. */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const raw=readFileSync('docs/seo-performance-2026-11/CONTENT-PATCH.json','utf8');
const plan=JSON.parse(raw),manifest=JSON.parse(readFileSync('docs/seo-performance-2026-11/MANIFEST.json'));
if(createHash('sha256').update(raw).digest('hex')!==manifest.sha256||plan.length!==5)throw Error('Manifest mismatch');
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong database');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const r=await db.from('content_pages').select('*').in('id',plan.map(p=>p.id));if(r.error||r.data.length!==5)throw Error('Cannot read baseline');
for(const p of plan){const existing=r.data.find(x=>x.id===p.id);if(existing.updated_at!==p.expected_updated_at||existing.status!=='PUBLISHED'||!existing.indexable)throw Error('Concurrent change '+p.slug);}
console.log({preflight:'passed',pages:5});if(!process.argv.includes('--apply'))process.exit(0);
const folder='.wrangler/seo-november';mkdirSync(folder,{recursive:true});const receiptPath=folder+'/publication-receipt.json';if(existsSync(receiptPath))throw Error('Receipt exists; reconcile before retry');
const receipt={before:r.data,intent:null,written:[]};const save=()=>writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600});save();
for(const p of plan){receipt.intent=p.id;save();const result=await db.from('content_pages').update({...p.fields,updated_at:new Date().toISOString()}).eq('id',p.id).eq('updated_at',p.expected_updated_at).select('id');if(result.error||result.data.length!==1)throw Error('Write uncertain '+p.slug);receipt.written.push(p.id);receipt.intent=null;save();}
console.log({published:receipt.written.length});
