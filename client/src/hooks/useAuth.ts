// Auth hook
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/me"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/me");
      return await res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    isAuthenticated: data?.isAuthenticated ?? false,
    isAdmin: data?.isAdmin ?? false,
    isLoading,
    user: data?.user ?? null,
  };
}