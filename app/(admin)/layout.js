import { Sidebar } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar: 
        - Fixed position so it stays visible while scrolling content 
        - Hidden on small screens (md:block)
      */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-card md:block">
        <Sidebar />
      </aside>

      {/* Main Content Wrapper:
        - Pushed over by 64 (16rem/256px) on desktop to make room for sidebar
      */}
      <div className="flex min-h-screen flex-col md:pl-64">
        
        {/* Top Navigation Bar */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}