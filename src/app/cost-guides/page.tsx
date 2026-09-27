import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cost guides",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cost-guides" },
};

export default function CostGuidesIndexPage() {
  return (
    <main style={{ padding: "3rem 1rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1>Cost guides</h1>
      <p>No published cost guides yet.</p>
    </main>
  );
}
