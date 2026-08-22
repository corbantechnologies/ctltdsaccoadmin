"use client";
import SaccoAdminNavbar, { SidebarProvider, useSidebar } from "@/components/saccoadmin/Navbar";
import React from "react";

function SaccoAdminContent({ children }) {
  const { isCollapsed } = useSidebar();
  return (
    <main
      className="transition-all duration-300"
      style={{ paddingLeft: isCollapsed ? 0 : undefined }}
    >
      {/* On desktop, shift content right by sidebar width when open */}
      <div className={`transition-all duration-300 w-full min-w-0 ${isCollapsed ? "md:pl-0" : "md:pl-64"}`}>
        {children}
      </div>
    </main>
  );
}

function SaccoAdminLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="admin-theme min-h-screen bg-background w-full overflow-x-hidden">
        <SaccoAdminNavbar />
        <SaccoAdminContent>{children}</SaccoAdminContent>
      </div>
    </SidebarProvider>
  );
}

export default SaccoAdminLayout;
