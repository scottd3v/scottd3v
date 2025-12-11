import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scottd3v.com"),
  title: "scottd3v - Apps & Projects",
  description: "Personal developer site by Scott Reed. iOS apps, games, and projects.",
  alternates: {
    canonical: "https://scottd3v.com",
  },
  openGraph: {
    title: "Software Seuss",
    description: "scottd3v.com",
    siteName: "scottd3v",
    url: "https://scottd3v.com",
    images: [
      {
        url: "/og-scottd3v.png",
        width: 1200,
        height: 630,
        alt: "scottd3v - Apps & Projects",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Software Seuss",
    description: "scottd3v.com",
    images: ["/og-scottd3v.png"],
  },
  other: {
    "theme-color": "#0a0a09",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://scottd3v.com/#website",
      url: "https://scottd3v.com",
      name: "scottd3v",
      description: "Personal developer site by Scott Reed. iOS apps, games, and projects.",
      publisher: {
        "@id": "https://scottd3v.com/#person",
      },
    },
    {
      "@type": "Person",
      "@id": "https://scottd3v.com/#person",
      name: "Scott Reed",
      alternateName: "Software Seuss",
      url: "https://scottd3v.com",
      sameAs: [
        "https://github.com/scottd3v",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
