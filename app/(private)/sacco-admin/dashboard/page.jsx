"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFetchMember, useFetchMembers } from "@/hooks/members/actions";
import { useFetchSavingsTypes } from "@/hooks/savingtypes/actions";
import { useFetchLoanProducts } from "@/hooks/loanproducts/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Wallet,
  CreditCard,
  TrendingUp,
  Plus,
  Loader2,
  ChevronDown,
  User,
  UsersRound,
  FileUp,
  FileDown,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SaccoMembersTable from "@/components/members/SaccoMembersTable";
import CreateMember from "@/forms/members/CreateMember";
import BulkMemberCreate from "@/forms/members/BulkMemberCreate";
import BulkMemberUploadCreate from "@/forms/members/BulkMemberUploadCreate";
import CreateSavingTypeModal from "@/forms/savingtypes/CreateSavingType";
import CreateLoanProduct from "@/forms/loanproducts/CreateLoanProduct";
import { downloadBulkMembersTemplate } from "@/services/members";
import { downloadAccountsListCSV } from "@/services/transactions";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchFeeTypes } from "@/hooks/feetypes/actions";
import CreateFeeTypeModal from "@/forms/feetypes/CreateFeeType";

const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="border border-slate-100 rounded overflow-hidden">
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

export default function SaccoAdminDashboard() {
  const token = useAxiosAuth()
  const { data: myself, isLoading: isLoadingMyself } = useFetchMember();
  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useFetchMembers();
  const {
    data: savingTypes,
    isLoading: isLoadingSavingTypes,
    refetch: refetchSavingTypes,
  } = useFetchSavingsTypes();
  const {
    data: loanProducts,
    isLoading: isLoadingLoanProducts,
    refetch: refetchLoanProducts,
  } = useFetchLoanProducts();
  const {
    data: feeTypes,
    isLoading: isLoadingFeeTypes,
    refetch: refetchFeeTypes,
  } = useFetchFeeTypes();

  const [createMemberOpen, setCreateMemberOpen] = useState(false);
  const [bulkMemberCreateOpen, setBulkMemberCreateOpen] = useState(false);
  const [bulkMemberUploadOpen, setBulkMemberUploadOpen] = useState(false);
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);
  const [createSavingTypeOpen, setCreateSavingTypeOpen] = useState(false);
  const [createLoanProductOpen, setCreateLoanProductOpen] = useState(false);
  const [createFeeTypeOpen, setCreateFeeTypeOpen] = useState(false);



  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-lg">
            Manage members, products, and configurations.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded border shadow-sm">
          {isLoadingMyself ? (
            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
          ) : (
            <p className="text-sm font-medium text-gray-900">
              {myself?.salutation} {myself?.last_name} (Admin)
            </p>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/sacco-admin/members" className="block group">
          <Card className="border-l-4 border-l-[var(--accent)] transition-all hover:shadow-md h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-[var(--accent)]" />
            </CardHeader>
            <CardContent>
              {isLoadingMembers ? (
                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded" />
              ) : (
                <div className="text-xl font-semibold text-slate-900 group-hover:text-[var(--accent)] transition-colors">
                  {members?.length || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link href="/sacco-admin/setup/saving-types" className="block group">
          <Card className="transition-all hover:shadow-md h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saving Types
              </CardTitle>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoadingSavingTypes ? (
                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded" />
              ) : (
                <div className="text-xl font-semibold group-hover:text-green-600 transition-colors">{savingTypes?.length || 0}</div>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link href="/sacco-admin/setup/loan-products" className="block group">
          <Card className="transition-all hover:shadow-md h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Loan Products
              </CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isLoadingLoanProducts ? (
                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded" />
              ) : (
                <div className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                  {loanProducts?.length || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link href="/sacco-admin/setup/feetypes" className="block group">
          <Card className="transition-all hover:shadow-md h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fee Types
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {isLoadingFeeTypes ? (
                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded" />
              ) : (
                <div className="text-xl font-semibold group-hover:text-purple-600 transition-colors">
                  {feeTypes?.length || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="savings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px] h-auto bg-white border">
          <TabsTrigger value="savings">Saving Types</TabsTrigger>
          <TabsTrigger value="loans">Loan Products</TabsTrigger>
          <TabsTrigger value="fee">Fee Types</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* Saving Types Tab */}
        <TabsContent value="savings" className="pt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Saving Types</CardTitle>
              <Button
                size="sm"
                onClick={() => setCreateSavingTypeOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Type
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoadingSavingTypes ? (
                <TableSkeleton rows={4} cols={4} />
              ) : savingTypes?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Can Guarantee</TableHead>
                      <TableHead>Gl Account</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savingTypes.map((type) => (
                      <TableRow key={type.id || type.reference}>
                        <TableCell className="font-medium">
                          {type.name}
                        </TableCell>
                        <TableCell>
                          {type.can_guarantee ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>{type.gl_account || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No saving types found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loan Products Tab */}
        <TabsContent value="loans" className="pt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Loan Products</CardTitle>
              <Button
                size="sm"
                onClick={() => setCreateLoanProductOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Product
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoadingLoanProducts ? (
                <TableSkeleton rows={4} cols={7} />
              ) : loanProducts?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Interest Method</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>GL Principal (Asset)</TableHead>
                      <TableHead>GL Interest (Revenue)</TableHead>
                      <TableHead>GL Penalty (Revenue)</TableHead>
                      <TableHead>GL Processing Fee (Revenue)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanProducts.map((product) => (
                      <TableRow key={product.id || product.reference}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.interest_method}</TableCell>
                        <TableCell>{product.interest_rate}%</TableCell>
                        <TableCell>{product.gl_principal_asset || "-"}</TableCell>
                        <TableCell>{product.gl_interest_revenue || "-"}</TableCell>
                        <TableCell>{product.gl_penalty_revenue || "-"}</TableCell>
                        <TableCell>{product.gl_processing_fee_revenue || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No loan products found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Types Tab */}
        <TabsContent value="fee" className="pt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fee Types</CardTitle>
              <Button
                size="sm"
                onClick={() => setCreateFeeTypeOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Fee Type
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoadingFeeTypes ? (
                <TableSkeleton rows={4} cols={5} />
              ) : feeTypes?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Applies All</TableHead>
                      <TableHead>Exceeds Limit</TableHead>
                      <TableHead>Gl Account</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeTypes.map((type) => (
                      <TableRow key={type.id || type.reference}>
                        <TableCell className="font-medium">
                          {type.name}
                        </TableCell>
                        <TableCell>{type.amount}</TableCell>
                        <TableCell>{type.is_everyone ? "Yes" : "No"}</TableCell>
                        <TableCell>{type.can_exceed_limit ? "Yes" : "No"}</TableCell>
                        <TableCell>{type.gl_account || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No fee types found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="pt-6">
          <div className="flex justify-end mb-4">
            <Popover open={memberPopoverOpen} onOpenChange={setMemberPopoverOpen}>
              <PopoverTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Add Member <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={() => {
                      setCreateMemberOpen(true);
                      setMemberPopoverOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" /> Single Member
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={() => {
                      setBulkMemberCreateOpen(true);
                      setMemberPopoverOpen(false);
                    }}
                  >
                    <UsersRound className="mr-2 h-4 w-4" /> Bulk Member Form
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={() => {
                      setBulkMemberUploadOpen(true);
                      setMemberPopoverOpen(false);
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

                        // Extract filename from Content-Disposition if available, or default to template.csv
                        const contentDisposition = response.headers['content-disposition'];
                        let filename = "bulk_members_template.csv";
                        if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                          const matches = filenameRegex.exec(contentDisposition);
                          if (matches != null && matches[1]) {
                            filename = matches[1].replace(/['"]/g, '');
                          }
                        }

                        // Create a Blob from the CSV data
                        const blob = new Blob([response.data], { type: 'text/csv' });
                        // Create an object URL from the Blob
                        const url = window.URL.createObjectURL(blob);
                        // Create a temporary link element
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', filename);
                        // Append to the body, click, and remove
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        // Clean up the URL object
                        window.URL.revokeObjectURL(url);
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
                        setMemberPopoverOpen(false);
                      } catch (error) {
                        // console.error("Download failed", error);
                        toast.error("Download failed");
                      }
                    }}
                  >
                    <FileDown className="mr-2 h-4 w-4" /> Download Accounts List
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {isLoadingMembers ? (
            <TableSkeleton rows={8} cols={5} />
          ) : (
            <SaccoMembersTable members={members} />
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateMember
        openModal={createMemberOpen}
        closeModal={() => {
          setCreateMemberOpen(false);
          refetchMembers();
        }}
      />
      <BulkMemberCreate
        openModal={bulkMemberCreateOpen}
        closeModal={() => {
          setBulkMemberCreateOpen(false);
          refetchMembers();
        }}
      />
      <BulkMemberUploadCreate
        openModal={bulkMemberUploadOpen}
        closeModal={() => {
          setBulkMemberUploadOpen(false);
          refetchMembers();
        }}
      />
      <CreateSavingTypeModal
        isOpen={createSavingTypeOpen}
        onClose={() => setCreateSavingTypeOpen(false)}
        refetchSavingTypes={refetchSavingTypes}
      />
      <CreateLoanProduct
        isOpen={createLoanProductOpen}
        onClose={() => setCreateLoanProductOpen(false)}
        refetchLoanTypes={refetchLoanProducts}
      />

      <CreateFeeTypeModal
        isOpen={createFeeTypeOpen}
        onClose={() => setCreateFeeTypeOpen(false)}
        refetchFeeTypes={refetchFeeTypes}
      />
    </div>
  );
}
