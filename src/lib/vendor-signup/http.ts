import { submitVendorSignup } from './submit.ts';
export async function handleVendorSignupRequest(request:Request,submit=submitVendorSignup){
  const reply=(body:unknown,status:number)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
  const origin=request.headers.get('origin');
  if(origin){
    let allowed=false;
    try {const source=new URL(origin);allowed=['http:','https:'].includes(source.protocol)&&(source.origin===new URL(request.url).origin||source.host===request.headers.get('host'));} catch {}
    if(!allowed)return reply({success:false,message:'Submit from the A5 website.'},403);
  }
  if(!request.headers.get('content-type')?.includes('application/json')) return reply({success:false,message:'Invalid request.'},415);
  // Count streamed bytes too: Content-Length is untrusted and may be absent.
  const reader=request.body?.getReader();if(!reader)return reply({success:false,message:'Invalid request.'},400);
  let size=0;const chunks:Uint8Array[]=[];
  try {
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>32768){await reader.cancel();return reply({success:false,message:'Submission is too large.'},413);}chunks.push(value);}
    const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength;}
    const input=JSON.parse(new TextDecoder().decode(buffer));
    const result=await submit(input,request.headers.get('idempotency-key'));
    return reply(result.body,result.status);
  } catch {return reply({success:false,message:'Invalid request.'},400);}
}
