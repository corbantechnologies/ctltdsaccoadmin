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
import { createNextOfKin } from "@/services/nextofkin";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";

function CreateNextOfKin({ onClose, isOpen, refetchAccount }) {
  const token = useAxiosAuth();
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#045e32] text-2xl">
            Add Next of Kin
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            first_name: "",
            last_name: "",
            relationship: "",
            phone: "",
            // Non-compulsory fields
            email: "",
            address: "",
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await createNextOfKin(values, token);
              toast.success("Next of kin added successfully");
              onClose();
              refetchAccount();
            } catch (error) {
              toast.error("Failed to add next of kin. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form className="space-y-6 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="first_name">
                  First Name<sup className="text-red-500">*</sup>
                </Label>
                <Field
                  type="text"
                  id="first_name"
                  name="first_name"
                  component={Input}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="last_name">
                  Last Name<sup className="text-red-500">*</sup>
                </Label>
                <Field
                  type="text"
                  id="last_name"
                  name="last_name"
                  component={Input}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="relationship">
                  Relationship<sup className="text-red-500">*</sup>
                </Label>
                <Field
                  as="select"
                  id="relationship"
                  name="relationship"
                  required
                >
                  <option value="" disabled selected>
                    Select Relationship
                  </option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                </Field>
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone">
                  Phone<sup className="text-red-500">*</sup>
                </Label>
                <Field
                  type="text"
                  id="phone"
                  name="phone"
                  component={Input}
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="email">Email</Label>
              <Field type="email" id="email" name="email" component={Input} />
            </div>
            <div className="space-y-3">
              <Label htmlFor="address">Address</Label>
              <Field
                type="text"
                id="address"
                name="address"
                component={Input}
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#045e32] hover:bg-[#022007] text-white text-base py-2 px-4 w-full sm:w-auto"
                disabled={loading}
              >
                Submit
              </Button>
            </DialogFooter>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNextOfKin;
