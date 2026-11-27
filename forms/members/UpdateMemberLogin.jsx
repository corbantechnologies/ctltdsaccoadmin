"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiActions } from "@/tools/axios";
import { updateMemberByAdmin } from "@/services/members";

function firstError(data) {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  for (const [field, msgs] of Object.entries(data)) {
    const msg = Array.isArray(msgs) ? msgs[0] : msgs;
    if (msg) return field === "member_no" ? `Member number: ${msg}` : field === "email" ? `Email: ${msg}` : String(msg);
  }
  return null;
}

// Lets an admin fix a member's member number and email, mainly to add an
// email for members onboarded without one so they can get an activation link.
function UpdateMemberLogin({ member, isOpen, onClose, refetchMember }) {
  const token = useAxiosAuth();
  const router = useRouter();
  const [memberNo, setMemberNo] = useState("");
  const [email, setEmail] = useState("");
  const [sendLink, setSendLink] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      setMemberNo(member.member_no || "");
      setEmail(member.email || "");
      setSendLink(!member.email);
    }
  }, [isOpen, member]);

  if (!member) return null;

  const newNo = memberNo.trim();
  const newEmail = email.trim();
  const noChanged = newNo !== (member.member_no || "");
  const emailChanged = newEmail !== (member.email || "");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newNo) return toast.error("Member number cannot be empty.");
    if (!newEmail) return toast.error("Enter an email address.");
    if (!noChanged && !emailChanged && !sendLink) return onClose();

    setSaving(true);
    try {
      const values = {};
      if (noChanged) values.member_no = newNo;
      if (emailChanged) values.email = newEmail;
      let saved = member;
      if (Object.keys(values).length) {
        saved = await updateMemberByAdmin(member.member_no, values, token);
        toast.success("Member updated.");
      }
      if (sendLink) {
        try {
          await apiActions.post("/api/v1/auth/resend-activation/", {
            member_no: saved?.member_no || newNo,
          });
          toast.success(`Activation link sent to ${newEmail}.`);
        } catch {
          toast.error("Saved, but the activation link could not be sent. Try again from the Members page.");
        }
      }
      onClose();
      if (noChanged) {
        router.replace(`/sacco-admin/members/${encodeURIComponent(saved?.member_no || newNo)}`);
      } else {
        refetchMember();
      }
    } catch (error) {
      toast.error(firstError(error?.response?.data) || "Could not update the member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Member number & email</DialogTitle>
          <DialogDescription>
            {member.first_name} {member.last_name}. The member signs in with the member number.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit_member_no">Member number</Label>
            <Input
              id="edit_member_no"
              value={memberNo}
              onChange={(e) => setMemberNo(e.target.value)}
              maxLength={20}
              required
            />
            {noChanged && (
              <p className="text-xs text-amber-700">
                The member will sign in with {newNo || "the new number"} from now on. Let them know.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit_email">Email address</Label>
            <Input
              id="edit_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              required
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={sendLink}
              onChange={(e) => setSendLink(e.target.checked)}
            />
            Send an activation link to this email after saving
          </label>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-primary text-white">
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateMemberLogin;
