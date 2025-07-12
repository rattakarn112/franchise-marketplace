import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb'
}

export const metadata = {
  metadataBase: new URL('https://franchise-marketplace-ldou.vercel.app'),
  title: 'FranHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1',
  description: 'แพลตฟอร์มซื้อขายแฟรนไชส์อันดับ 1 ของประเทศไทย ค้นหาแฟรนไชส์ในฝัน เริ่มธุรกิจของคุณวันนี้',
  keywords: 'แฟรนไชส์, ธุรกิจ, ลงทุน, franchise, business',
  author: 'FranHub',
  robots: 'index, follow',
  
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://franchise-marketplace-ldou.vercel.app',
    title: 'FranHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1',
    description: 'ค้นหาแฟรนไชส์ในฝัน เริ่มธุรกิจของคุณวันนี้',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FranHub',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'FranHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1',
    description: 'ค้นหาแฟรนไชส์ในฝัน เริ่มธุรกิจของคุณวันนี้',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}