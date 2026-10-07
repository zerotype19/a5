import type { Metadata } from "next";
import { ServiceDirectory } from "@/components/authority/ServiceDirectory";
export const revalidate = 3600;
export const metadata: Metadata = {title:"Home service areas in Northern New Jersey", description:"Find home services in Florham Park, Madison, Chatham, Morris Township, Morristown and East Hanover. Explore local project guidance and request help.", alternates:{canonical:"/home-services"}};
export default function Page() { return <ServiceDirectory by="town" />; }
