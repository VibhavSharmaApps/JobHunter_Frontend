import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/lib/schema";
import { apiRequest } from "@/lib/queryClient";

export function useUserPreferences() {
  return useQuery<UserProfile>({
    queryKey: ["/api/user-preferences"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user-preferences");
      return res.json() as Promise<UserProfile>;
    },
  });
}