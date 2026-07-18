"use client";

import { Button } from "@/components/ui/button";
import { X, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { createBulkMembers } from "@/services/members";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

function BulkMemberCreate({ closeModal, openModal }) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();
    const router = useRouter();

    const emptyMember = {
        member_no: "",
        first_name: "",
        last_name: "",
        email: "",
        employer: "",
        payroll_no: "",
        phone: "",
        gender: "",
    };

    const [members, setMembers] = useState([{ ...emptyMember }]);

    const handleInputChange = (index, field, value) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    const addMember = () => {
        if (members.length < 15) {
            setMembers([...members, { ...emptyMember }]);
        }
    };

    const removeMember = (indexToRemove) => {
        setMembers(members.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            console.log("Sending this payload:", JSON.stringify({ members }, null, 2));
            const response = await createBulkMembers({ members }, token);
            toast?.success("Members created successfully!");
            closeModal();
            // Reset state
            setMembers([{ ...emptyMember }]);
            router.refresh();
        } catch (error) {
            console.error("Bulk upload error: ", error.response?.data || error.message);
            toast?.error(error.response?.data?.message || "Failed to create members!");
        } finally {
            setLoading(false);
        }
    };

    if (!openModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-7xl h-full max-h-[90vh] bg-white rounded shadow-xl flex flex-col overflow-hidden relative isolate">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Bulk Create Members (Max 15)
                    </h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
                            {members.map((member, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-200 rounded bg-gray-50 relative"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-lg text-gray-700">
                                            Member #{index + 1}
                                        </h4>
                                        {members.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeMember(index)}
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700 p-2 h-auto"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`members-${index}-member_no`}
                                                className="text-base text-black font-medium"
                                            >
                                                Member No (Optional)
                                            </Label>
                                            <Input
                                                type="text"
                                                id={`members-${index}-member_no`}
                                                placeholder="e.g. MBR-001"
                                                value={member.member_no}
                                                onChange={(e) => handleInputChange(index, "member_no", e.target.value)}
                                                className="border-black rounded text-base py-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`members-${index}-first_name`}
                                                className="text-base text-black font-medium"
                                            >
                                                First Name
                                            </Label>
                                            <Input
                                                type="text"
                                                id={`members-${index}-first_name`}
                                                placeholder="John"
                                                value={member.first_name}
                                                onChange={(e) => handleInputChange(index, "first_name", e.target.value)}
                                                className="border-black rounded text-base py-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`members-${index}-last_name`}
                                                className="text-base text-black font-medium"
                                            >
                                                Last Name
                                            </Label>
                                            <Input
                                                type="text"
                                                id={`members-${index}-last_name`}
                                                placeholder="Doe"
                                                value={member.last_name}
                                                onChange={(e) => handleInputChange(index, "last_name", e.target.value)}
                                                className="border-black rounded text-base py-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`members-${index}-gender`}
                                                className="text-base text-black font-medium"
                                            >
                                                Gender
                                            </Label>
                                            <select
                                                id={`members-${index}-gender`}
                                                value={member.gender}
                                                onChange={(e) => handleInputChange(index, "gender", e.target.value)}
                                                className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2 transition-colors bg-white h-10"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`members-${index}-employer`}
                                                className="text-base text-black font-medium"
                                            >
                                                Employer
                                            </Label>
                                            <select
                                                id={`members-${index}-employer`}
                                                value={member.employer}
                                                onChange={(e) => handleInputChange(index, "employer", e.target.value)}
                                                className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2 transition-colors bg-white h-10"
                                            >
                                                <option value="">Select Employer</option>
                                                <option value="Tamarind Management Limited">
                                                    Tamarind Management Limited
                                                </option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {member.employer === "Tamarind Management Limited" && (
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor={`members-${index}-payroll_no`}
                                                    className="text-base text-black font-medium"
                                                >
                                                    Payroll Number
                                                </Label>
                                                <Input
                                                    type="text"
                                                    id={`members-${index}-payroll_no`}
                                                    placeholder="e.g. 12345"
                                                    value={member.payroll_no}
                                                    onChange={(e) => handleInputChange(index, "payroll_no", e.target.value)}
                                                    className="border-black rounded text-base py-2"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`members-${index}-phone`}
                                                className="text-base text-black font-medium"
                                            >
                                                Phone
                                            </Label>
                                            <Input
                                                type="text"
                                                id={`members-${index}-phone`}
                                                placeholder="254700000000"
                                                value={member.phone}
                                                onChange={(e) => handleInputChange(index, "phone", e.target.value)}
                                                className="border-black rounded text-base py-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`members-${index}-email`}
                                                className="text-base text-black font-medium"
                                            >
                                                Email
                                            </Label>
                                            <Input
                                                type="email"
                                                id={`members-${index}-email`}
                                                placeholder="jdoe@example.com"
                                                value={member.email}
                                                onChange={(e) => handleInputChange(index, "email", e.target.value)}
                                                className="border-black rounded text-base py-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {members.length < 15 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addMember}
                                    className="w-full border-dashed border-2 border-gray-300 text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 flex items-center justify-center gap-2 py-6 text-base"
                                >
                                    <Plus className="w-5 h-5" /> Add Another Member
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-6 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                className="border-black text-black hover:bg-gray-100 text-base py-2 px-4 w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#ea1315] hover:bg-[#c71012] text-white text-base py-2 px-4 w-full sm:w-auto"
                                disabled={loading || members.length === 0}
                            >
                                {loading ? "Creating..." : "Create Members"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default BulkMemberCreate;