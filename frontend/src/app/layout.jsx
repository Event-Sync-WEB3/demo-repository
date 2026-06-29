import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'EventSync',
  description: "Plateforme de gestion d'événements en temps réel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-zinc-100 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 min-h-screen">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
