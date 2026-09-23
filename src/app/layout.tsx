import type { Metadata } from "next";
import { SITE } from "@config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE.name,
  description: `${SITE.name} — Northern New Jersey home services foundation.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
