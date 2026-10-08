import type { Metadata } from "next";
import { ServiceDirectory } from "@/components/authority/ServiceDirectory";
export const revalidate = 3600;
export const metadata: Metadata = {title:"Home services in Northern New Jersey", description:"Explore eight home services, local service pages and practical repair guidance. A5 connects homeowners with independent local professionals.", alternates:{canonical:"/services"}};
export default function Page() { return <ServiceDirectory by="service" />; }
