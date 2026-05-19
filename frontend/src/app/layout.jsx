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
      <body className="bg-[#f2f4f8] dark:bg-[#0f0f13] text-[#1a1c28] dark:text-[#f2f2f8] transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}