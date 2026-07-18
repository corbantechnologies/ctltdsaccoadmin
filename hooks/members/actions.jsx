"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import useUserId from "../authentication/useUserId";
import { approveMember, getMember, getMemberDetail, getMembers } from "@/services/members";

// MEMBER Hooks
export function useFetchMember() {
  const userId = useUserId();
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["member", userId],
    queryFn: () => getMember(userId, token),
    enabled: !!userId,
  });
}

// -----------------------------------------------------------------------------------------------

// SACCO Admin Hooks
// All members
export function useFetchMembers() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["members"],
    queryFn: () => getMembers(token),
  });
}

// Single Member by member_no
export function useFetchMemberDetail(member_no) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["member", member_no],
    queryFn: () => getMemberDetail(member_no, token),
    enabled: !!member_no,
  });
}

// Verify member
export function useVerifyMember(member_no) {
  const token = useAxiosAuth();

  return useMutation({
    mutationFn: () => approveMember(member_no, token),
  });
}
