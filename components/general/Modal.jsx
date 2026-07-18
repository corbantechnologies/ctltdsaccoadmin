"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A reusable, pure Tailwind CSS Modal component.
 * Replaces Radix UI / Shadcn Dialog.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback when the modal should close
 * @param {string} props.title - Modal title
 * @param {string} props.description - Optional subtitle/description
 * @param {string} props.maxWidth - Tailwind max-w class (default: "max-w-md")
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Optional footer content
 * @param {boolean} props.showCloseButton - Whether to show the X button (default: true)
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    maxWidth = "max-w-md",
    children,
    footer,
    showCloseButton = true
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isMounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative bg-white rounded shadow-2xl w-full ${maxWidth} max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-white shrink-0">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-slate-900 leading-none">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-slate-500 font-medium">
                                {description}
                            </p>
                        )}
                    </div>
                    {showCloseButton && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 rounded hover:bg-slate-100 transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-500" />
                        </Button>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="bg-slate-50/80 p-4 border-t flex justify-end gap-3 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
