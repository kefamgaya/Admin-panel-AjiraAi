"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { ThemeProvider } from "@/components/ThemeProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-muted/30">
        <AdminSidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          isCollapsed={isCollapsed}
          toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        
        <div 
          className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}



