import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
import {readAllRows} from '../src/lib/admin/read-all.ts';
if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong database');
const dir='.wrangler/customer-copy';mkdirSync(dir,{recursive:true});if(existsSync(dir+'/before.json'))throw Error('Snapshot exists');
const db=getSupabaseAdmin();const data:Record<string,unknown[]>={};
for(const[table,columns]of Object.entries({content_pages:['id'],sources:['id'],content_sources:['content_page_id','source_id','relationship_type'],content_relationships:['from_page_id','to_page_id','relationship_type'],vendors:['id'],vendor_services:['vendor_id','service_id'],vendor_locations:['vendor_id','location_id']}))data[table]=await readAllRows((a,b)=>{let q=db.from(table).select('*');for(const c of columns)q=q.order(c);return q.range(a,b);},table);
writeFileSync(dir+'/before.json',JSON.stringify(data),{mode:0o600,flag:'wx'});console.log({snapshot:'saved',pages:data.content_pages.length});
