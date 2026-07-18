"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";
import { deleteNextOfKin } from "@/services/nextofkin";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import NextOfKinFormDialog from "@/forms/nextofkin/NextOfKinFormDialog";

function NextOfKinTable({ nextofkin = [], refetchAccount }) {
  const auth = useAxiosAuth();
  const [editTarget, setEditTarget] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingRef, setDeletingRef] = useState(null);

  const handleDelete = async (reference) => {
    if (!confirm("Are you sure you want to remove this next of kin?")) return;
    setDeletingRef(reference);
    try {
      await deleteNextOfKin(reference, auth);
      toast.success("Next of kin removed successfully");
      refetchAccount();
    } catch {
      toast.error("Failed to remove next of kin. Please try again.");
    } finally {
      setDeletingRef(null);
    }
  };

  const handleEdit = (kin) => {
    setEditTarget(kin);
    setEditOpen(true);
  };

  if (!nextofkin || nextofkin.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
        <User className="h-10 w-10 opacity-30" />
        <p className="text-sm">No next of kin added yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Relationship</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold text-center">
                Allocation
              </TableHead>
              <TableHead className="font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nextofkin.map((kin) => (
              <TableRow
                key={kin.reference}
                className="hover:bg-secondary/30 transition-colors"
              >
                <TableCell className="font-medium">
                  {kin.first_name} {kin.last_name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary font-medium"
                  >
                    {kin.relationship}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {kin.phone || "N/A"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {kin.email || "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`font-semibold text-sm ${
                      parseFloat(kin.percentage) > 0
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {kin.percentage}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(kin)}
                      className="h-8 w-8 p-0 border-primary/30 hover:bg-primary/10 hover:border-primary"
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(kin.reference)}
                      disabled={deletingRef === kin.reference}
                      className="h-8 w-8 p-0 border-red-300 hover:bg-red-50 hover:border-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NextOfKinFormDialog
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
        }}
        refetchAccount={refetchAccount}
        nextOfKin={editTarget}
      />
    </>
  );
}

export default NextOfKinTable;
