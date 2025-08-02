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
  categories: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  remote: z.boolean().default(false),
  salary: z.string().optional(),
});

type JobPreferences = z.infer<typeof JobPreferencesSchema>;

const jobBoards = [
  { id: "all", name: "All Sources", icon: "🌐" },
  { id: "comprehensive", name: "Comprehensive Search", icon: "🔍" },
  { id: "government", name: "Government Jobs", icon: "🏛️" },
  { id: "gig", name: "Gig Economy", icon: "🚗" },
  { id: "ats", name: "ATS Platforms", icon: "💼" },
  { id: "blue-collar", name: "Blue Collar Jobs", icon: "🔧" },
  { id: "admin", name: "Administrative Jobs", icon: "📋" },
  { id: "regional", name: "Regional Boards", icon: "🗺️" },
  { id: "company", name: "Company Careers", icon: "🏭" },
  { id: "greenhouse", name: "Greenhouse", icon: "🏢" },
  { id: "lever", name: "Lever", icon: "🚀" },
  { id: "workable", name: "Workable", icon: "💼" },
  { id: "bamboo", name: "BambooHR", icon: "🎋" },
  { id: "smartrecruiters", name: "SmartRecruiters", icon: "🧠" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "indeed", name: "Indeed", icon: "🔍" },
  { id: "glassdoor", name: "Glassdoor", icon: "🏢" },
  { id: "company_careers", name: "Company Career Pages", icon: "🏭" },
  { id: "remote_jobs", name: "Remote Job Sites", icon: "🏠" },
  { id: "startup_jobs", name: "Startup Job Boards", icon: "🚀" },
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
      jobBoards: ["comprehensive"],
      categories: ["blue-collar", "admin", "government"],
      countries: ["US", "UK", "CA"],
      remote: false,
      salary: "",
    },
  });

  const onSubmit = async (data: JobPreferences) => {
    setIsSearching(true);
    try {
      console.log("Job preferences:", data);
      
      toast({
        title: "Searching for jobs...",
        description: "Finding matching job opportunities",
      });

      // Call real job discovery API
      const response = await fetch('https://jobhunter-backend-v2-1020050031271.us-central1.run.app/api/jobs/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to discover jobs');
      }

      const result = await response.json();
      
      // Store discovered jobs in localStorage for the job listings component
      localStorage.setItem('discoveredJobs', JSON.stringify(result.jobs));
      
      toast({
        title: "Jobs found!",
        description: `${result.count} jobs discovered. Check the Job URLs tab to see matching opportunities`,
      });
    } catch (error) {
      console.error('Job discovery error:', error);
      toast({
        title: "Error",
        description: "Failed to search for jobs. Please try again.",
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

                               {/* Job Categories */}
                   <FormField
                     control={form.control}
                     name="categories"
                     render={() => (
                       <FormItem>
                         <FormLabel className="flex items-center gap-2">
                           <Briefcase className="h-4 w-4" />
                           Job Categories
                         </FormLabel>
                         <div className="grid grid-cols-2 gap-4">
                           {[
                             { id: "blue-collar", name: "Blue Collar", icon: "🔧" },
                             { id: "admin", name: "Administrative", icon: "📋" },
                             { id: "government", name: "Government", icon: "🏛️" },
                             { id: "healthcare", name: "Healthcare", icon: "🏥" },
                             { id: "education", name: "Education", icon: "🎓" },
                             { id: "retail", name: "Retail", icon: "🛍️" }
                           ].map((category) => (
                             <FormField
                               key={category.id}
                               control={form.control}
                               name="categories"
                               render={({ field }) => {
                                 return (
                                   <FormItem
                                     key={category.id}
                                     className="flex flex-row items-start space-x-3 space-y-0"
                                   >
                                     <FormControl>
                                       <Checkbox
                                         checked={field.value?.includes(category.id) || false}
                                         onCheckedChange={(checked) => {
                                           return checked
                                             ? field.onChange([...(field.value || []), category.id])
                                             : field.onChange(
                                                 (field.value || []).filter(
                                                   (value) => value !== category.id
                                                 )
                                               )
                                         }}
                                       />
                                     </FormControl>
                                     <FormLabel className="text-sm font-normal">
                                       <span className="mr-2">{category.icon}</span>
                                       {category.name}
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

                   {/* Countries */}
                   <FormField
                     control={form.control}
                     name="countries"
                     render={() => (
                       <FormItem>
                         <FormLabel className="flex items-center gap-2">
                           <MapPin className="h-4 w-4" />
                           Countries
                         </FormLabel>
                         <div className="grid grid-cols-3 gap-4">
                           {[
                             { id: "US", name: "United States", icon: "🇺🇸" },
                             { id: "UK", name: "United Kingdom", icon: "🇬🇧" },
                             { id: "CA", name: "Canada", icon: "🇨🇦" }
                           ].map((country) => (
                             <FormField
                               key={country.id}
                               control={form.control}
                               name="countries"
                               render={({ field }) => {
                                 return (
                                   <FormItem
                                     key={country.id}
                                     className="flex flex-row items-start space-x-3 space-y-0"
                                   >
                                     <FormControl>
                                       <Checkbox
                                         checked={field.value?.includes(country.id) || false}
                                         onCheckedChange={(checked) => {
                                           return checked
                                             ? field.onChange([...(field.value || []), country.id])
                                             : field.onChange(
                                                 (field.value || []).filter(
                                                   (value) => value !== country.id
                                                 )
                                               )
                                         }}
                                       />
                                     </FormControl>
                                     <FormLabel className="text-sm font-normal">
                                       <span className="mr-2">{country.icon}</span>
                                       {country.name}
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