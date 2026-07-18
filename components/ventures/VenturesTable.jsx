"use client";

import React, { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const getPageNumbers = (currentPage, totalPages) => {
  return [currentPage];
};;;


function VenturesTable({ ventures, isLoading, route }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("All");
  const itemsPerPage = 5;

  // Get unique venture types for filter
  const ventureTypes = useMemo(() => {
    const types = new Set(ventures?.map((item) => item.venture_type));
    return ["All", ...types];
  }, [ventures]);

  // Filter ventures by venture_type
  const filteredVentures = useMemo(() => {
    if (filterType === "All") return ventures;
    return ventures?.filter((item) => item.venture_type === filterType);
  }, [ventures, filterType]);

  // Pagination logic
  const totalItems = filteredVentures?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedVentures = filteredVentures?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-700">Loading ventures...</div>;
  }

  if (!ventures || ventures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#067a46]">
            Venture Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-700">No ventures found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-[#067a46]">
          Venture Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Label
              htmlFor="venture-type-filter"
              className="text-sm font-medium text-gray-700"
            >
              Filter by Venture Type
            </Label>
            <Select
              value={filterType}
              onValueChange={(value) => {
                setFilterType(value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <SelectTrigger
                id="venture-type-filter"
                className="w-[200px] border-gray-300 focus:ring-[#067a46] focus:border-[#067a46]"
                aria-label="Filter by venture type"
              >
                <SelectValue placeholder="Select venture type" />
              </SelectTrigger>
              <SelectContent>
                {ventureTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm border border-slate-100 rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]">
                  <TableHead className="text-white font-bold text-sm h-12">
                    Venture Type
                  </TableHead>
                  <TableHead className="text-white font-bold text-sm h-12">
                    Account Number
                  </TableHead>
                  <TableHead className="text-white font-bold text-sm h-12">
                    Balance
                  </TableHead>
                  <TableHead className="text-white font-bold text-sm h-12">
                    Status
                  </TableHead>
                  <TableHead className="text-white font-bold text-sm h-12">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVentures?.map((venture) => (
                  <TableRow
                    key={venture.identity}
                    className="border-b border-gray-200"
                  >
                    <TableCell className="text-sm text-gray-700">
                      {venture.venture_type}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {venture.account_number}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      KES {parseFloat(venture.balance).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span
                        className={`px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] rounded border ${venture.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                      >
                        {venture.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      <Link
                        href={`/${route}/ventures/${venture.identity}`}
                        className="text-[#067a46] hover:underline cursor-pointer"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-[#067a46] hover:bg-[#c71012] text-white text-sm disabled:opacity-50"
                aria-label="Previous page"
              >
                Previous
              </Button>
              {getPageNumbers(currentPage, totalPages).map((page, index) => page === "..." ? <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-400 text-sm select-none">...</span> : (((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    className={`${currentPage === page
                        ? "bg-[#067a46] text-white"
                        : "border-[#067a46] text-[#067a46] hover:bg-[#067a46] hover:text-white"
                      } text-sm`}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </Button>
                ),)(page)))}
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-[#067a46] hover:bg-[#c71012] text-white text-sm disabled:opacity-50"
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VenturesTable;