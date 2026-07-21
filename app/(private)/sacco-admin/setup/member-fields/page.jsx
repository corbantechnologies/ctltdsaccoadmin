"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import apiActions from "@/tools/axios";
import toast from "react-hot-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit, UserCheck, ArrowLeft, Layers } from "lucide-react";

export default function MemberFieldsSetupPage() {
  const router = useRouter();
  const token = useAxiosAuth();
  const [schema, setSchema] = useState([]);
  const [saccoName, setSaccoName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [fieldData, setFieldData] = useState({
    name: "",
    label: "",
    type: "text",
    options: "",
    required: false,
    editable_by_member: true,
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await apiActions.get("/api/v1/auth/sacco-config/");
      if (res?.data) {
        setSaccoName(res.data.sacco_name || "");
        setSchema(res.data.custom_member_fields_schema || []);
      }
    } catch (err) {
      toast.error("Failed to load SACCO configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleOpenAdd = () => {
    setEditIndex(null);
    setFieldData({
      name: "",
      label: "",
      type: "text",
      options: "",
      required: false,
      editable_by_member: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    const item = schema[index];
    setEditIndex(index);
    setFieldData({
      name: item.name || "",
      label: item.label || "",
      type: item.type || "text",
      options: Array.isArray(item.options) ? item.options.join(", ") : "",
      required: Boolean(item.required),
      editable_by_member: item.editable_by_member !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveField = async () => {
    if (!fieldData.name.trim() || !fieldData.label.trim()) {
      toast.error("Field Identifier Name and Display Label are required.");
      return;
    }

    const formattedKey = fieldData.name.trim().toLowerCase().replace(/\s+/g, "_");
    const optionsArray =
      fieldData.type === "select"
        ? fieldData.options.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const newFieldSpec = {
      name: formattedKey,
      label: fieldData.label.trim(),
      type: fieldData.type,
      ...(fieldData.type === "select" ? { options: optionsArray } : {}),
      required: fieldData.required,
      editable_by_member: fieldData.editable_by_member,
    };

    let updatedSchema = [...schema];
    if (editIndex !== null) {
      updatedSchema[editIndex] = newFieldSpec;
    } else {
      updatedSchema.push(newFieldSpec);
    }

    await updateSchemaOnBackend(updatedSchema);
  };

  const handleDeleteField = async (index) => {
    if (!confirm("Are you sure you want to delete this dynamic field?")) return;
    const updatedSchema = schema.filter((_, i) => i !== index);
    await updateSchemaOnBackend(updatedSchema);
  };

  const updateSchemaOnBackend = async (newSchema) => {
    try {
      setSaving(true);
      await apiActions.patch("/api/v1/auth/sacco-config/", {
        custom_member_fields_schema: newSchema,
      });
      toast.success("Member field schema updated successfully!");
      setSchema(newSchema);
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/sacco-admin/setup")}
            className="mb-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Setup Hub
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Dynamic Member Profile Fields
          </h1>
          <p className="text-slate-600 text-sm">
            Configure dynamic fields collected during member onboarding for {saccoName || "your SACCO"}.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="bg-primary hover:opacity-90 text-white font-semibold gap-2">
          <Plus className="w-4 h-4" /> Add Dynamic Field
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-semibold">Configured Member Attributes ({schema.length})</CardTitle>
          <CardDescription>
            These fields automatically appear on Member Registration forms and Profile pages across the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading dynamic fields...</div>
          ) : schema.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="text-sm font-semibold text-slate-700">No Custom Fields Configured</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add custom attributes (e.g. Payroll Number, Route Code, Vehicle Registration) to collect unique tenant data.
              </p>
              <Button onClick={handleOpenAdd} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Create First Field
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold text-slate-700">Display Label</TableHead>
                    <TableHead className="font-bold text-slate-700">Field Key</TableHead>
                    <TableHead className="font-bold text-slate-700">Input Type</TableHead>
                    <TableHead className="font-bold text-slate-700">Required</TableHead>
                    <TableHead className="font-bold text-slate-700">Member Editable</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schema.map((field, idx) => (
                    <TableRow key={field.name || idx}>
                      <TableCell className="font-medium text-slate-900">{field.label}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{field.name}</TableCell>
                      <TableCell className="capitalize text-slate-700">{field.type}</TableCell>
                      <TableCell>
                        {field.required ? (
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-50 text-red-700 rounded border border-red-200">
                            Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] text-slate-500 bg-slate-100 rounded">
                            Optional
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {field.editable_by_member !== false ? (
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-green-50 text-green-700 rounded border border-green-200">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 rounded border border-amber-200">
                            Admin Only
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(idx)}
                          className="h-8 w-8 text-slate-600 hover:text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteField(idx)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Field Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editIndex !== null ? "Edit Dynamic Member Field" : "Add Dynamic Member Field"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="field_label" className="text-xs font-semibold text-slate-700">
                Display Label <span className="text-red-500">*</span>
              </Label>
              <Input
                id="field_label"
                placeholder="e.g. Payroll Number or Route Code"
                value={fieldData.label}
                onChange={(e) => {
                  const labelVal = e.target.value;
                  setFieldData((prev) => ({
                    ...prev,
                    label: labelVal,
                    name: editIndex !== null ? prev.name : labelVal.toLowerCase().replace(/\s+/g, "_"),
                  }));
                }}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="field_name" className="text-xs font-semibold text-slate-700">
                Field Identifier Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="field_name"
                placeholder="e.g. payroll_no"
                value={fieldData.name}
                onChange={(e) => setFieldData((prev) => ({ ...prev, name: e.target.value }))}
                className="font-mono text-sm bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="field_type" className="text-xs font-semibold text-slate-700">
                Input Type
              </Label>
              <select
                id="field_type"
                value={fieldData.type}
                onChange={(e) => setFieldData((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="text">Text Input</option>
                <option value="number">Number Input</option>
                <option value="date">Date Picker</option>
                <option value="select">Dropdown Select</option>
              </select>
            </div>

            {fieldData.type === "select" && (
              <div className="space-y-1">
                <Label htmlFor="field_options" className="text-xs font-semibold text-slate-700">
                  Select Options (Comma separated)
                </Label>
                <Input
                  id="field_options"
                  placeholder="e.g. Option A, Option B, Option C"
                  value={fieldData.options}
                  onChange={(e) => setFieldData((prev) => ({ ...prev, options: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="field_required"
                  checked={fieldData.required}
                  onChange={(e) => setFieldData((prev) => ({ ...prev, required: e.target.checked }))}
                  className="h-4 w-4 rounded accent-primary"
                />
                <Label htmlFor="field_required" className="text-xs font-medium cursor-pointer">
                  Required field during registration
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="field_editable_by_member"
                  checked={fieldData.editable_by_member}
                  onChange={(e) => setFieldData((prev) => ({ ...prev, editable_by_member: e.target.checked }))}
                  className="h-4 w-4 rounded accent-primary"
                />
                <Label htmlFor="field_editable_by_member" className="text-xs font-medium cursor-pointer">
                  Editable by member (Uncheck for Admin-Only editing)
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField} disabled={saving} className="bg-primary text-white">
              {saving ? "Saving..." : "Save Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
