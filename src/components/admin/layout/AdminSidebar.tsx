"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  BarChart,
  Settings,
  Shield,
  MessageSquare,
  Bell,
  Wallet,
  BookOpen,
  Calendar,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { Button } from "@tremor/react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    subItems: [
      { title: "Job Seekers", href: "/admin/users/seekers" },
      { title: "Companies", href: "/admin/users/companies" },
    ],
  },
  {
    title: "Jobs",
    href: "/admin/jobs",
    icon: Briefcase,
    subItems: [
      { title: "All Jobs", href: "/admin/jobs" },
      { title: "Pending Approval", href: "/admin/jobs/pending" },
      { title: "Featured", href: "/admin/jobs/featured" },
      { title: "Rejected", href: "/admin/jobs/rejected" },
    ],
  },
  {
    title: "Applications",
    href: "/admin/applications",
    icon: FileText,
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: BookOpen,
    subItems: [
      { title: "Categories", href: "/admin/content/categories" },
      { title: "Skills", href: "/admin/content/skills" },
      { title: "Locations", href: "/admin/content/locations" },
    ],
  },
  {
    title: "Interviews",
    href: "/admin/interviews",
    icon: Calendar,
  },
  {
    title: "Finance",
    href: "/admin/finance",
    icon: Wallet,
    subItems: [
      { title: "Credits", href: "/admin/finance/credits" },
      { title: "Referrals", href: "/admin/finance/referrals" },
      { title: "Subscriptions", href: "/admin/finance/subscriptions" },
    ],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart,
  },
  {
    title: "Earnings",
    href: "/admin/earnings",
    icon: DollarSign,
  },
  {
    title: "AI Chat",
    href: "/admin/ai-chat",
    icon: MessageSquare,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Admins",
    href: "/admin/admins",
    icon: Shield,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function AdminSidebar({ isOpen, setIsOpen, isCollapsed, toggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Initialize open menus based on current path
  useEffect(() => {
    const activeItem = sidebarItems.find(item => 
      item.subItems?.some(sub => pathname.startsWith(sub.href))
    );
    if (activeItem && !openMenus.includes(activeItem.title)) {
      setOpenMenus(prev => [...prev, activeItem.title]);
    }
  }, [pathname]);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <div className={cn(
          "flex items-center h-16 border-b border-gray-200 dark:border-gray-800 transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "justify-between px-6"
        )}>
          <Link href="/admin/dashboard" className={cn("flex items-center gap-2 font-bold text-xl text-accent-500 dark:text-accent-400 overflow-hidden", isCollapsed && "justify-center")}>
            {isCollapsed ? (
               <span className="text-2xl">A</span>
            ) : (
              <>
                <span className="truncate">Ajira AI</span>
                <span className="text-xs bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 px-2 py-0.5 rounded-full shrink-0">Admin</span>
              </>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Toggle Button (Desktop only) */}
        <div className="hidden lg:flex justify-end p-2 absolute right-0 top-20 z-10">
            <button
                onClick={toggleCollapse}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 shadow-sm"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
        </div>

        <nav className={cn("h-[calc(100vh-4rem)] overflow-y-auto py-4 space-y-1 scrollbar-hide", isCollapsed ? "px-2" : "px-3")}>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href)));
            const isSubItemActive = (href: string) => pathname === href;
            const isOpen = openMenus.includes(item.title);

            return (
              <div key={item.title}>
                {!item.subItems ? (
                  <Link
                    href={item.href}
                    title={isCollapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        if (isCollapsed) {
                          toggleCollapse();
                          if (!isOpen) toggleMenu(item.title);
                        } else {
                          toggleMenu(item.title);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                        isActive ? "text-accent-600 dark:text-accent-400" : "text-gray-600 dark:text-gray-400",
                        isCollapsed && "justify-center px-2 hover:bg-gray-50 dark:hover:bg-gray-800",
                        !isCollapsed && "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown 
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isOpen ? "transform rotate-180" : ""
                          )} 
                        />
                      )}
                    </button>
                    
                    {!isCollapsed && isOpen && (
                      <div className="pl-11 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "block px-3 py-1.5 rounded-md text-sm font-medium transition-colors truncate",
                              isSubItemActive(subItem.href)
                                ? "bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          <div className={cn("pt-4 mt-4 border-t border-gray-200 dark:border-gray-800", isCollapsed ? "px-0" : "px-3")}>
            <Button 
              variant="light" 
              color="red" 
              className={cn("w-full gap-3", isCollapsed ? "justify-center px-0" : "justify-start")}
              icon={LogOut}
              title={isCollapsed ? "Sign Out" : undefined}
            >
              {!isCollapsed && "Sign Out"}
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
}
