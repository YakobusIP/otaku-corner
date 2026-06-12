import { AUTH_SESSION_QUERY_KEY, fetchAuthSession } from "@/auth";
import { useQuery } from "@tanstack/react-query";

export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: fetchAuthSession,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY
  });
}
