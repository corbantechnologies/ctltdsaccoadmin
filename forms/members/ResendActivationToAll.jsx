"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiActions } from "@/tools/axios";

const URL = "/api/v1/auth/resend-activation/all/";

// Sends a fresh activation link to every member with an email address.
// The API sends them in batches of 100, so a large SACCO can take a minute.
function ResendActivationToAll({ token }) {
  const [open, setOpen] = useState(false);
  const [recipients, setRecipients] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRecipients(null);
    apiActions
      .get(URL, token)
      .then((res) => setRecipients(res?.data?.recipients ?? 0))
      .catch(() => {
        toast.error("Could not count members. Please try again.");
        setOpen(false);
      });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    setSending(true);
    const toastId = toast.loading(`Sending activation links to ${recipients} members...`);
    try {
      const res = await apiActions.post(URL, {}, { ...token, timeout: 280000 });
      const { sent = 0, failed = 0 } = res?.data || {};
      if (failed > 0) {
        toast.error(`Sent ${sent} links. ${failed} could not be sent, please try again later.`, { id: toastId, duration: 8000 });
      } else {
        toast.success(`Activation links sent to ${sent} members.`, { id: toastId, duration: 6000 });
      }
      setOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to send activation links.";
      toast.error(msg, { id: toastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-slate-300 text-slate-700 hover:bg-slate-50 text-sm sm:text-base py-2 px-3 sm:px-4 flex-1 sm:flex-none"
      >
        <Mail className="h-4 w-4 mr-2" /> Resend Link to All
      </Button>

      <Dialog open={open} onOpenChange={(v) => !sending && setOpen(v)}>
        <DialogContent className="sm:max-w-[460px] p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Resend activation link to all members?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 pt-2 space-y-2">
              {recipients === null ? (
                <span>Counting members...</span>
              ) : (
                <>
                  <span className="block">
                    A new activation link will be emailed to <strong>{recipients}</strong> member{recipients === 1 ? "" : "s"} with an email address. Members without an email are skipped.
                  </span>
                  <span className="block">
                    Members who already use the portal can ignore the email. Opening the link only lets them set a new password.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button
              onClick={send}
              disabled={sending || !recipients}
              className="bg-primary hover:bg-[var(--primary-hover)] text-white"
            >
              {sending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                `Send to ${recipients ?? "..."} members`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ResendActivationToAll;
