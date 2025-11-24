"use client";

import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { usePathname } from "next/navigation";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show header/sidebar for auth pages
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/register";
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
}



