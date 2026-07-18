"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkCreateJournalBatches } from "@/services/journalbatches";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import toast from "react-hot-toast";

function BulkJournalBatchCreate({ onBatchSuccess }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

  const emptyEntry = {
    account: "",
    debit: "0.00",
    credit: "0.00",
  };

  const emptyBatch = {
    description: "",
    posting_date: new Date().toISOString().split("T")[0],
    reference: "",
    entries: [{ ...emptyEntry }, { ...emptyEntry }],
  };

  const [batches, setBatches] = useState([{ ...emptyBatch }]);

  // Batch handlers
  const addBatch = () => {
    if (batches.length < 5) {
      setBatches([...batches, { ...emptyBatch }]);
    }
  };

  const removeBatch = (index) => {
    setBatches(batches.filter((_, i) => i !== index));
  };

  const handleBatchChange = (index, field, value) => {
    const newBatches = [...batches];
    newBatches[index][field] = value;
    setBatches(newBatches);
  };

  // Entry handlers
  const addEntry = (batchIndex) => {
    const newBatches = [...batches];
    newBatches[batchIndex].entries.push({ ...emptyEntry });
    setBatches(newBatches);
  };

  const removeEntry = (batchIndex, entryIndex) => {
    const newBatches = [...batches];
    newBatches[batchIndex].entries = newBatches[batchIndex].entries.filter(
      (_, i) => i !== entryIndex
    );
    setBatches(newBatches);
  };

  const handleEntryChange = (batchIndex, entryIndex, field, value) => {
    const newBatches = [...batches];
    newBatches[batchIndex].entries[entryIndex][field] = value;
    setBatches(newBatches);
  };

  // Balancing logic
  const calculateBalance = (entries) => {
    const totalDebit = entries.reduce((sum, e) => sum + parseFloat(e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + parseFloat(e.credit || 0), 0);
    return {
      totalDebit: totalDebit.toFixed(2),
      totalCredit: totalCredit.toFixed(2),
      difference: (totalDebit - totalCredit).toFixed(2),
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 && (totalDebit > 0 || totalCredit > 0),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all batches are balanced
    const unbalancedBatch = batches.find(b => !calculateBalance(b.entries).isBalanced);
    if (unbalancedBatch) {
      toast.error("All batches must be balanced (Debits = Credits) before submission.");
      return;
    }

    // Validate fields
    const missingFields = batches.find(b => !b.description || b.entries.some(e => !e.account));
    if (missingFields) {
      toast.error("Please ensure all descriptions and accounts are selected.");
      return;
    }

    try {
      setLoading(true);
      await bulkCreateJournalBatches(batches, token);
      toast.success("All batches created successfully!");
      setBatches([{ ...emptyBatch }]);
      if (onBatchSuccess) onBatchSuccess();
    } catch (error) {
      console.error("Bulk create error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to create batches.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full px-4 mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--accent)]">Multi-Batch Journal Entry</h2>
          <p className="text-sm text-slate-500 font-medium">Manually compose multiple balanced journal batches.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setBatches([{ ...emptyBatch }])} 
          className="text-xs font-bold border-slate-200"
        >
          Reset All
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 pb-12">
        {batches.map((batch, bIndex) => {
          const balance = calculateBalance(batch.entries);
          return (
            <div key={bIndex} className="relative bg-white rounded border shadow-sm hover:shadow-md transition-all overflow-hidden">
              {/* Batch Header */}
              <div className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${balance.isBalanced ? 'bg-emerald-50/50' : 'bg-slate-50/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${balance.isBalanced ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'}`}>
                    {bIndex + 1}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">Batch Configuration</p>
                    <div className="flex items-center gap-2">
                        {balance.isBalanced ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-white px-2 py-0.5 rounded shadow-sm">
                                <CheckCircle2 className="w-3 h-3" /> Balanced
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase tracking-widest bg-white px-2 py-0.5 rounded shadow-sm">
                                <AlertCircle className="w-3 h-3" /> Unbalanced ({balance.difference}) 
                            </span>
                        )}
                    </div>
                  </div>
                </div>
                {batches.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => removeBatch(bIndex)}
                    className="h-8 w-8 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="space-y-1.5 flex-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Batch Description</Label>
                    <Input 
                      placeholder="e.g. Monthly Payroll - April 2024"
                      value={batch.description}
                      onChange={(e) => handleBatchChange(bIndex, "description", e.target.value)}
                      className="h-10 text-sm font-medium border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5 w-full md:w-1/3">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Posting Date</Label>
                    <Input 
                      type="date"
                      value={batch.posting_date}
                      onChange={(e) => handleBatchChange(bIndex, "posting_date", e.target.value)}
                      className="h-10 text-sm font-medium border-slate-200"
                    />
                  </div>
                </div>
                  
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Ledger Entries</Label>
                  <div className="border rounded divide-y overflow-hidden">
                    <div className="grid grid-cols-12 gap-0 bg-slate-50 border-b">
                        <div className="col-span-6 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Account</div>
                        <div className="col-span-3 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Debit</div>
                        <div className="col-span-3 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Credit</div>
                    </div>
                    {batch.entries.map((entry, eIndex) => (
                      <div key={eIndex} className="grid grid-cols-12 gap-2 p-3 bg-white group hover:bg-slate-50 transition-colors items-center">
                        <div className="col-span-6 flex gap-2 items-center">
                            {batch.entries.length > 2 && (
                                <button 
                                    type="button"
                                    onClick={() => removeEntry(bIndex, eIndex)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 transition-all font-bold"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <select
                                value={entry.account}
                                onChange={(e) => handleEntryChange(bIndex, eIndex, "account", e.target.value)}
                                className="w-full bg-transparent border-none text-sm font-semibold outline-none focus:ring-0 cursor-pointer"
                                disabled={isLoadingGL}
                            >
                                <option value="">Select Account...</option>
                                {glAccounts?.map(acc => (
                                    <option key={acc.reference} value={acc.name}>{acc.name} ({acc.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <input 
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={entry.debit}
                                onChange={(e) => handleEntryChange(bIndex, eIndex, "debit", e.target.value)}
                                className="w-full bg-transparent text-right border-none text-sm font-bold font-mono outline-none focus:ring-0"
                            />
                        </div>
                        <div className="col-span-3">
                            <input 
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={entry.credit}
                                onChange={(e) => handleEntryChange(bIndex, eIndex, "credit", e.target.value)}
                                className="w-full bg-transparent text-right border-none text-sm font-bold font-mono outline-none focus:ring-0"
                            />
                        </div>
                      </div>
                    ))}
                    <button 
                        type="button"
                        onClick={() => addEntry(bIndex)}
                        className="w-full py-3 bg-slate-50/50 hover:bg-slate-50 text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider transition-all"
                    >
                        <Plus className="w-3 h-3 inline mr-1" /> Add Entry Line
                    </button>
                  </div>
                </div>

                {/* Batch Totals */}
                <div className="flex justify-end gap-12 pt-4 px-4 border-t border-dashed">
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Debit</p>
                        <p className="text-sm font-bold font-mono text-slate-900">KES {balance.totalDebit}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Credit</p>
                        <p className="text-sm font-bold font-mono text-slate-900">KES {balance.totalCredit}</p>
                    </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t pt-8">
            <Button 
                type="button"
                variant="outline"
                onClick={addBatch}
                className="w-full md:w-auto border-dashed border-2 py-6 px-12 text-[var(--accent)] font-bold border-slate-200 hover:border-[var(--accent)] transition-all bg-white"
            >
                <Plus className="w-4 h-4 mr-2" /> Add Another Batch
            </Button>
            
            <Button 
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-[#ea1315] hover:bg-[#c71012] text-white px-16 h-14 rounded font-bold shadow-xl shadow-rose-100 transition-all"
            >
                {loading ? "Processing..." : "Commit All Batches"}
            </Button>
        </div>
      </form>
    </div>
  );
}

export default BulkJournalBatchCreate;
