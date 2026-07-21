"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiActions from "@/tools/axios";

export default function DynamicAttributeFields({
  values,
  setFieldValue,
  isMemberUser = false,
  disabled = false,
}) {
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSchema = async () => {
      try {
        const response = await apiActions.get("/api/v1/auth/sacco-config/");
        if (isMounted && response?.data?.custom_member_fields_schema) {
          setSchema(response.data.custom_member_fields_schema);
        }
      } catch (err) {
        console.error("Failed to load dynamic field schema:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSchema();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !schema || schema.length === 0) return null;

  return (
    <div className="space-y-4 col-span-full pt-2">
      <h3 className="text-sm font-semibold text-slate-700 border-b pb-1">
        Additional Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schema.map((field) => {
          const fieldName = field.name;
          const label = field.label || fieldName;
          const fieldType = field.type || "text";
          const isRequired = Boolean(field.required);
          const isReadOnly = disabled || (isMemberUser && field.editable_by_member === false);

          const currentValue = values?.custom_attributes?.[fieldName] ?? "";

          const handleChange = (e) => {
            const val = e.target.value;
            setFieldValue("custom_attributes", {
              ...(values?.custom_attributes || {}),
              [fieldName]: val,
            });
          };

          return (
            <div key={fieldName} className="space-y-2">
              <Label htmlFor={`custom_${fieldName}`} className="text-sm font-medium text-slate-800">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </Label>

              {fieldType === "select" ? (
                <select
                  id={`custom_${fieldName}`}
                  name={`custom_attributes.${fieldName}`}
                  value={currentValue}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">Select {label}</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={fieldType}
                  id={`custom_${fieldName}`}
                  name={`custom_attributes.${fieldName}`}
                  placeholder={`Enter ${label}`}
                  value={currentValue}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className="border-slate-300 rounded text-sm py-2 disabled:bg-slate-100 disabled:text-slate-500"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
