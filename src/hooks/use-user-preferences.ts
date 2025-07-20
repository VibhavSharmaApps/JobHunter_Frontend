import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/lib/schema"; // assuming UserProfile = preferences

export function useUserPreferences() {
  return useQuery<UserProfile>({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user-preferences");
      if (!res.ok) {
        throw new Error("Failed to fetch user preferences");
      }
      return res.json() as Promise<UserProfile>;
    },
  });
}