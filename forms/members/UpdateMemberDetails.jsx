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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, Form, Formik } from "formik";
import toast from "react-hot-toast";
import { updateMemberByAdmin } from "@/services/members";
import { counties } from "@/data/counties";
import DynamicAttributeFields from "@/components/members/DynamicAttributeFields";

function UpdateMemberDetails({ member, isOpen, onClose, refetchMember }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 border-b pb-2">
            Update Member Profile: {member?.first_name} {member?.last_name}
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            salutation: member?.salutation || "",
            first_name: member?.first_name || "",
            middle_name: member?.middle_name || "",
            last_name: member?.last_name || "",
            email: member?.email || "",
            phone: member?.phone || "",
            dob: member?.dob || "",
            gender: member?.gender || "",
            id_type: member?.id_type || "",
            id_number: member?.id_number || "",
            tax_pin: member?.tax_pin || "",
            county: member?.county || "",
            employment_type: member?.employment_type || "",
            employer: member?.employer || "",
            job_title: member?.job_title || "",
            custom_attributes: member?.custom_attributes || {},
          }}
          enableReinitialize={true}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await updateMemberByAdmin(member.member_no, values, token);
              toast.success("Member profile updated successfully!");
              onClose();
              refetchMember();
            } catch (error) {
              const detail = error?.response?.data?.detail || "Failed to update member profile.";
              toast.error(detail);
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section 1: Personal Details */}
                <div className="space-y-4 bg-slate-50/60 p-4 border border-slate-200 rounded-lg">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                    1. Personal Information
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="salutation" className="text-xs font-semibold text-slate-700">
                        Salutation
                      </Label>
                      <Field
                        as="select"
                        name="salutation"
                        id="salutation"
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="">Select</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Miss">Miss</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                        <option value="Prof">Prof</option>
                      </Field>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="first_name" className="text-xs font-semibold text-slate-700">
                        First Name
                      </Label>
                      <Field
                        as={Input}
                        type="text"
                        name="first_name"
                        id="first_name"
                        required
                        className="h-9 border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="middle_name" className="text-xs font-semibold text-slate-700">
                        Middle Name
                      </Label>
                      <Field
                        as={Input}
                        type="text"
                        name="middle_name"
                        id="middle_name"
                        className="h-9 border-slate-300 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="last_name" className="text-xs font-semibold text-slate-700">
                        Last Name
                      </Label>
                      <Field
                        as={Input}
                        type="text"
                        name="last_name"
                        id="last_name"
                        required
                        className="h-9 border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="gender" className="text-xs font-semibold text-slate-700">
                        Gender
                      </Label>
                      <Field
                        as="select"
                        name="gender"
                        id="gender"
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </Field>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dob" className="text-xs font-semibold text-slate-700">
                        Date of Birth
                      </Label>
                      <Field
                        as={Input}
                        type="date"
                        name="dob"
                        id="dob"
                        className="h-9 border-slate-300 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                        Email Address
                      </Label>
                      <Field
                        as={Input}
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="h-9 border-slate-300 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                        Phone Number
                      </Label>
                      <Field
                        as={Input}
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        className="h-9 border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Identification & Local Details */}
                <div className="space-y-4 bg-slate-50/60 p-4 border border-slate-200 rounded-lg">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                    2. Identification & Location
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="id_type" className="text-xs font-semibold text-slate-700">
                        ID Type
                      </Label>
                      <Field
                        as="select"
                        name="id_type"
                        id="id_type"
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="">Select ID Type</option>
                        <option value="National ID">National ID</option>
                        <option value="Passport">Passport</option>
                      </Field>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="id_number" className="text-xs font-semibold text-slate-700">
                        ID Number
                      </Label>
                      <Field
                        as={Input}
                        type="text"
                        name="id_number"
                        id="id_number"
                        className="h-9 border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="tax_pin" className="text-xs font-semibold text-slate-700">
                        Tax/KRA PIN
                      </Label>
                      <Field
                        as={Input}
                        type="text"
                        name="tax_pin"
                        id="tax_pin"
                        className="h-9 border-slate-300 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="county" className="text-xs font-semibold text-slate-700">
                        County
                      </Label>
                      <Field
                        as="select"
                        name="county"
                        id="county"
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="">Select County</option>
                        {counties.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </Field>
                    </div>
                  </div>

                  {/* Section 3: Employment Details */}
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5 pt-2">
                    3. Employment Details
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="employment_type" className="text-xs font-semibold text-slate-700">
                        Type
                      </Label>
                      <Field
                        as="select"
                        name="employment_type"
                        id="employment_type"
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="">Select</option>
                        <option value="Permanent">Permanent</option>
                        <option value="Casual">Casual</option>
                        <option value="Contract">Contract</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Not Employed">Not Employed</option>
                      </Field>
                    </div>

                    <div className="space-y-1 col-span-2">
                      <Label htmlFor="employer" className="text-xs font-semibold text-slate-700">
                        Employer Name
                      </Label>
                      <Field
                        as={Input}
                        type="text"
                        name="employer"
                        id="employer"
                        className="h-9 border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="job_title" className="text-xs font-semibold text-slate-700">
                      Job Title
                    </Label>
                    <Field
                      as={Input}
                      type="text"
                      name="job_title"
                      id="job_title"
                      className="h-9 border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic / Custom SACCO Fields */}
              <div className="bg-slate-50/60 p-4 border border-slate-200 rounded-lg space-y-3">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                  4. Custom Attributes / SACCO Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DynamicAttributeFields values={values} setFieldValue={setFieldValue} />
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:opacity-90 text-white px-8"
                  disabled={loading}
                >
                  {loading ? "Saving Details..." : "Update Profile"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateMemberDetails;
