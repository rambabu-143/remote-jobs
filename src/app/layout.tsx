import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import Nav from "@/components/Nav";
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
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "Remote Jobs India & Work From Home Jobs | 365DaysJobsTeam", template: "%s | 365DaysJobsTeam" },
  description: "Latest remote jobs in India & worldwide from verified companies. Work from home, part time, full time and entry level jobs for freshers and students.",
  openGraph: { siteName: "365DaysJobsTeam", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip bg-paper text-zinc-900">
        <RootProvider theme={{ forcedTheme: "light", defaultTheme: "light" }}>
          <Nav />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
