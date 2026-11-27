"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Full-page layout for a task opened from a list page's Actions menu. */
export default function SubPage({ backHref, backLabel, title, description, icon: Icon, children }) {
    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-4 pb-16">
            <div className="flex items-center gap-3">
                <Link
                    href={backHref}
                    aria-label={`Back to ${backLabel}`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white shadow-sm hover:bg-slate-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <p className="text-[11px] text-slate-400">
                        <Link href={backHref} className="hover:underline">{backLabel}</Link> /
                    </p>
                    <h1 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5 text-[var(--accent)]" />} {title}
                    </h1>
                    {description && <p className="text-xs text-slate-500">{description}</p>}
                </div>
            </div>
            {children}
        </div>
    );
}
