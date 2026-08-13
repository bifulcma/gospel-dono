import './globals.css';

export const metadata = {
  title: 'Il Vangelo del giorno come dono',
  description:
    'Il Vangelo del giorno commentato da quattro voci — cattolica, ortodossa, protestante, dispensazionalista — sotto il segno della logica del dono.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <header className="sito">
          <div className="dentro">
            <a href="/" className="logo">Il Vangelo come <em>dono</em></a>
            <nav className="principale">
              <a href="/">Oggi</a>
              <a href="/archivio">Archivio</a>
              <a href="/rss.xml">RSS</a>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="sito">
          Quattro voci confessionali, un solo criterio trasversale: dove il dono si gioca, dove si irrigidisce in economia.<br />
          Le voci scrivono dal di dentro delle rispettive tradizioni. Ogni commento cita solo il proprio canone di fonti.
        </footer>
      </body>
    </html>
  );
}
