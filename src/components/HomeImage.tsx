import Image from 'next/image';
/** Pre-sized local assets keep image delivery independent of an edge image service. */
export function HomeImage({name,alt,priority=false,className}:{name:string;alt:string;priority?:boolean;className?:string}) {
 return <Image src={`/images/${name}${priority?"":"-small"}.webp`} alt={alt} width={priority?1440:640} height={priority?960:427} unoptimized loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined} className={className} />;
}
