import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SGP - Sistema de Geração e Correção de Provas | Católica SC',
  description: 'Plataforma para geração de provas, embaralhamento e correção automatizada.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}