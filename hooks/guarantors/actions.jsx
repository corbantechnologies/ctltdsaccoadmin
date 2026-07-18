"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
  getGuarantorProfiles,
  getGuarantorProfile,
} from "@/services/guarantorprofiles";
import useUserMemberNo from "../authentication/useUserMemberNo";

export function useFetchGuarantorProfiles() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["guarantor-profiles"],
    queryFn: () => getGuarantorProfiles(token),
    enabled: !!token,
  });
}

export function useFetchGuarantorProfile() {
  const token = useAxiosAuth();
  const member_no = useUserMemberNo();

  return useQuery({
    queryKey: ["guarantor-profile", member_no],
    queryFn: () => getGuarantorProfile(member_no, token),
    enabled: !!token && !!member_no,
  });
}
