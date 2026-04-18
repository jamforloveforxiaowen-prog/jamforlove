import type { Metadata } from "next";
import { Cormorant, Noto_Serif_TC, Figtree, Caveat, Playfair_Display, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsPopup from "@/components/NewsPopup";
import { CartProvider } from "@/contexts/CartContext";

const display = Cormorant({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const serif = Noto_Serif_TC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const sans = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const handwritten = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const vintage = Playfair_Display({
  variable: "--font-vintage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const condensed = Bebas_Neue({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Jam For Love",
  description: "用愛製作的手工果醬，嚴選當季新鮮水果，天然健康好滋味",
  icons: { icon: "/logo.jpg", apple: "/logo.jpg" },
  openGraph: {
    title: "Jam For Love",
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
      <body
        className={`${display.variable} ${serif.variable} ${sans.variable} ${handwritten.variable} ${vintage.variable} ${condensed.variable} min-h-screen flex flex-col`}
      >
        <CartProvider>
          <NewsPopup />
          <Navbar />
          <main className="pt-14 flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
