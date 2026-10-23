"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const ACCOUNTING_LINKS = [
  { label: "Month-end", href: "/sacco-admin/accounting/month-end" },
  { label: "Suspense", href: "/sacco-admin/accounting/suspense" },
  { label: "Periods", href: "/sacco-admin/accounting/periods" },
  { label: "Dividends", href: "/sacco-admin/accounting/dividends" },
  { label: "Opening balances", href: "/sacco-admin/accounting/opening-balances" },
  { label: "Reconciliation", href: "/sacco-admin/accounting/reconciliation" },
  { label: "Settings", href: "/sacco-admin/accounting/settings" },
];

export function money(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(n);
}

export function apiError(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (Array.isArray(data?.detail)) return data.detail.join(" ");
  if (data.detail) return data.detail;
  const first = Object.entries(data)[0];
  if (first) {
    const [field, msg] = first;
    return `${field}: ${Array.isArray(msg) ? msg.join(" ") : JSON.stringify(msg)}`;
  }
  return fallback;
}

export function PageShell({ title, description, crumbs = [], actions, children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto p-4 sm:p-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/accounting">Accounting</BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.map((c) => (
              <span key={c.label} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {c.href ? (
                    <BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{c.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <nav className="flex flex-wrap gap-2">
          {ACCOUNTING_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs font-medium px-3 py-1.5 rounded border bg-white hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {description && <p className="text-gray-500 mt-1 max-w-3xl">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </section>

        {children}
      </div>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading...
    </div>
  );
}

export function Empty({ children }) {
  return <p className="p-6 text-sm text-slate-500">{children}</p>;
}

export function StatusBadge({ status }) {
  const colors = {
    Open: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Closed: "bg-slate-100 text-slate-700 border-slate-300",
    Draft: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-blue-50 text-blue-700 border-blue-200",
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-slate-100 text-slate-500 border-slate-200",
    Unallocated: "bg-amber-50 text-amber-700 border-amber-200",
    "Partially Allocated": "bg-blue-50 text-blue-700 border-blue-200",
    Allocated: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Reversed: "bg-red-50 text-red-700 border-red-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    "No Payout Account": "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
        colors[status] || "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

export const inputClass =
  "w-full h-9 rounded border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30";

export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
