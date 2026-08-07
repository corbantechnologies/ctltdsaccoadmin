"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getMemberSummary } from "@/services/membersummary";

export function useFetchMemberSummary(memberNo, year) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["memberSummary", memberNo, year, token],
    queryFn: () => getMemberSummary(memberNo, year, token),
    enabled: !!token && !!memberNo,
  });
}
