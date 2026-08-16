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
    'Il Vangelo del giorno commentato da tre voci — cattolica, protestante, dispensazionalista — e dalla logica del dono di Marcus Bachmann.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <header className="sito">
          <div className="dentro">
            <span className="sigillo" aria-hidden="true">✦ ✠ ✦</span>
            <a href="/" className="logo">Il Vangelo come <em>dono</em></a>
            <p className="motto">tre voci, un solo criterio</p>
            <nav className="principale" aria-label="Navigazione principale">
              <a href="/">Oggi</a>
              <a href="/archivio">Archivio</a>
              <a href="/rss.xml">RSS</a>
              <a href="https://esichia.vercel.app" target="_blank" rel="noopener">Esichia ↗</a>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="sito">
          <div className="fregio" aria-hidden="true">❦</div>
          <em>Dove il dono si gioca, dove si irrigidisce in economia.</em><br />
          Le voci scrivono dal di dentro delle rispettive tradizioni; ogni commento cita solo il proprio canone di fonti.
        </footer>
      </body>
    </html>
  );
}
