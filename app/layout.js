import { Inter, Kanit } from "next/font/google";
import "./globals.css";
import Analytics from './Analytics'

// Font สำหรับ English
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

// Font สำหรับ Thai
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: 'swap',
});

export const metadata = {
  title: "FranHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1",
  description: "แพลตฟอร์มซื้อขายแฟรนไชส์อันดับ 1 ของประเทศไทย ค้นหาแฟรนไชส์ในฝัน เริ่มธุรกิจของคุณวันนี้",
  keywords: "แฟรนไชส์, ธุรกิจ, ลงทุน, franchise, business",
  author: "FranHub",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  
  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://franchise-marketplace-ldou.vercel.app",
    title: "FranHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1",
    description: "ค้นหาแฟรนไชส์ในฝัน เริ่มธุรกิจของคุณวันนี้",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FranHub",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "FranHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1",
    description: "ค้นหาแฟรนไชส์ในฝัน เริ่มธุรกิจของคุณวันนี้",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${inter.variable} ${kanit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body
        className={`${kanit.className} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
        <Analytics />  
      </body>
    </html>
  );
}