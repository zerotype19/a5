/** Pre-sized local assets keep image delivery independent of an edge image service. */
export function HomeImage({name,alt,priority=false,className}:{name:string;alt:string;priority?:boolean;className?:string}) {
 // Use the existing, authored image variants. Native srcset also works on the
 // Worker, where next/image has no image-optimization binding configured.
 // eslint-disable-next-line @next/next/no-img-element
 return <img src={`/images/${name}${priority?"":"-small"}.webp`} srcSet={priority?`/images/${name}-small.webp 640w, /images/${name}.webp 1440w`:undefined} sizes={priority?'(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) 50vw, 560px':undefined} alt={alt} width={priority?1440:640} height={priority?960:427} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined} decoding="async" className={className} />;
}
