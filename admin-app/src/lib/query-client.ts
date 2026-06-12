import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus for this admin dashboard
      refetchOnWindowFocus: false,
      // Refetch when reconnecting to network
      refetchOnReconnect: true
    },
    mutations: {
      // Don't retry mutations by default
      retry: false
    }
  }
});
