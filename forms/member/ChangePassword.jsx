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
import { Label } from "@/components/ui/label";
import { Field, Form, Formik, ErrorMessage } from "formik";
import toast from "react-hot-toast";
import { changePassword } from "@/services/members";
import { PasswordSetupSchema } from "@/validation";
import { Eye, EyeOff, UserPlus } from "lucide-react";

function ChangePassword({ onClose, isOpen }) {
  const token = useAxiosAuth();
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="">Change Password</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            old_password: "",
            password: "",
            confirm_password: "",
          }}
          validationSchema={PasswordSetupSchema}
          onSubmit={async (values) => {
            try {
              setLoading(true);
              await changePassword(values, token);
              toast?.success("Password changed successfully!");
              onClose();
            } catch (error) {
              if (error?.response?.data?.old_password[0]) {
                toast?.error(error?.response?.data?.old_password[0]);
              } else {
                toast?.error("Failed to change password. Please try again.");
              }
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="old_password" className="text-sm font-medium">
                  Old Password *
                </Label>
                <div className="relative">
                  <Field
                    component="input"
                    type={showOldPassword ? "text" : "password"}
                    name="old_password"
                    id="old_password"
                    placeholder="Enter old password"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:ring-2   transition-colors pr-10 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="sr-only">
                      {showOldPassword ? "Hide password" : "Show password"}
                    </span>
                  </button>
                </div>
                <ErrorMessage
                  name="old_password"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password *
                </Label>
                <div className="relative">
                  <Field
                    component="input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="Enter password"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:ring-2   transition-colors pr-10 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Field
                    component="input"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirm password"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:ring-2   transition-colors pr-10 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="bg-primary hover:bg-[#022007] text-white text-base py-2 px-4 w-full sm:w-auto"
                disabled={loading}
              >
                Change Password
              </Button>
            </DialogFooter>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePassword;
