import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppPWAHandler } from '@/components/pwa-handler'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'AYUDA | Un lugar donde puedes ser tú',
  description: 'Aquí nadie te juzga. Apoyo emocional, escucha y compañía cuando más lo necesitas. Un refugio digital seguro y anónimo.',
  keywords: ['apoyo emocional', 'salud mental', 'bienestar', 'ansiedad', 'depresión', 'soledad', 'sin juicio', 'escucha'],
  authors: [{ name: 'AYUDA' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AYUDA',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable} bg-background`}>
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen overscroll-none select-none">
        <AppPWAHandler />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
