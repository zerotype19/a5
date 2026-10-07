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
  "Home repairs in northern New Jersey. Tell us what's wrong and we'll help line up a local provider.";

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
    images: [{url:"/images/hero.webp",width:1440,height:960}],
  },
  twitter: {card:"summary_large_image",images:["/images/hero.webp"]},
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
