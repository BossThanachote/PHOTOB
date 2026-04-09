import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const IBM_Thai = IBM_Plex_Sans_Thai({
  subsets: ['latin'],
  variable: "--font-ibm-thai",
  weight: ['700', '500', '400'],
})

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const dreamSparks = localFont({
  src: "./fonts/DreamSparks.ttf",  
  variable: "--font-dream-sparks",  
  weight: "400",
});

const bebasNeue = localFont({
  src: "./fonts/BebasNeue.ttf",
  variable: "--font-bebas-neue",
  weight: "400",
})

const SFPro = localFont({
  src: "./fonts/SFPro.otf",
  variable: "--font-SF-Pro",
  weight: "400",
})

const Inter = localFont({
  src: "./fonts/Inter.ttf",
  variable: "--font-inter",
  weight: "400",
})

export const metadata: Metadata = {
  title: "Happy Day Photobooth | ตู้ถ่ายรูปออนไลน์สุดคิวท์",
  description: "สนุกกับการถ่ายรูปและตกแต่งด้วยสติ๊กเกอร์น่ารักๆ พร้อมดาวน์โหลดรูปลงมือถือผ่าน QR Code ได้ทันที!",
  keywords: ["photobooth", "ตู้ถ่ายรูป", "ถ่ายรูปออนไลน์", "สติ๊กเกอร์", "กรอบรูปน่ารัก", "ถ่ายรูป"],
  authors: [{ name: "BossThanachote" }],
  openGraph: {
    title: "Happy Day Photobooth 📸",
    description: "มาถ่ายรูปและตกแต่งด้วยสติ๊กเกอร์น่ารักๆ กันเถอะ!",
    url: "https://photob-1vsa.vercel.app/booth", 
    siteName: "Happy Day Photobooth",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "Happy Day Photobooth Preview",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Happy Day Photobooth 📸",
    description: "สนุกกับการถ่ายรูปและตกแต่งด้วยสติ๊กเกอร์น่ารักๆ",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return ( 
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dreamSparks.variable} ${bebasNeue.variable} ${Inter.variable} ${SFPro.variable} ${IBM_Thai.variable} antialiased `}
      >
        {children}
      </body>
    </html>
  );
}