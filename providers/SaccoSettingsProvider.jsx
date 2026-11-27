"use client";

import { applySaccoSettings } from "@/lib/sacco-config";

// Puts the SACCO Settings loaded on the server into SACCO_CONFIG in the
// browser before any page or menu below it renders.
export default function SaccoSettingsProvider({ settings, children }) {
  applySaccoSettings(settings);
  return children;
}
