import { useQuery } from "@tanstack/react-query";
import type { JobUrl } from "@/lib/schema"; // updated path

export function useJobUrls() {
  return useQuery<JobUrl[]>({
    queryKey: ["job-urls"],
    queryFn: async () => {
      const res = await fetch("/api/job-urls");
      if (!res.ok) {
        throw new Error("Failed to fetch job URLs");
      }
      return res.json() as Promise<JobUrl[]>;
    },
  });
}