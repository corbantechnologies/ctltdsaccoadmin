import SaccoAdminNavbar from "@/components/saccoadmin/Navbar";
import React from "react";

function SaccoAdminLayout({ children }) {
  return (
    <div className="admin-theme min-h-screen bg-white">
      <SaccoAdminNavbar />
      <main className="md:pl-64">{children}</main>
    </div>
  );
}

export default SaccoAdminLayout;
