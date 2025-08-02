import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Search, Briefcase, MapPin, Calendar } from "lucide-react";

const JobPreferencesSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  location: z.string().min(1, "Location is required"),
  postedAfter: z.string().min(1, "Posted date is required"),
  remote: z.boolean().default(false),
});

type JobPreferences = z.infer<typeof JobPreferencesSchema>;

const dateRanges = [
  { value: "1", label: "Past 24 hours" },
  { value: "3", label: "Past 3 days" },
  { value: "7", label: "Past week" },
  { value: "30", label: "Past month" },
];

export default function JobPreferencesForm() {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const form = useForm<JobPreferences>({
    resolver: zodResolver(JobPreferencesSchema),
    defaultValues: {
      title: "",
      location: "",
      postedAfter: "7",
      remote: false,
    },
  });

  const onSubmit = async (data: JobPreferences) => {
    setIsSearching(true);
    try {
      console.log("Job preferences:", data);
      
      toast({
        title: "Searching for jobs...",
        description: "This may take up to 30 seconds. Searching multiple job sources...",
      });

      // Call real job discovery API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('https://jobhunter-backend-v2-1020050031271.us-central1.run.app/api/jobs/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to discover jobs');
      }
      const result = await response.json();
      localStorage.setItem('discoveredJobs', JSON.stringify(result.jobs));
      toast({
        title: "Jobs found!",
        description: `${result.count} jobs discovered. Check the Job URLs tab to see matching opportunities`,
      });
    } catch (error) {
      console.error('Job discovery error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "Search timeout",
          description: "Sorry, we couldn't find relevant results for the settings above. Try adjusting your search criteria.",
          variant: "destructive",
        });
        
        // Don't set mock data - let the empty state show
        localStorage.removeItem('discoveredJobs');
        
      } else {
        toast({
          title: "Search failed",
          description: "Sorry, we couldn't find relevant results for the settings above. Please try again later.",
          variant: "destructive",
        });
        localStorage.removeItem('discoveredJobs');
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Job Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Janitor, Frontend Engineer, Product Manager"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., New York, Remote, Bengaluru"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Posted Date */}
            <FormField
              control={form.control}
              name="postedAfter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Posted Date
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dateRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remote Work */}
            <FormField
              control={form.control}
              name="remote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Remote work only</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find Matching Jobs
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 