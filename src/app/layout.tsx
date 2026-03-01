import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ReachFire — Free FIRE Calculator & Financial Independence Planner",
  description:
    "Free FIRE calculator with geoarbitrage, Roth ladder planning, and AI insights. Monte Carlo simulations, healthcare cost estimation, and more. All calculations run in your browser.",
  keywords: [
    "FIRE calculator",
    "financial independence",
    "early retirement",
    "retire early",
    "FIRE number",
    "Monte Carlo simulation",
    "coast FIRE",
    "Roth ladder",
    "geoarbitrage",
  ],
  openGraph: {
    title: "ReachFire — Free FIRE Calculator & Financial Independence Planner",
    description:
      "Free FIRE calculator with geoarbitrage, Roth ladder planning, and AI insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
