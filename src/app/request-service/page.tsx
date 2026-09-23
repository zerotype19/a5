import type { Metadata } from "next";
import { ProjectIntakeForm } from "@/components/intake/ProjectIntakeForm";

export const metadata: Metadata = {
  title: "Request Service",
  description:
    "Tell A5 Home Services what your home needs. A short guided project request for Northern New Jersey homeowners.",
  robots: { index: true, follow: true },
};

export default function RequestServicePage() {
  return (
    <main>
      <ProjectIntakeForm />
    </main>
  );
}
