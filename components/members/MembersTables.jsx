"use client";

import React from "react";
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
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "../ui/button";

const MembersTable = ({ members, refetchMembers, router }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl">Members List</CardTitle>
    </CardHeader>
    <CardContent>
      {members?.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member?.reference}>
                <TableCell className="font-medium">
                  {member?.member_no}
                </TableCell>
                <TableCell>
                  {member?.salutation} {member?.first_name} {member?.last_name}
                </TableCell>
                <TableCell>{member?.email}</TableCell>
                <TableCell>{member?.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant={member?.is_approved ? "default" : "secondary"}
                    className={
                      member?.is_approved
                        ? "bg-success text-success-foreground"
                        : ""
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
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => {
                      router?.push(`/sacco-admin/members/${member?.member_no}`);
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-muted-foreground">No members found.</p>
      )}
    </CardContent>
  </Card>
);

export default MembersTable;
