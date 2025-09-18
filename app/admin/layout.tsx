
import type { ReactNode } from 'react';
import AdminSidebar from '@/components/layout/admin-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-secondary/50">
        <Header />
        <div className="flex min-h-[calc(100vh-4rem)] pt-16">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
