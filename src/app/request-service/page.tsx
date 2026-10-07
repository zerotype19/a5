import type { Metadata } from 'next';
import { ProjectIntakeForm } from '@/components/intake/ProjectIntakeForm';
import { intakeContext } from '@/lib/intake/context';
export const metadata: Metadata = {title:'Request Service',description:'Tell A5 what your home needs. Share your project and optional photos to start a local service request.',alternates:{canonical:'/request-service'},robots:{index:false,follow:true}};
export default async function RequestServicePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const p=await searchParams;
 const ctx=intakeContext({service:typeof p.service==='string'?p.service:undefined,location:typeof p.location==='string'?p.location:undefined,problem:typeof p.problem==='string'?p.problem:undefined});
 return <main><ProjectIntakeForm availabilityReview={ctx.location?.requestReviewRequired} initialService={ctx.service?.id} contextLabel={[ctx.location?.name,ctx.problem?.replaceAll('-',' ')].filter(Boolean).join(' · ')}/></main>;
}
