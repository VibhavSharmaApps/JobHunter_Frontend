import { useQuery } from "@tanstack/react-query";
import type { UserPreferencesFormData } from "@/lib/schema";
import { apiRequest } from "@/lib/queryClient";

export function useUserPreferences() {
  return useQuery<UserPreferencesFormData>({
    queryKey: ["/api/user-preferences"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user-preferences");
      return res.json() as Promise<UserPreferencesFormData>;
    },
  });
}