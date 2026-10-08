import type { Metadata } from "next";
import { ContentIndex } from "@/components/templates/ContentIndex";
export const metadata: Metadata = {title: "Projects", description: 'Project stories will show the problem, the work and the outcome—with the homeowner’s permission.', robots: {index: false, follow: true}, alternates: {canonical: "/projects"}};
export const revalidate = 3600;
export default function Page() { return <ContentIndex type="PROJECT" title={'Real homes. Thoughtful repairs.'} description={'Project stories will show the problem, the work and the outcome—with the homeowner’s permission.'} empty={'We are gathering project stories to share.'} />; }
