"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, Form, Formik } from "formik";
import toast from "react-hot-toast";
import { createNextOfKin, updateNextOfKin } from "@/services/nextofkin";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";

function NextOfKinFormDialog({
  isOpen,
  onClose,
  refetchAccount,
  nextOfKin = null,
}) {
  const auth = useAxiosAuth();
  const [loading, setLoading] = useState(false);
  const isEdit = !!nextOfKin;

  const initialValues = {
    first_name: nextOfKin?.first_name || "",
    last_name: nextOfKin?.last_name || "",
    relationship: nextOfKin?.relationship || "",
    phone: nextOfKin?.phone || "",
    percentage: nextOfKin?.percentage || "",
    email: nextOfKin?.email || "",
    address: nextOfKin?.address || "",
  };

  const relationshipOptions = [
    "Husband",
    "Wife",
    "Son",
    "Daughter",
    "Father",
    "Mother",
    "Brother",
    "Sister",
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateNextOfKin(nextOfKin?.reference, values, auth);
        toast.success("Next of kin updated successfully");
      } else {
        await createNextOfKin(values, auth);
        toast.success("Next of kin added successfully");
      }
      onClose();
      refetchAccount();
    } catch (error) {
      console.log(error)
      toast.error("Failed to add next of kin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#045e32] text-2xl">
            {isEdit ? "Update" : "Add"} Next of Kin
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          <Form className="space-y-6 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  First Name<sup className="text-red-500">*</sup>
                </Label>
                <Field as={Input} id="first_name" name="first_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Last Name<sup className="text-red-500">*</sup>
                </Label>
                <Field as={Input} id="last_name" name="last_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">
                  Relationship<sup className="text-red-500">*</sup>
                </Label>
                <Field
                  as="select"
                  id="relationship"
                  name="relationship"
                  className="w-full h-10 px-3 border rounded-md"
                  required
                >
                  <option value="" disabled>
                    Select Relationship
                  </option>
                  {relationshipOptions.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </Field>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone<sup className="text-red-500">*</sup>
                </Label>
                <Field as={Input} id="phone" name="phone" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentage">
                Percentage<sup className="text-red-500">*</sup>
              </Label>
              <Field as={Input} id="percentage" name="percentage" required />
            </div>


            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Field as={Input} id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Field as={Input} id="address" name="address" />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#045e32] hover:bg-[#022007] text-white w-full sm:w-auto"
                disabled={loading || !auth.isEnabled}
              >
                {loading ? "Saving..." : isEdit ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default NextOfKinFormDialog;
