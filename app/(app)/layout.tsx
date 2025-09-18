import type { ReactNode } from 'react';
import Header from '@/components/layout/header';
import Navigation from '@/components/layout/navigation';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary/50">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 pt-20 pb-24 md:p-6 md:pt-24 md:pb-20">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
      <Navigation />
    </div>
  );
}
