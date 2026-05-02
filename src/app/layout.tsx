import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Matdaan Mitra — Your Election Guide",
  description:
    "A context-aware conversational assistant that guides Indian voters through eligibility, registration, timelines, polling, and rights.",
  keywords: [
    "voter guide",
    "Indian elections",
    "voter registration",
    "ECI",
    "election literacy",
    "matdaan mitra",
  ],
  authors: [{ name: "Matdaan Mitra" }],
  openGraph: {
    title: "Matdaan Mitra — Your Election Guide",
    description: "Personalized election guidance for every Indian citizen.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Apply high-contrast before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('matdaan-high-contrast')==='true'){document.documentElement.setAttribute('data-theme','high-contrast')}}catch(e){}`,
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="tricolor-bar" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
