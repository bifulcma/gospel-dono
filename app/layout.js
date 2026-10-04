import './globals.css';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Il Vangelo del giorno come dono',
  description:
    'Il Vangelo del giorno commentato da Marcus Bachmann secondo la logica del dono: un paragrafo al giorno sulle letture, dal canone dei suoi libri.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Percorso',
  },
};

export const viewport = {
  themeColor: '#FAF6EE',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <header className="sito">
          <div className="dentro">
            <span className="sigillo" aria-hidden="true">✦ ✠ ✦</span>
            <a href="/" className="logo">Il Vangelo come <em>dono</em></a>
            <p className="motto">Marcus Bachmann · un paragrafo al giorno</p>
            <nav className="principale" aria-label="Navigazione principale">
              <a href="/">Oggi</a>
              <a href="/percorso">Percorso</a>
              <a href="/archivio">Archivio</a>
              <a href="/rss.xml">RSS</a>
              <a href="https://marcus-bachmann.vercel.app" target="_blank" rel="noopener">Marcus Bachmann ↗</a>
              <a href="https://esichia.vercel.app" target="_blank" rel="noopener">Esichia ↗</a>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="sito">
          <div className="fregio" aria-hidden="true">❦</div>
          <em>Dove il dono si gioca, dove si irrigidisce in economia.</em><br />
          Marcus Bachmann scrive in prima persona sulle letture del giorno; ogni paragrafo cita solo il canone dei suoi libri.
        </footer>
        <script src="/sw-register.js" defer></script>
      </body>
    </html>
  );
}
