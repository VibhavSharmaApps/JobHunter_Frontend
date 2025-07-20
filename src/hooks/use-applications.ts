import { useQuery } from "@tanstack/react-query";
import type { Application } from "@/lib/schema";

export function useApplications() {
  return useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications");  // Your API endpoint
      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }
      return (await res.json()) as Application[];
    },
  });
}