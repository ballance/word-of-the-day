import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Word of the Day - Expand Your Vocabulary Daily",
  description: "Discover a new word every day with definitions, examples, etymology, and more. Privacy-respecting and completely free vocabulary builder.",
  keywords: ["vocabulary", "word of the day", "education", "learning", "language"],
  authors: [{ name: "Word of the Day" }],
  openGraph: {
    title: "Word of the Day",
    description: "Expand your vocabulary with a new word every day",
    type: "website",
    siteName: "Word of the Day",
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
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
