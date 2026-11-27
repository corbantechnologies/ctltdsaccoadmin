"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

/**
 * One "Actions" button that opens a small menu, instead of a row of buttons
 * across the page header.
 *
 * items: [{ label, description?, icon?: LucideIcon, href?, onClick?, disabled? }]
 * A `null` item draws a divider.
 */
export default function PageActions({ items = [], label = "Actions", align = "end" }) {
    const [open, setOpen] = useState(false);

    const row = (item) => {
        const Icon = item.icon;
        const body = (
            <span className="flex items-start gap-2.5 text-left">
                {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}
                <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800">{item.label}</span>
                    {item.description && (
                        <span className="block text-[11px] leading-snug text-slate-500">{item.description}</span>
                    )}
                </span>
            </span>
        );
        const cls =
            "block w-full rounded-md px-2.5 py-2 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

        if (item.href) {
            return (
                <Link key={item.label} href={item.href} className={cls} onClick={() => setOpen(false)}>
                    {body}
                </Link>
            );
        }
        return (
            <button
                key={item.label}
                type="button"
                className={cls}
                disabled={item.disabled}
                onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                }}
            >
                {body}
            </button>
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 gap-1.5 border-slate-200 bg-white text-xs font-semibold text-slate-700">
                    {label} <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align={align} className="w-72 rounded-lg p-1.5">
                {items.map((item, i) =>
                    item ? row(item) : <div key={`sep-${i}`} className="my-1 h-px bg-slate-100" />
                )}
            </PopoverContent>
        </Popover>
    );
}
