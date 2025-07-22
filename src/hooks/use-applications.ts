import { useQuery } from "@tanstack/react-query";
import type { Application } from "@/lib/schema";
import { apiRequest } from "@/lib/queryClient";

export function useApplications() {
  return useQuery<Application[]>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/applications");
      return (await res.json()) as Application[];
    },
  });
}