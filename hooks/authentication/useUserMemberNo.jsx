"use client";
import { useSession } from "next-auth/react";
import React from "react";

function useUserMemberNo() {
    const { data: session } = useSession();
    const userMemberNo = session?.user?.member_no;
    return userMemberNo;
}

export default useUserMemberNo;
