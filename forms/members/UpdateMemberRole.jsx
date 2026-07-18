"use client";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, Formik } from "formik";
import { updateMemberRoles } from "@/services/members";
import toast from "react-hot-toast";

function UpdateMemberRole({ isOpen, onClose, refetchMember, member }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="">
            Update Member Roles
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            is_member: member?.is_member || false,
            is_sacco_admin: member?.is_sacco_admin || false,
            // is_sacco_staff: member?.is_sacco_staff || false,
            // is_treasurer: member?.is_treasurer || false,
            // is_bookkeeper: member?.is_bookkeeper || false,
          }}
          enableReinitialize
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await updateMemberRoles(member.member_no, values, token);
              toast.success("Roles updated successfully!");
              onClose();
              refetchMember();
            } catch (error) {
              toast.error(error?.response?.data?.message || "Failed to update roles!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="space-y-4 py-4 px-2">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="is_member" 
                    checked={values.is_member} 
                    onCheckedChange={(checked) => setFieldValue("is_member", checked)} 
                  />
                  <Label htmlFor="is_member" className="font-medium cursor-pointer text-base">Member</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="is_sacco_admin" 
                    checked={values.is_sacco_admin} 
                    onCheckedChange={(checked) => setFieldValue("is_sacco_admin", checked)} 
                  />
                  <Label htmlFor="is_sacco_admin" className="font-medium cursor-pointer text-base">SACCO Admin</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 sm:flex-none border-black text-black hover:bg-gray-100 text-sm sm:text-base py-2 px-3 sm:px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="bg-primary hover:bg-[#022007] text-white flex-1 sm:flex-none text-sm sm:text-base py-2 px-3 sm:px-4"
                >
                  {loading ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateMemberRole;