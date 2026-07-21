"use client";

import { useRouter, usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CheckCircle, Clock, Search } from "lucide-react";
import Link from "next/link";
import apiActions from "@/tools/axios";
import toast from "react-hot-toast";

const getPageNumbers = (currentPage, totalPages) => {
  return [currentPage];
};;;


function SaccoMembersTable({ members }) {
  const router = useRouter();
  const pathname = usePathname();
  const baseRoute = pathname?.includes("/superuser") ? "/superuser/members" : "/sacco-admin/members";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Filter members by search term and status
  const filteredMembers =
    members?.filter((member) => {
      const fullName =
        `${member?.salutation} ${member?.first_name} ${member?.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && member?.is_approved) ||
        (statusFilter === "pending" && !member?.is_approved);
      return matchesSearch && matchesStatus;
    }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl ">Members List</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label
              htmlFor="search"
              className="text-base text-black font-medium sr-only"
            >
              Search Members
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-10 border-black   rounded text-base"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Label
              htmlFor="status-filter"
              className="text-base text-black font-medium sr-only"
            >
              Filter by Status
            </Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2   transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredMembers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black">Member No</TableHead>
                    <TableHead className="text-black">Name</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                    <TableHead className="text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.map((member) => (
                    <TableRow key={member?.reference}>
                      <TableCell className="font-medium">
                        <Link
                          href={`${baseRoute}/${member?.member_no}`}
                        >
                          {member?.member_no}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${baseRoute}/${member?.member_no}`}
                        >
                          {member?.first_name} {member?.last_name}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            member?.is_approved ? "default" : "secondary"
                          }
                          className={
                            member?.is_approved
                              ? "bg-primary text-white"
                              : "bg-gray-200 text-gray-800"
                          }
                        >
                          {member?.is_approved ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {member?.is_approved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            router.push(
                              `${baseRoute}/${member?.member_no}`
                            );
                          }}
                          className="bg-[#ea1315] hover:bg-[#c71012] text-white"
                        >
                          Manage
                        </Button>
                        {member?.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const toastId = toast.loading("Sending activation link...");
                                await apiActions.post("/api/v1/auth/resend-activation/", {
                                  member_no: member?.member_no,
                                });
                                toast.success(`Activation link sent to ${member?.email}`, { id: toastId });
                              } catch (err) {
                                toast.error("Failed to resend activation link.");
                              }
                            }}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            Resend Link
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredMembers.length)}{" "}
                of {filteredMembers.length} members
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-black text-black hover:bg-gray-100"
                >
                  Previous
                </Button>
                {getPageNumbers(currentPage, totalPages).map((page, index) => page === "..." ? <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-400 text-sm select-none">...</span> : (((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={
                        currentPage === page
                          ? "bg-[#ea1315] text-white hover:bg-[#c71012]"
                          : "border-black text-black hover:bg-gray-100"
                      }
                    >
                      {page}
                    </Button>
                  ))(page)))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-black text-black hover:bg-gray-100"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">No members found.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default SaccoMembersTable;