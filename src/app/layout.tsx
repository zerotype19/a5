import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SITE } from "@config/site";
import { SiteShell } from "@/components/SiteShell";
import { organizationJsonLd } from "@/lib/jsonld";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-family",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body-family",
  display: "swap",
});

const title = `${SITE.name} | Northern New Jersey Home Services`;
const description =
  "Tell us what your home needs. A5 Home Services coordinates the right local professional across Morris County and surrounding Northern New Jersey communities.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: title,
    template: `%s | ${SITE.name}`,
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    title,
    description,
    siteName: SITE.name,
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = organizationJsonLd();

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
