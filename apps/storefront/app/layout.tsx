import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../lib/cart-context';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutDrawer } from '../components/CheckoutDrawer';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { MobileStickyPurchaseBar } from '../components/MobileStickyPurchaseBar';
import { BRAND_NAME, PRODUCT_PRICE } from '@stoncrops/shared';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Embroidered Edition`,
  description:
    'Full-sleeve oversized T-shirt cut from heavyweight off-white Loopnet. Detailed with bespoke burgundy floral embroidery on both sleeves and minimal chest typography. ₹1,199 with free shipping across India.',
  keywords: [
    'STONCROPS',
    'Embroidered Edition',
    'Streetwear India',
    'Oversized T-shirt',
    'Loopnet T-shirt',
    'Floral Sleeve Embroidery',
  ],
  authors: [{ name: 'STONCROPS' }],
  metadataBase: new URL('https://stoncrops.com'),
  openGraph: {
    title: `${BRAND_NAME} — Embroidered Edition`,
    description:
      'Full-sleeve oversized T-shirt cut from off-white Loopnet with bespoke burgundy floral sleeve embroidery. ₹1,199.',
    url: 'https://stoncrops.com',
    siteName: BRAND_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/images/product/front-editorial.svg',
        width: 1000,
        height: 1200,
        alt: 'STONCROPS Embroidered Edition',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} — Embroidered Edition`,
    description:
      'Full-sleeve oversized T-shirt cut from off-white Loopnet with bespoke burgundy floral sleeve embroidery.',
    images: ['/images/product/front-editorial.svg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FAF8F5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* JSON-LD Schema for Google Rich Product Search Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: 'STONCROPS — Embroidered Edition',
              image: 'https://stoncrops.com/images/product/front-editorial.svg',
              description:
                'Full-sleeve oversized T-shirt in off-white Loopnet with bespoke burgundy floral sleeve embroidery.',
              brand: {
                '@type': 'Brand',
                name: 'STONCROPS',
              },
              offers: {
                '@type': 'Offer',
                url: 'https://stoncrops.com',
                priceCurrency: 'INR',
                price: PRODUCT_PRICE,
                availability: 'https://schema.org/InStock',
                itemCondition: 'https://schema.org/NewCondition',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} font-sans bg-cream-50 text-obsidian-950 selection:bg-burgundy-700 selection:text-white min-h-screen overflow-x-hidden antialiased`}>
        <CartProvider>
          {children}
          <CartDrawer />
          <CheckoutDrawer />
          <SizeGuideModal />
          <MobileStickyPurchaseBar />
        </CartProvider>
      </body>
    </html>
  );
}
