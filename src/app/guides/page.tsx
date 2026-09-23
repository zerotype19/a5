import type { Metadata } from "next";
import Link from "next/link";
import { fetchPublishedPages } from "@/lib/authority/query";
import { buildContentPathFromRecord } from "@/lib/authority/urls";

export const metadata: Metadata = {
  title: "Guides",
  description: "Homeowner guides from A5 Home Services.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/guides" },
};

export const revalidate = 3600;

export default async function GuidesIndexPage() {
  const pages = (await fetchPublishedPages()).filter(
    (page) => page.page_type === "GUIDE" && page.indexable,
  );

  return (
    <main style={{ padding: "3rem 1rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1>Guides</h1>
      {pages.length === 0 ? (
        <p>No published guides yet.</p>
      ) : (
        <ul>
          {pages.map((page) => {
            const path = buildContentPathFromRecord(page);
            if (!path) return null;
            return (
              <li key={page.id}>
                <Link href={path}>{page.title}</Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
