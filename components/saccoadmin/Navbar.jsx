import { SACCO_CONFIG } from "@/lib/sacco-config";
"use client";

import { Button } from "@/components/ui/button";
import { Menu as MenuIcon, X as XIcon, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import React, { useState } from "react";

const MENU_LINKS = [
  { label: "Dashboard", href: "/sacco-admin/dashboard" },
  // Members
  {
    label: "Members",
    href: "/sacco-admin/members",
  },
  // Products
  {
    label: "Savings & Deposits",
    href: "/sacco-admin/saving-accounts",
    children: [
      { label: "All Accounts", href: "/sacco-admin/saving-accounts" },
      { label: "All Deposits", href: "/sacco-admin/saving-deposits" },
      { label: "Savings Types", href: "/sacco-admin/setup/saving-types" },
    ],
  },
  {
    label: "Fees",
    href: "/sacco-admin/fee-payments",
    children: [
      { label: "All Accounts", href: "/sacco-admin/fee-payments" },
      { label: "Fee Types", href: "/sacco-admin/setup/feetypes" },
    ],
  },
  {
    label: "Loans",
    href: "/sacco-admin/loans",
    children: [
      { label: "Active Loans", href: "/sacco-admin/loans" },
      { label: "Loan Applications", href: "/sacco-admin/loan-applications" },
      { label: "Loan Products", href: "/sacco-admin/setup/loan-products" },
    ],
  },
  // Accounting & Reports
  {
    label: "Accounting & Financials",
    href: "/sacco-admin/accounting",
    children: [
      { label: "Accounting Dashboard", href: "/sacco-admin/accounting" },
      { label: "Reports", href: "/sacco-admin/reports" },
      { label: "GL Accounts", href: "/sacco-admin/setup/gl-accounts" },
      { label: "Payment Accounts", href: "/sacco-admin/setup/payment-accounts" },
      { label: "Accounts & Transactions", href: "/sacco-admin/transactions" },
    ],
  },
  // Setup
  {
    label: "Setup & Configuration",
    href: "/sacco-admin/setup",
    children: [
      { label: "Onboarding", href: "/sacco-admin/onboarding" },
      { label: "Platform Setup", href: "/sacco-admin/setup" },

    ],
  },
  // Personal
  {
    label: "Personal",
    href: "/sacco-admin/personal",
    children: [
      { label: "Personal Profile", href: "/sacco-admin/personal" },
      { label: "General Settings", href: "/sacco-admin/settings" },
      { label: "Guarantor Profile", href: "/sacco-admin/personal/guarantorprofile" },
    ],
  }
];

const NavItem = ({ link, setIsMenuOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (setIsMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  if (link.children) {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-2.5 text-[14px] font-semibold hover:bg-slate-50 rounded transition-colors text-left group"
        >
          <span className="group-hover:text-[var(--accent)]">{link.label}</span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isOpen && (
          <div className="ml-4 mt-1 mb-2 flex flex-col border-l border-slate-100 pl-3 space-y-1">
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="px-3 py-1.5 text-[13px] text-slate-600 hover:text-[var(--accent)] hover:bg-slate-50 rounded transition-colors"
                onClick={handleClick}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={link.href}
      className="block px-4 py-2.5 text-[14px] font-semibold hover:bg-slate-50 hover:text-[var(--accent)] rounded transition-colors"
      onClick={handleClick}
    >
      {link.label}
    </Link>
  );
};

export default function SaccoAdminNavbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (setIsMenuOpen) => (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b flex items-center justify-between">
        <Link
          href="/sacco-admin/dashboard"
          className="flex items-center gap-2"
          onClick={() => setIsMenuOpen && setIsMenuOpen(false)}
        >
          <span className="text-xl font-semibold tracking-tight text-[var(--accent)]">
            {SACCO_CONFIG.name}
            <span className="text-[10px] font-normal uppercase tracking-[2px] opacity-75 ml-1.5 block">ADMIN</span>
          </span>
        </Link>
        {setIsMenuOpen && (
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="md:hidden">
            <XIcon className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {MENU_LINKS.map((link) => (
          <NavItem key={link.href} link={link} setIsMenuOpen={setIsMenuOpen} />
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded font-semibold"
          onClick={() => {
            if (setIsMenuOpen) setIsMenuOpen(false);
            signOut({ callbackUrl: "/login" });
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Navbar */}
      <header className="bg-[var(--accent)] text-white sticky top-0 z-30 shadow h-16 flex items-center justify-between px-4 md:px-6 md:ml-64">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 mr-1 md:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
          <Link href="/sacco-admin/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">
              {SACCO_CONFIG.name}
              <span className="text-[10px] font-normal uppercase tracking-[2px] opacity-75 ml-1.5">ADMIN</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar (Slides in from Left) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-2xl flex flex-col transition-transform duration-300 md:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {sidebarContent(setIsMobileOpen)}
      </div>

      {/* Desktop Sidebar (Persistent on the Left) */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-white border-r shadow-sm">
        {sidebarContent(null)}
      </aside>

      {/* Overlay for mobile drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}