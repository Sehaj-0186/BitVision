import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import "@rainbow-me/rainbowkit/styles.css";



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
