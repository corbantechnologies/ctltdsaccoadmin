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
import { updateVentureType } from "@/services/venturetypes";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import toast from "react-hot-toast";

function UpdateVentureType({ isOpen, onClose, refetchVentureTypes, ventureType }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

  if (!ventureType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Venture Type: {ventureType?.name}</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            name: ventureType?.name || "",
            interest_rate: ventureType?.interest_rate || 0,
            gl_account: ventureType?.gl_account || "",
          }}
          enableReinitialize={true}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await updateVentureType(ventureType?.reference, values, token);
              toast?.success("Venture type updated successfully!");
              onClose();
              refetchVentureTypes();
            } catch (error) {
              toast?.error("Failed to update venture type!");
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
                  className="border-black "
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
                  className="border-black "
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
                    <SelectValue placeholder="Select GL Account" />
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
}

export default UpdateVentureType;
