"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { addMember } from "@/services/members";
import { Field, Form, Formik } from "formik";
import { useRouter, usePathname } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import DynamicAttributeFields from "@/components/members/DynamicAttributeFields";

function CreateMember({ closeModal, openModal }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Dialog open={openModal} onOpenChange={closeModal}>
      <DialogContent className="w-full h-auto sm:h-auto p-4 sm:p-6 bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold ">
            Create New Member
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            first_name: "",
            last_name: "",
            email: "",
            employer: "", // a select field with options: Tamarind Management Limited, and others. If Tamarind Management Limited, payroll_no is a must
            payroll_no: '', // optional
            phone: "",
            gender: "",
            member_no: "",
          }}
          onSubmit={async (values) => {
            try {
              setLoading(true);
              const response = await addMember(values, token);
              toast?.success("Member created successfully!");
              closeModal();
              // refetchMembers();
              if (pathname.includes('/superuser')) {
                router.push(`/superuser/members/${response?.data?.member_no}`);
              } else {
                router.push(`/sacco-admin/members/${response?.data?.member_no}`);
              }
            } catch (error) {
              toast?.error("Failed to create member!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="member_no"
                    className="text-base text-black font-medium"
                  >
                    Member No (Optional)
                  </Label>
                  <Field
                    as={Input}
                    type="text"
                    name="member_no"
                    id="member_no"
                    placeholder="e.g. SCS-001"
                    className="border-black   rounded text-base py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="first_name"
                    className="text-base text-black font-medium"
                  >
                    First Name
                  </Label>
                  <Field
                    as={Input}
                    type="text"
                    name="first_name"
                    id="first_name"
                    placeholder="John"
                    className="border-black   rounded text-base py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="last_name"
                    className="text-base text-black font-medium"
                  >
                    Last Name
                  </Label>
                  <Field
                    as={Input}
                    type="text"
                    name="last_name"
                    id="last_name"
                    placeholder="Doe"
                    className="border-black   rounded text-base py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-base text-black font-medium"
                  >
                    Gender
                  </Label>
                  <Field
                    as="select"
                    name="gender"
                    id="gender"
                    className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2   transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Field>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="employer"
                    className="text-base text-black font-medium"
                  >
                    Employer
                  </Label>
                  <Field
                    as={Input}
                    type="text"
                    name="employer"
                    id="employer"
                    placeholder="Enter employer name"
                    className="border-black rounded text-base py-2"
                  />
                </div>

                {Boolean(values.employer && values.employer.trim() !== "") && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="payroll_no"
                      className="text-base text-black font-medium"
                    >
                      Payroll Number
                    </Label>
                    <Field
                      as={Input}
                      type="text"
                      name="payroll_no"
                      id="payroll_no"
                      placeholder="e.g. 12345"
                      className="border-black rounded text-base py-2"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-base text-black font-medium"
                  >
                    Phone
                  </Label>
                  <Field
                    as={Input}
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="254700000000"
                    className="border-black   rounded text-base py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-base text-black font-medium"
                  >
                    Email
                  </Label>
                  <Field
                    as={Input}
                    type="email"
                    name="email"
                    id="email"
                    placeholder="jdoe@example.com"
                    className="border-black   rounded text-base py-2"
                  />
                </div>
                <DynamicAttributeFields values={values} setFieldValue={setFieldValue} />
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="border-black text-black hover:bg-gray-100 text-base py-2 px-4 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#ea1315] hover:bg-[#c71012] text-white text-base py-2 px-4 w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Member"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateMember;
