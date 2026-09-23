import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare",
  robots: { index: false, follow: true },
  alternates: { canonical: "/compare" },
};

export default function CompareIndexPage() {
  return (
    <main style={{ padding: "3rem 1rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1>Compare</h1>
      <p>No published comparisons yet.</p>
    </main>
  );
}
