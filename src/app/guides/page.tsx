import type { Metadata } from "next";
import { ContentIndex } from "@/components/templates/ContentIndex";
export const metadata: Metadata = {title: "Guides", description: 'Practical explanations to help you describe a problem, weigh your options and prepare for a conversation with a local professional.', robots: {index: true, follow: true}, alternates: {canonical: "/guides"}};
export const revalidate = 3600;
export default function Page() { return <ContentIndex type="GUIDE" title={'Understand what your home needs.'} description={'Practical explanations to help you describe a problem, weigh your options and prepare for a conversation with a local professional.'} empty={'Our homeowner guides are on the way. Tell us what you are seeing and we can help with the next step.'} />; }
