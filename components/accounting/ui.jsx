"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SACCO_CONFIG } from "@/lib/sacco-config";
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

// Step-by-step help shown at the top of each accounting page. Keyed by the
// page's path; the longest matching path wins (so dividend detail pages use
// the dividends guide).
export const ACCOUNTING_GUIDES = {
  "/sacco-admin/accounting/settings": {
    when: "Do this once, before using any other accounting page.",
    steps: [
      "Click \"Create missing accounts\" (or ask your system administrator to run setup_accounting). This adds the GL accounts these features need, such as Suspense, Loan Loss Provision and Retained Earnings. Existing accounts are never changed.",
      "If your chart of accounts already has a suitable account (for example your own Suspense account), pick it in the matching box instead and save.",
      "Leave interest accrual off unless your accountant wants interest booked when it falls due rather than when it is paid.",
      "Mark share capital as non-withdrawable so it can never be paid out as a withdrawal.",
    ],
    caution: "Changing an account here only affects postings made from now on.",
  },
  "/sacco-admin/accounting/reconciliation": {
    when: "Run at any time. It only reads data and never posts anything.",
    steps: [
      "Pick the date you want to check (usually today or a month end).",
      "Each row compares a GL control account with the total of the member records behind it, for example the Savings GL against the sum of all members' savings balances.",
      "A zero difference means the two agree. A difference means something was posted to the GL without a member record, or the reverse, for example opening balances posted straight to Cash at Bank.",
      "Fix a difference with a correcting journal after your accountant has agreed the amount.",
    ],
  },
  "/sacco-admin/accounting/opening-balances": {
    when: "Only when moving a SACCO onto the platform for the first time.",
    steps: [
      "Choose the go-live date at the top. All opening balances are dated that day.",
      "Load member savings first, per member. This creates an \"Opening Balance\" deposit on each member's account, so their statement and the GL agree.",
      "Load everything else (bank, fixed assets, payables, reserves) as GL lines. The balancing side goes to Opening Balance Equity.",
      "Run Reconciliation afterwards to confirm the control accounts agree.",
    ],
    caution: "Opening balances post real entries. Do not use this page for a SACCO that is already live; use a journal instead.",
  },
  "/sacco-admin/accounting/suspense": {
    when: "Whenever money arrives that cannot be applied yet.",
    steps: [
      "Loan overpayments land here automatically, so a loan never goes below zero.",
      "Use the button at the top right to record money you cannot match to a member yet, such as a bank or paybill payment with a wrong reference.",
      "Once you know who it belongs to, open the entry and allocate it to a savings account or a loan, or record a refund.",
      "Aim to keep this list empty at every month end. Open items block a period close until they are resolved or acknowledged.",
    ],
  },
  "/sacco-admin/accounting/month-end": {
    when: "Once a month, after all of the month's payments have been recorded.",
    steps: [
      "Set the date to the last day of the month.",
      "Check the ageing table. It groups loans by days in arrears and shows the provision each group needs.",
      "Click \"Run provisioning\" to book the loan-loss provision. Only the change since the last run is posted.",
      "\"Run interest accrual\" only works when accrual is switched on in Accounting settings.",
    ],
    caution: "Both buttons post to the GL. Running them again on the same date is safe; it posts nothing new.",
  },
  "/sacco-admin/accounting/periods": {
    when: "After month-end, once the accountant has signed off the month.",
    steps: [
      "Resolve open suspense items and any payments that failed to post. The close lists anything outstanding.",
      "Enter the month's start and end dates and close it. Nothing can then be posted into it, and no posted transaction can be moved into or out of it (including backdated payments).",
      "At the financial year end, tick \"Year-end close\" when closing the last period. It also moves the year's net income into Retained Earnings.",
      "Only a superuser can reopen a closed period, and they must give a reason.",
    ],
    caution: "Closing a period stops admins from backdating payments into it. Agree the timing with the treasurer first.",
  },
  "/sacco-admin/accounting/dividends": {
    when: "After the AGM has approved the dividend or interest-on-deposits rate.",
    steps: [
      "Create a draft: pick the saving type, the annual rate and the method (closing balance, or the average of month-end balances).",
      "Open the draft and check each member's amount. Nothing is posted while it is a draft, and you can delete it.",
      "Approve to book the total as Dividends Payable.",
      "Pay members to credit each member's account with their amount less withholding tax. The tax moves to Withholding Tax Payable.",
    ],
    caution: "Approve and Pay post to the GL and cannot be undone from this page.",
  },
};

function guideFor(pathname) {
  const key = Object.keys(ACCOUNTING_GUIDES)
    .filter((k) => pathname === k || pathname?.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return key ? ACCOUNTING_GUIDES[key] : null;
}

function PageGuide({ guide }) {
  if (!guide) return null;
  return (
    <details open className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
      <summary className="cursor-pointer font-semibold text-slate-900">How to use this page</summary>
      <p className="mt-2 text-slate-600">{guide.when}</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {guide.caution && (
        <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-amber-800">{guide.caution}</p>
      )}
    </details>
  );
}

function AccountingDisabled() {
  return (
    <div className="rounded border bg-white p-6 text-sm text-slate-700 space-y-2">
      <h2 className="text-base font-semibold text-slate-900">Advanced accounting is switched off</h2>
      <p>
        Month-end, suspense, period close, dividends, opening balances and reconciliation are not
        enabled for this SACCO yet. Your existing GL, journals, reports and transactions are not
        affected.
      </p>
      <p>
        To switch it on, your system administrator sets <code>NEXT_PUBLIC_ACCOUNTING_ENABLED=true</code> on
        this portal and completes Accounting settings first.
      </p>
    </div>
  );
}

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
  const pathname = usePathname();
  const enabled = SACCO_CONFIG.enableAccounting;
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

        {enabled && (
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
        )}

        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {description && <p className="text-gray-500 mt-1 max-w-3xl">{description}</p>}
          </div>
          {enabled && actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </section>

        {enabled ? (
          <>
            <PageGuide guide={guideFor(pathname)} />
            {children}
          </>
        ) : (
          <AccountingDisabled />
        )}
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
