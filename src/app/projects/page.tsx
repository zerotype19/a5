import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  robots: { index: false, follow: true },
  alternates: { canonical: "/projects" },
};

export default function ProjectsIndexPage() {
  return (
    <main style={{ padding: "3rem 1rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1>Projects</h1>
      <p>
        Public project pages require explicit approval. None are published yet.
      </p>
    </main>
  );
}
