import type { Metadata } from "next";
import { Noto_Serif_TC, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const serif = Noto_Serif_TC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Jam For Love — 手工果醬",
  description: "用愛製作的手工果醬，嚴選當季新鮮水果，天然健康好滋味",
  icons: { icon: "/logo.jpg", apple: "/logo.jpg" },
  openGraph: {
    title: "Jam For Love — 手工果醬",
    description: "用愛製作的手工果醬，嚴選當季新鮮水果，天然健康好滋味",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${serif.variable} ${sans.variable} min-h-screen`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
