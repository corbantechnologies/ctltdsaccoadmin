"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { User } from "lucide-react";

const AdminInfoCard = ({ member }) => (
  <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-primary">
        <User className="h-5 w-5" />
        Admin Details
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-sm">
        <span className="font-medium">Name:</span> {member?.salutation}{" "}
        {member?.first_name} {member?.last_name}
      </div>
      <div className="text-sm">
        <span className="font-medium">Email:</span> {member?.email}
      </div>
      <div className="text-sm">
        <span className="font-medium">Member No:</span> {member?.member_no}
      </div>
      <div className="text-sm">
        <span className="font-medium">Phone:</span> {member?.phone}
      </div>
    </CardContent>
  </Card>
);

export default AdminInfoCard;
