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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, Formik } from "formik";
import { updateLoanPenalty } from "@/services/loanpenalties";
import toast from "react-hot-toast";

function UpdateLoanPenalty({ isOpen, onClose, refetchLoan, penalty }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();

  if (!penalty) return null;

  const canWaive = penalty.status === "Pending";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Penalty Status</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            status: penalty.status,
          }}
          enableReinitialize={true}
          onSubmit={async (values) => {
            if (values.status === penalty.status) {
              toast.error("No changes made.");
              return;
            }
            if (values.status !== "Waived") {
              toast.error("Only Waived status is allowed for manual update.");
              return;
            }

            setLoading(true);
            try {
              await updateLoanPenalty(penalty.reference, values, token);
              toast?.success("Penalty waived successfully!");
              onClose();
              if (refetchLoan) refetchLoan();
            } catch (error) {
              console.error("Update Penalty Error:", error);
              const errorData = error?.response?.data;
              if (typeof errorData === "string") {
                toast.error(errorData);
              } else if (errorData?.detail) {
                toast.error(errorData.detail);
              } else if (errorData) {
                const firstErrorKey = Object.keys(errorData)[0];
                const firstError = errorData[firstErrorKey];
                const errorMessage = Array.isArray(firstError)
                  ? firstError[0]
                  : firstError;
                toast.error(
                  `${firstErrorKey.replace(/_/g, " ")}: ${errorMessage}`
                );
              } else {
                toast.error("Failed to waive penalty! ❌");
              }
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label className="text-black">
                  Penalty Code: <span className="font-mono font-bold">{penalty.penalty_code}</span>
                </Label>
                <div className="pt-2">
                  <Label className="text-black">
                    Current Status: <span className="font-bold">{penalty.status}</span>
                  </Label>
                </div>
                <div className="pt-2">
                  <Label htmlFor="status" className="text-black">
                    New Status
                  </Label>
                  <Select
                    value={values.status}
                    onValueChange={(value) => setFieldValue("status", value)}
                    disabled={!canWaive}
                  >
                    <SelectTrigger className="border-black w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending" disabled>Pending</SelectItem>
                      <SelectItem value="Waived">Waived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!canWaive && (
                  <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 p-2 rounded border border-red-100 italic">
                    You cannot update the status of a penalty that has been paid or waived.
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-black text-black hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !canWaive}
                  className="bg-primary hover:bg-[#022007] text-white"
                >
                  {loading ? "Updating..." : "Update Status"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateLoanPenalty;