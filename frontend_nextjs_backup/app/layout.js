import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'Propiedades Turísticas RD | Bienes Raíces en República Dominicana',
  description: 'Encuentra las mejores propiedades en República Dominicana. Villas, apartamentos, casas y terrenos en Punta Cana, Santo Domingo, Samaná y más.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
