import type { Metadata } from "next";
import { ContentIndex } from "@/components/templates/ContentIndex";
export const metadata: Metadata = {title: "Compare", description: 'Compare approaches to common home repairs and learn what to discuss with a professional.', robots: {index: false, follow: true}, alternates: {canonical: "/compare"}};
export const revalidate = 3600;
export default function Page() { return <ContentIndex type="COMPARISON" title={'Make sense of your options.'} description={'Compare approaches to common home repairs and learn what to discuss with a professional.'} empty={'Our comparison guides are on the way. If you are unsure where to start, describe the problem in your own words.'} />; }
