import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/lib/schema";

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/user-profile");
      if (!res.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return (await res.json()) as UserProfile;
    },
  });
}