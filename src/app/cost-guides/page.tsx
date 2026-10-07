import type { Metadata } from "next";
import { ContentIndex } from "@/components/templates/ContentIndex";
export const metadata: Metadata = {title: 'Plan the project, then the budget.', description: 'Understand the work and the factors that can affect an estimate before you decide how to proceed.', robots: {index: false, follow: true}, alternates: {canonical: "/cost-guides"}};
export const revalidate = 3600;
export default function Page() { return <ContentIndex type="COST_GUIDE" title={'Plan the project, then the budget.'} description={'Understand the work and the factors that can affect an estimate before you decide how to proceed.'} empty={'We are preparing cost guides. For now, share the project details so a provider can discuss an estimate for your home.'} />; }
