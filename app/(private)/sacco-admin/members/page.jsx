"use client";

import SaccoMembersTable from "@/components/members/SaccoMembersTable";
import StatsCard from "@/components/saccoadmin/StatsCard";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateMember from "@/forms/members/CreateMember";
import BulkMemberCreate from "@/forms/members/BulkMemberCreate";
import BulkMemberUploadCreate from "@/forms/members/BulkMemberUploadCreate";
import { useFetchMembers } from "@/hooks/members/actions";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadBulkMembersTemplate } from "@/services/members";
import { downloadAccountsListCSV } from "@/services/transactions";
import { User, Users, FileUp, FileDown, UsersRound, ChevronDown, UserPlus, Clock } from "lucide-react";
import React, { useState } from "react";

const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="border border-slate-100 rounded overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <div
                    className="h-4 bg-slate-200 rounded animate-pulse"
                    style={{ width: `${Math.floor(((rowIndex + colIndex) % 5) * 10) + 40}%` }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

function Members() {
  const [memberCreateModal, setMemberCreateModal] = useState(false);
  const [bulkMemberCreateModal, setBulkMemberCreateModal] = useState(false);
  const [bulkMemberUploadCreateModal, setBulkMemberUploadCreateModal] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const token = useAxiosAuth();

  const {
    isLoading: isLoadingMembers,
    data: members,
    refetch: refetchMembers,
  } = useFetchMembers();

  // Calculate pending approvals
  const pendingApprovals =
    members?.filter((member) => !member?.is_approved).length || 0;

  // Calculate members joined this month
  const joinedThisMonth =
    members?.filter((member) => {
      if (!member?.created_at) return false;
      const date = new Date(member.created_at);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length || 0;

  const skeletonValue = <div className="h-7 w-16 bg-slate-200 animate-pulse rounded" />;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-xl lg:text-xl font-semibold ">
              Members
            </h1>
            <p className="text-gray-500 mt-1">Manage your members</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button className="bg-primary hover:bg-[#022007] text-white text-sm sm:text-base py-2 px-3 sm:px-4 flex-1 sm:flex-none">
                  <User className="h-4 w-4 mr-2" /> New Member <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={() => {
                      setMemberCreateModal(true);
                      setPopoverOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" /> Single Member
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={() => {
                      setBulkMemberCreateModal(true);
                      setPopoverOpen(false);
                    }}
                  >
                    <UsersRound className="mr-2 h-4 w-4" /> Bulk Member Form
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={() => {
                      setBulkMemberUploadCreateModal(true);
                      setPopoverOpen(false);
                    }}
                  >
                    <FileUp className="mr-2 h-4 w-4" /> Bulk CSV Upload
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={async () => {
                      try {
                        const response = await downloadBulkMembersTemplate(token);

                        const contentDisposition = response.headers['content-disposition'];
                        let filename = "bulk_members_template.csv";
                        if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                          const matches = filenameRegex.exec(contentDisposition);
                          if (matches != null && matches[1]) {
                            filename = matches[1].replace(/['"]/g, '');
                          }
                        }

                        const blob = new Blob([response.data], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', filename);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        window.URL.revokeObjectURL(url);
                        setPopoverOpen(false);
                      } catch (error) {
                        // console.error("Download failed", error);
                        toast.error("Download failed");
                      }
                    }}
                  >
                    <FileUp className="mr-2 h-4 w-4" /> Download CSV Template
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={async () => {
                      try {
                        await downloadAccountsListCSV(token);
                        setPopoverOpen(false);
                      } catch (error) {
                        // console.error("Download failed", error);
                        toast.error("Download failed");
                      }
                    }}
                  >
                    <FileDown className="mr-2 h-4 w-4" /> Download Accounts List
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={() => {
                      const activeMembers = members?.filter((m) => m.is_active) || [];
                      if (activeMembers.length === 0) {
                        toast.error("No active members found!");
                        setPopoverOpen(false);
                        return;
                      }

                      // Create CSV content
                      const csvRows = [
                        ["Member Name", "Member Number", "Email"],
                        ...activeMembers.map((m) => [
                          `${m.first_name} ${m.middle_name || ""} ${m.last_name}`.replace(/\s+/g, " ").trim(),
                          m.member_no || "",
                          m.email || "",
                        ])
                      ];

                      const csvContent = csvRows
                        .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
                        .join("\n");

                      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.setAttribute("download", "active_members_list.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      setPopoverOpen(false);
                      toast.success("Active members list downloaded!");
                    }}
                  >
                    <FileDown className="mr-2 h-4 w-4" /> Download Active Members
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <StatsCard
            title="Total Members"
            value={isLoadingMembers ? skeletonValue : members?.length || 0}
            Icon={Users}
            description="Active members in the system"
          />
          <StatsCard
            title="Joined This Month"
            value={isLoadingMembers ? skeletonValue : joinedThisMonth}
            Icon={UserPlus}
            description="Members registered this month"
          />
          <StatsCard
            title="Pending Approvals"
            value={isLoadingMembers ? skeletonValue : pendingApprovals}
            Icon={Clock}
            description="Members awaiting approval"
          />
        </div>

        {/* Members Table */}
        {isLoadingMembers ? (
          <TableSkeleton rows={8} cols={4} />
        ) : (
          <SaccoMembersTable members={members} refetchMembers={refetchMembers} />
        )}

        {/* Member Create Modals */}
        <CreateMember
          openModal={memberCreateModal}
          closeModal={() => setMemberCreateModal(false)}
        />
        <BulkMemberCreate
          openModal={bulkMemberCreateModal}
          closeModal={() => setBulkMemberCreateModal(false)}
        />
        <BulkMemberUploadCreate
          openModal={bulkMemberUploadCreateModal}
          closeModal={() => setBulkMemberUploadCreateModal(false)}
        />
      </div>
    </div>
  );
}

export default Members;
