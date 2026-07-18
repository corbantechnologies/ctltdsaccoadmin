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
import { createSavingType } from "@/services/savingtypes";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import toast from "react-hot-toast";

const CreateSavingTypeModal = ({ isOpen, onClose, refetchSavingTypes }) => {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="">Create New Saving Type</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            name: "",
            interest_rate: 0,
            can_guarantee: true,
            gl_account: "", //GL Account Name
          }}
          onSubmit={async (values) => {
                        try {
                            setLoading(true);
                            await createSavingType(values, token);
                            toast?.success("Saving type created successfully!");
                            onClose();
                            refetchSavingTypes();
                        } catch (error) {
                            toast?.error("Failed to create saving type!");
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
                  disabled={isLoadingGL}
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue
                      placeholder={
                        isLoadingGL ? "Loading..." : "Select GL Account"
                      }
                    />
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
                  disabled={loading || isLoadingGL}
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSavingTypeModal;
