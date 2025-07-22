import { useQuery } from "@tanstack/react-query";
import type { JobUrl } from "@/lib/schema";
import { apiRequest } from "@/lib/queryClient";

export function useJobUrls() {
  return useQuery<JobUrl[]>({
    queryKey: ["/api/job-urls"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/job-urls");
      return res.json() as Promise<JobUrl[]>;
    },
  });
}