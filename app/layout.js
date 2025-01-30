import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import "@rainbow-me/rainbowkit/styles.css";
import { AppWrapper } from "../components/context";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'BitVision',
  description: 'Your NFT Analytics Platform',
  icons: {
    icon: '/logo1.png', 
    apple: '/logo1.png', 
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppWrapper>
          <Providers>
            {children}
            <SpeedInsights />
            <Analytics />
          </Providers>
        </AppWrapper>
      </body>
    </html>
  );
}
