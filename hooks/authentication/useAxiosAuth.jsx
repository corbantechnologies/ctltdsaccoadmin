"use client";

import { useSession } from "next-auth/react";

function useAxiosAuth() {
  const { data: session } = useSession();

  const tokens = session?.user?.token;

  const authenticationHeader = {
    headers: {
      Authorization: "Token " + tokens,
    },
  };

  return authenticationHeader;
}

export default useAxiosAuth;
