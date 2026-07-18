import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronsUpDown,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const AccountsListTable = ({ accountsList }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSavingsTypes, setSelectedSavingsTypes] = useState([]);
  const [selectedFeeTypes, setSelectedFeeTypes] = useState([]);
  const [selectedLoanTypes, setSelectedLoanTypes] = useState([]);
  const [openSavings, setOpenSavings] = useState(false);
  const [openFees, setOpenFees] = useState(false);
  const [openLoans, setOpenLoans] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const data = accountsList?.results || accountsList || [];

  // Extract unique types
  const allSavingsTypes = useMemo(() => {
    const types = new Set();
    data.forEach((user) =>
      user.savings_accounts?.forEach(([, type]) => types.add(type))
    );
    return Array.from(types).sort();
  }, [data]);

  const allFeeTypes = useMemo(() => {
    const types = new Set();
    data.forEach((user) =>
      user.fee_accounts?.forEach(([, type]) => types.add(type))
    );
    return Array.from(types).sort();
  }, [data]);

  const allLoanTypes = useMemo(() => {
    const types = new Set();
    data.forEach((user) =>
      user.loan_accounts?.forEach(([, type]) => types.add(type))
    );
    return Array.from(types).sort();
  }, [data]);

  // Determine which types actually have non-zero data
  const activeSavingsTypes = useMemo(() => {
    const active = new Set();
    data.forEach((user) =>
      user.savings_accounts?.forEach(([_, type, balance]) => {
        if (parseFloat(balance) !== 0) active.add(type);
      })
    );
    return allSavingsTypes.filter((type) => active.has(type));
  }, [data, allSavingsTypes]);

  const activeFeeTypes = useMemo(() => {
    const active = new Set();
    data.forEach((user) =>
      user.fee_accounts?.forEach(([_, type, balance]) => {
        if (parseFloat(balance) !== 0) active.add(type);
      })
    );
    return allFeeTypes.filter((type) => active.has(type));
  }, [data, allFeeTypes]);

  const activeLoanTypes = useMemo(() => {
    const active = new Set();
    data.forEach((user) =>
      user.loan_accounts?.forEach(([_, type, balance]) => {
        if (parseFloat(balance) !== 0) active.add(type);
      })
    );
    return allLoanTypes.filter((type) => active.has(type));
  }, [data, allLoanTypes]);

  // Visible types: respect filters, but default to active ones (hide zero-balance types if no filter)
  const visibleSavingsTypes =
    selectedSavingsTypes.length > 0 ? selectedSavingsTypes : activeSavingsTypes.length > 0 ? activeSavingsTypes : allSavingsTypes;

  const visibleFeeTypes =
    selectedFeeTypes.length > 0 ? selectedFeeTypes : activeFeeTypes.length > 0 ? activeFeeTypes : allFeeTypes;

  const visibleLoanTypes =
    selectedLoanTypes.length > 0 ? selectedLoanTypes : activeLoanTypes.length > 0 ? activeLoanTypes : allLoanTypes;

  // Filtered members
  const filteredAccounts = useMemo(() => {
    return data.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        user.member_no.toLowerCase().includes(searchLower) ||
        user.member_name.toLowerCase().includes(searchLower);

      const matchesSavings =
        selectedSavingsTypes.length === 0 ||
        user.savings_accounts?.some(([, type]) =>
          selectedSavingsTypes.includes(type)
        );

      const matchesFees =
        selectedFeeTypes.length === 0 ||
        user.fee_accounts?.some(([, type]) =>
          selectedFeeTypes.includes(type)
        );

      const matchesLoans =
        selectedLoanTypes.length === 0 ||
        user.loan_accounts?.some(([, type]) => selectedLoanTypes.includes(type));

      return matchesSearch && matchesSavings && matchesFees && matchesLoans;
    });
  }, [
    data,
    searchTerm,
    selectedSavingsTypes,
    selectedFeeTypes,
    selectedLoanTypes,
  ]);

  // Helper: find account by type
  const getAccount = (accounts, type) =>
    (accounts || []).find(([, t]) => t === type);

  // Format balance
  const formatBalance = (value) =>
    parseFloat(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Toggle expansion
  const toggleRow = (memberNo) => {
    setExpandedRows((prev) => ({
      ...prev,
      [memberNo]: !prev[memberNo],
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSavingsTypes([]);
    setSelectedFeeTypes([]);
    setSelectedLoanTypes([]);
    setExpandedRows({});
    setCurrentPage(1);
  };

  // Pagination logic
  const totalItems = filteredAccounts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSavingsTypes, selectedFeeTypes, selectedLoanTypes]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Calculate total columns for colspan
  const totalColumns =
    2 + // Member No + Name
    visibleSavingsTypes.length * 2 + // Account + Balance per savings type
    visibleFeeTypes.length * 2 +
    visibleLoanTypes.length * 2 +
    (visibleLoanTypes.length > 0 ? 1 : 0); // Expand column

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Member Number or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {allSavingsTypes.length > 0 && (
            <Popover open={openSavings} onOpenChange={setOpenSavings}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-56 justify-between">
                  {selectedSavingsTypes.length > 0
                    ? `${selectedSavingsTypes.length} selected`
                    : "All Savings Types"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <Command>
                  <CommandInput placeholder="Search savings..." />
                  <CommandList>
                    <CommandEmpty>No types found.</CommandEmpty>
                    <CommandGroup>
                      {allSavingsTypes.map((type) => (
                        <CommandItem
                          key={type}
                          onSelect={() =>
                            setSelectedSavingsTypes((prev) =>
                              prev.includes(type)
                                ? prev.filter((t) => t !== type)
                                : [...prev, type]
                            )
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSavingsTypes.includes(type)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {type}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {allFeeTypes.length > 0 && (
            <Popover open={openFees} onOpenChange={setOpenFees}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-56 justify-between">
                  {selectedFeeTypes.length > 0
                    ? `${selectedFeeTypes.length} selected`
                    : "All Fee Types"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <Command>
                  <CommandInput placeholder="Search fees..." />
                  <CommandList>
                    <CommandEmpty>No types found.</CommandEmpty>
                    <CommandGroup>
                      {allFeeTypes.map((type) => (
                        <CommandItem
                          key={type}
                          onSelect={() =>
                            setSelectedFeeTypes((prev) =>
                              prev.includes(type)
                                ? prev.filter((t) => t !== type)
                                : [...prev, type]
                            )
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedFeeTypes.includes(type)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {type}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {allLoanTypes.length > 0 && (
            <Popover open={openLoans} onOpenChange={setOpenLoans}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-56 justify-between">
                  {selectedLoanTypes.length > 0
                    ? `${selectedLoanTypes.length} selected`
                    : "All Loan Types"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <Command>
                  <CommandInput placeholder="Search loans..." />
                  <CommandList>
                    <CommandEmpty>No types found.</CommandEmpty>
                    <CommandGroup>
                      {allLoanTypes.map((type) => (
                        <CommandItem
                          key={type}
                          onSelect={() =>
                            setSelectedLoanTypes((prev) =>
                              prev.includes(type)
                                ? prev.filter((t) => t !== type)
                                : [...prev, type]
                            )
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedLoanTypes.includes(type)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {type}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Member No</TableHead>
              <TableHead className="min-w-48">Member Name</TableHead>

              {/* Savings: Account + Balance */}
              {visibleSavingsTypes.map((type) => (
                <React.Fragment key={`s-${type}`}>
                  <TableHead>{type} Account</TableHead>
                  <TableHead>{type} Balance</TableHead>
                </React.Fragment>
              ))}

              {/* Fees */}
              {visibleFeeTypes.map((type) => (
                <React.Fragment key={`f-${type}`}>
                  <TableHead>{type} Account</TableHead>
                  <TableHead>{type} Balance</TableHead>
                </React.Fragment>
              ))}

              {/* Loans */}
              {visibleLoanTypes.map((type) => (
                <React.Fragment key={`l-${type}`}>
                  <TableHead>{type} Account</TableHead>
                  <TableHead>{type} Balance</TableHead>
                </React.Fragment>
              ))}

              {visibleLoanTypes.length > 0 && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumns} className="text-center py-8 text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAccounts.map((user) => {
                const hasLoans = (user.loan_accounts || []).length > 0;
                const isExpanded = expandedRows[user.member_no];

                return (
                  <React.Fragment key={user.member_no}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-medium">{user.member_no}</TableCell>
                      <TableCell>{user.member_name}</TableCell>

                      {/* Savings */}
                      {visibleSavingsTypes.map((type) => {
                        const acc = getAccount(user.savings_accounts, type);
                        return (
                          <React.Fragment key={`s-${type}`}>
                            <TableCell>{acc ? acc[0] : ""}</TableCell>
                            <TableCell>{acc ? formatBalance(acc[2]) : ""}</TableCell>
                          </React.Fragment>
                        );
                      })}

                      {/* Fees */}
                      {visibleFeeTypes.map((type) => {
                        const acc = getAccount(user.fee_accounts, type);
                        return (
                          <React.Fragment key={`f-${type}`}>
                            <TableCell>{acc ? acc[0] : ""}</TableCell>
                            <TableCell>{acc ? formatBalance(acc[2]) : ""}</TableCell>
                          </React.Fragment>
                        );
                      })}

                      {/* Loans */}
                      {visibleLoanTypes.map((type) => {
                        const acc = getAccount(user.loan_accounts, type);
                        return (
                          <React.Fragment key={`l-${type}`}>
                            <TableCell>{acc ? acc[0] : ""}</TableCell>
                            <TableCell>{acc ? formatBalance(acc[2]) : ""}</TableCell>
                          </React.Fragment>
                        );
                      })}

                      {/* Expand Button */}
                      {/* {visibleLoanTypes.length > 0 && (
                        <TableCell>
                          {hasLoans && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(user.member_no)}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          )}
                        </TableCell>
                      )} */}
                    </TableRow>

                    {/* Expanded Loan Details */}
                    {isExpanded && hasLoans && (
                      <TableRow>
                        <TableCell colSpan={totalColumns} className="p-0">
                          <div className="bg-muted/30 p-4">
                            <Table className="text-sm">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Loan Account</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead className="text-right">Outstanding Balance</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(user.loan_accounts || [])
                                  .filter(([, type]) => visibleLoanTypes.includes(type))
                                  .map(([acc_no, type, balance]) => (
                                    <TableRow key={acc_no}>
                                      <TableCell className="font-mono">{acc_no}</TableCell>
                                      <TableCell>{type}</TableCell>
                                      <TableCell className="text-right font-medium">
                                        {formatBalance(balance)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-[#ea1315] hover:bg-[#c71012] text-white border-none"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className={`${currentPage === pageNum
                      ? "bg-[#ea1315] text-white"
                      : "border-[#ea1315] text-[#ea1315] hover:bg-[#ea1315] hover:text-white"
                      } h-8 w-8 p-0`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-[#ea1315] hover:bg-[#c71012] text-white border-none"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsListTable;