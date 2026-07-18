"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getMemberSummary } from "@/services/membersummary";

export function useFetchMemberSummary(memberNo) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["memberSummary", memberNo, token],
    queryFn: () => getMemberSummary(memberNo, token),
    enabled: !!token && !!memberNo,
  });
}
