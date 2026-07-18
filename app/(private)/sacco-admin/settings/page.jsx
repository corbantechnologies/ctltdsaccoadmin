"use client";

import LoadingSpinner from "@/components/general/LoadingSpinner";
import { useFetchMember } from "@/hooks/members/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  CreditCard,
  Shield,
  Clock,
  Wallet,
  Wallet2,
  Briefcase,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import UpdateAccount from "@/forms/member/UpdateAccount";
import ChangePassword from "@/forms/member/ChangePassword";
import NextOfKinTable from "@/components/nextofkin/NextOfKinTable";
import NextOfKinFormDialog from "@/forms/nextofkin/NextOfKinFormDialog";

const SettingsSkeleton = () => (
  <div className="mx-auto p-4 space-y-8 animate-pulse">
    <div className="h-4 w-48 bg-slate-200 rounded" />
    <div className="h-40 bg-slate-200 rounded-lg" />
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="h-64 bg-slate-200 rounded-lg" />
        <div className="h-48 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-64 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

function AccountSettings() {
  const {
    isLoading: isLoadingMember,
    data: member,
    refetch: refetchMember,
  } = useFetchMember();

  const [updateModal, setUpdateModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [nextOfKinModal, setNextOfKinModal] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const InfoField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-4 rounded bg-secondary/50 hover:bg-secondary/80 transition-colors">
      <Icon className="h-5 w-5 text-primary mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-foreground truncate">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  const totalAllocatedPercentage = React.useMemo(() => {
    if (!member?.next_of_kin || member.next_of_kin.length === 0) return 0;
    return member.next_of_kin.reduce((sum, kin) => {
      return sum + (parseFloat(kin.percentage) || 0);
    }, 0);
  }, [member?.next_of_kin]);

  const isPercentageFull = totalAllocatedPercentage >= 100;
  const remainingPercentage = Math.max(0, 100 - totalAllocatedPercentage);

  if (isLoadingMember) {
    return (
      <div className="min-h-screen bg-background">
        <SettingsSkeleton />
      </div>
    );
  }

  // Check if employment data exists
  const hasEmploymentData =
    member?.employment_type || member?.employer || member?.job_title;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto p-4 space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/dashboard">Dashboard</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Account Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarFallback className="bg-primary text-white text-xl font-semibold">
                  {getInitials(member?.first_name, member?.last_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h1 className="text-xl sm:text-xl font-semibold text-foreground mb-2">
                    {member?.first_name} {member?.middle_name} {member?.last_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      Member #{member?.member_no}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(member?.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setUpdateModal(true)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white px-8 w-full sm:w-auto"
                  >
                    Update Account
                  </Button>
                  <Button
                    onClick={() => setPasswordModal(true)}
                    size="sm"
                    variant="destructive"
                    className="px-8 w-full sm:w-auto"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-6 w-6 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <InfoField icon={Mail} label="Email Address" value={member?.email} />
                <InfoField icon={Phone} label="Phone Number" value={member?.phone} />
                <InfoField icon={Calendar} label="Date of Birth" value={formatDate(member?.dob)} />
                <InfoField icon={User} label="Gender" value={member?.gender} />
                <InfoField icon={MapPin} label="County" value={member?.county} />
                <InfoField icon={CreditCard} label="Reference Code" value={member?.reference} />
              </CardContent>
            </Card>

            {/* Only show Employment Details if data exists */}
            {hasEmploymentData && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building className="h-6 w-6 text-primary" />
                    Employment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <InfoField icon={Building} label="Employment Type" value={member?.employment_type} />
                  <InfoField icon={Building} label="Employer" value={member?.employer} />
                  <InfoField icon={Briefcase} label="Job Title" value={member?.job_title} />
                </CardContent>
              </Card>
            )}

            {/* Savings Accounts */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wallet className="h-6 w-6 text-primary" />
                  Savings Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {member?.savings?.length > 0 ? (
                  member.savings.map((account) => (
                    <InfoField
                      key={account.reference}
                      icon={Wallet2}
                      label={`${account.account_type} - ${account.account_number}`}
                      value={`${parseFloat(account.balance).toLocaleString()} KES`}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No savings accounts found.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Loan Accounts */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-6 w-6 text-primary" />
                  Loan Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {member?.loan_accounts?.length > 0 ? (
                  member.loan_accounts.map((account) => (
                    <InfoField
                      key={account.reference}
                      icon={CreditCard}
                      label={`${account.loan_type || "Loan"} - ${account.account_number}`}
                      value={`${parseFloat(account.outstanding_balance || 0).toLocaleString()} KES`}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No active loans.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Next of Kin */}
            <Card className="shadow-md">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-6 w-6 text-primary" />
                  Next of Kin
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({totalAllocatedPercentage}% allocated)
                  </span>
                </CardTitle>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {isPercentageFull ? (
                    <div className="text-sm text-orange-600 font-medium bg-orange-50 px-3 py-2 rounded border border-orange-200">
                      100% Allocated — Cannot add more
                    </div>
                  ) : (
                    <Button
                      onClick={() => setNextOfKinModal(true)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white whitespace-nowrap"
                    >
                      Add New ({remainingPercentage}% left)
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Allocation Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">Total Allocation</span>
                    <span
                      className={
                        totalAllocatedPercentage > 100
                          ? "text-red-600 font-semibold"
                          : "text-primary font-semibold"
                      }
                    >
                      {totalAllocatedPercentage}% / 100%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded transition-all duration-500 ${
                        totalAllocatedPercentage >= 100
                          ? "bg-red-500"
                          : totalAllocatedPercentage >= 80
                          ? "bg-orange-500"
                          : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(totalAllocatedPercentage, 100)}%`,
                      }}
                    />
                  </div>
                  {totalAllocatedPercentage > 100 && (
                    <p className="text-red-600 text-xs mt-1 font-medium">
                      ⚠ Warning: Over 100% allocated!
                    </p>
                  )}
                </div>

                <NextOfKinTable
                  nextofkin={member?.next_of_kin}
                  refetchAccount={refetchMember}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField icon={CreditCard} label="ID Type" value={member?.id_type} />
                <InfoField icon={CreditCard} label="ID Number" value={member?.id_number} />
                <InfoField icon={CreditCard} label="Tax PIN" value={member?.tax_pin} />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-primary" />
                  Account Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded bg-secondary/50">
                  <div className="h-3 w-3 rounded bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Account Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(member?.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded bg-secondary/50">
                  <div className="h-3 w-3 rounded bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Last Updated</p>
                    <p className="text-xs text-muted-foreground">{formatDate(member?.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <UpdateAccount
          isOpen={updateModal}
          onClose={() => setUpdateModal(false)}
          refetchMember={refetchMember}
          member={member}
        />
        <ChangePassword isOpen={passwordModal} onClose={() => setPasswordModal(false)} />
        <NextOfKinFormDialog
          isOpen={nextOfKinModal}
          onClose={() => setNextOfKinModal(false)}
          refetchAccount={refetchMember}
        />
      </div>
    </div>
  );
}

export default AccountSettings;