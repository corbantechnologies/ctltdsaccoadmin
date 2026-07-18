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
import { Checkbox } from "@/components/ui/checkbox";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { createFeeType } from "@/services/feetypes";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import toast from "react-hot-toast";

const CreateFeeTypeModal = ({ isOpen, onClose, refetchFeeTypes }) => {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Fee Type</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            name: "",
            amount: "",
            is_everyone: false,
            can_exceed_limit: false, // if true, users can pay more than the amount
            is_active: true,
            gl_account: "", //GLAccount name
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await createFeeType(values, token);
              toast?.success("Fee type created successfully!");
              onClose();
              refetchFeeTypes();
            } catch (error) {
              toast?.error("Failed to create fee type!");
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
                <Label htmlFor="amount" className="text-black">
                  Amount
                </Label>
                <Field
                  as={Input}
                  type="number"
                  id="amount"
                  name="amount"
                  className="border-black "
                  required
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
                <Checkbox
                  id="is_everyone"
                  checked={values.is_everyone}
                  onCheckedChange={(checked) =>
                    setFieldValue("is_everyone", checked)
                  }
                />
                <Label htmlFor="is_everyone" className="text-black">
                  Is it for everyone?
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can_exceed_limit"
                  checked={values.can_exceed_limit}
                  onCheckedChange={(checked) =>
                    setFieldValue("can_exceed_limit", checked)
                  }
                />
                <Label htmlFor="can_exceed_limit" className="text-black">
                  Can exceed amount limit?
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={values.is_active}
                  onCheckedChange={(checked) =>
                    setFieldValue("is_active", checked)
                  }
                />
                <Label htmlFor="is_active" className="text-black">
                  Is Active?
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


export default CreateFeeTypeModal;