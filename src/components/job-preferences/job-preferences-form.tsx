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
import { Search, Briefcase, MapPin, Calendar, Building } from "lucide-react";

const JobPreferencesSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  location: z.string().optional(),
  experience: z.string().optional(),
  postedAfter: z.string().optional(),
  jobBoards: z.array(z.string()).min(1, "Select at least one job board"),
  remote: z.boolean().default(false),
  salary: z.string().optional(),
});

type JobPreferences = z.infer<typeof JobPreferencesSchema>;

const jobBoards = [
  { id: "greenhouse", name: "Greenhouse", icon: "🏢" },
  { id: "lever", name: "Lever", icon: "🚀" },
  { id: "workable", name: "Workable", icon: "💼" },
  { id: "bamboo", name: "BambooHR", icon: "🎋" },
  { id: "smartrecruiters", name: "SmartRecruiters", icon: "🧠" },
];

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (2-5 years)" },
  { value: "senior", label: "Senior Level (5+ years)" },
  { value: "lead", label: "Lead/Manager (7+ years)" },
];

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
      experience: "",
      postedAfter: "7",
      jobBoards: ["greenhouse", "lever"],
      remote: false,
      salary: "",
    },
  });

  const onSubmit = async (data: JobPreferences) => {
    setIsSearching(true);
    try {
      // TODO: Send preferences to backend for job discovery
      console.log("Job preferences:", data);
      
      toast({
        title: "Searching for jobs...",
        description: "Finding matching job opportunities",
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Jobs found!",
        description: "Check the Job URLs tab to see matching opportunities",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for jobs",
        variant: "destructive",
      });
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
                      placeholder="e.g., Frontend Engineer, Product Manager"
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
                      placeholder="e.g., Remote, New York, Bengaluru"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience Level */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

            {/* Job Boards */}
            <FormField
              control={form.control}
              name="jobBoards"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Job Boards to Search
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {jobBoards.map((board) => (
                      <FormField
                        key={board.id}
                        control={form.control}
                        name="jobBoards"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={board.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(board.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, board.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== board.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                <span className="mr-2">{board.icon}</span>
                                {board.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
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