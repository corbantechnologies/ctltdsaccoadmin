"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { updateSavingType } from "@/services/savingtypes";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import toast from "react-hot-toast";

const UpdateSavingTypeModal = ({ isOpen, onClose, refetchSavingTypes, savingType }) => {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

  if (!savingType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Saving Type: {savingType?.name}</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            name: savingType?.name || "",
            interest_rate: savingType?.interest_rate || 0,
            can_guarantee: savingType?.can_guarantee ?? true,
            gl_account: savingType?.gl_account || "",
          }}
          enableReinitialize={true}
          onSubmit={async (values) => {
            try {
              setLoading(true);
              await updateSavingType(savingType?.reference, values, token);
              toast?.success("Saving type updated successfully!");
              onClose();
              refetchSavingTypes();
            } catch (error) {
              toast?.error("Failed to update saving type!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black">
                  Name
                </Label>
                <Field
                  as={Input}
                  id="name"
                  name="name"
                  className="border-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_rate" className="text-black">
                  Interest Rate (%)
                </Label>
                <Field
                  as={Input}
                  type="number"
                  id="interest_rate"
                  name="interest_rate"
                  className="border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gl_account" className="text-black">
                  GL Account
                </Label>
                <Select
                  value={values.gl_account}
                  onValueChange={(value) => setFieldValue("gl_account", value)}
                  // disabled={true}
                >
                  <SelectTrigger className="border-black w-full bg-gray-50">
                    <SelectValue placeholder="GL Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {glAccounts?.map((acc) => (
                      <SelectItem key={acc.id || acc.reference} value={acc.name}>
                        {acc.name} ({acc.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Field
                  type="checkbox"
                  id="can_guarantee"
                  name="can_guarantee"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="can_guarantee" className="text-black">
                  Can be used as guarantee?
                </Label>
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
                  className="bg-[#ea1315] hover:bg-[#c71012] text-white"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSavingTypeModal;
