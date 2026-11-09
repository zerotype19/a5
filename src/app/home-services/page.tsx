import type { Metadata } from "next";
import { ServiceDirectory } from "@/components/authority/ServiceDirectory";
export const revalidate = 3600;
export const metadata: Metadata = {title:"Home service areas in Northern New Jersey", description:"Explore home services across 226 municipalities in eight Northern New Jersey counties. Find your town, plan a project and find a local pro.", alternates:{canonical:"/home-services"}};
export default function Page() { return <ServiceDirectory by="town" />; }
