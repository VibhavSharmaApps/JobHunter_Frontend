import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Rocket,
  CheckSquare,
  Loader2,
  Search
} from "lucide-react";

// Chrome extension types
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (message: any) => void;
      };
    };
  }
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  postedDate: string;
  salary?: string;
  experience?: string;
}

// Mock data for demonstration - diverse sources
const mockJobListings: JobListing[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechCorp",
    location: "Remote",
    url: "https://boards.greenhouse.io/techcorp/jobs/12345",
    source: "Greenhouse",
    postedDate: "2024-01-15",
    salary: "$120k - $150k",
    experience: "5+ years"
  },
  {
    id: "2",
    title: "Product Manager",
    company: "StartupXYZ",
    location: "San Francisco, CA",
    url: "https://jobs.lever.co/startupxyz/67890",
    source: "Lever",
    postedDate: "2024-01-14",
    salary: "$130k - $160k",
    experience: "3+ years"
  },
  {
    id: "3",
    title: "Full Stack Developer",
    company: "Innovation Labs",
    location: "New York, NY",
    url: "https://workable.com/jobs/11111",
    source: "Workable",
    postedDate: "2024-01-13",
    salary: "$100k - $130k",
    experience: "2+ years"
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Remote",
    url: "https://boards.greenhouse.io/cloudtech/jobs/22222",
    source: "Greenhouse",
    postedDate: "2024-01-12",
    salary: "$110k - $140k",
    experience: "4+ years"
  },
  {
    id: "5",
    title: "UX Designer",
    company: "Design Studio",
    location: "Austin, TX",
    url: "https://jobs.lever.co/designstudio/33333",
    source: "Lever",
    postedDate: "2024-01-11",
    salary: "$90k - $120k",
    experience: "3+ years"
  },
  {
    id: "6",
    title: "React Developer",
    company: "Netflix",
    location: "Los Gatos, CA",
    url: "https://jobs.netflix.com/jobs/123456",
    source: "Company Career Page",
    postedDate: "2024-01-10",
    salary: "$150k - $200k",
    experience: "3+ years"
  },
  {
    id: "7",
    title: "Backend Engineer",
    company: "Stripe",
    location: "San Francisco, CA",
    url: "https://stripe.com/jobs/backend-engineer",
    source: "Company Career Page",
    postedDate: "2024-01-09",
    salary: "$140k - $180k",
    experience: "4+ years"
  },
  {
    id: "8",
    title: "Data Scientist",
    company: "OpenAI",
    location: "Remote",
    url: "https://openai.com/careers/data-scientist",
    source: "Company Career Page",
    postedDate: "2024-01-08",
    salary: "$160k - $220k",
    experience: "5+ years"
  },
  {
    id: "9",
    title: "Mobile Developer",
    company: "Uber",
    location: "San Francisco, CA",
    url: "https://www.uber.com/careers/mobile-developer",
    source: "Company Career Page",
    postedDate: "2024-01-07",
    salary: "$130k - $170k",
    experience: "3+ years"
  },
  {
    id: "10",
    title: "Frontend Engineer",
    company: "Airbnb",
    location: "Remote",
    url: "https://careers.airbnb.com/frontend-engineer",
    source: "Company Career Page",
    postedDate: "2024-01-06",
    salary: "$120k - $160k",
    experience: "2+ years"
  },
  {
    id: "11",
    title: "Machine Learning Engineer",
    company: "Google",
    location: "Mountain View, CA",
    url: "https://careers.google.com/jobs/ml-engineer",
    source: "Company Career Page",
    postedDate: "2024-01-05",
    salary: "$180k - $250k",
    experience: "5+ years"
  },
  {
    id: "12",
    title: "DevOps Engineer",
    company: "Amazon",
    location: "Seattle, WA",
    url: "https://amazon.jobs/devops-engineer",
    source: "Company Career Page",
    postedDate: "2024-01-04",
    salary: "$140k - $190k",
    experience: "4+ years"
  }
];

const getSourceIcon = (source: string) => {
  switch (source.toLowerCase()) {
    case "greenhouse":
      return "🏢";
    case "lever":
      return "🚀";
    case "workable":
      return "💼";
    case "bamboo":
      return "🎋";
    case "smartrecruiters":
      return "🧠";
    case "linkedin":
      return "💼";
    case "indeed":
      return "🔍";
    case "glassdoor":
      return "🏢";
    case "company career page":
      return "🏭";
    case "remote job sites":
      return "🏠";
    case "startup job boards":
      return "🚀";
    default:
      return "📋";
  }
};

const getSourceColor = (source: string) => {
  switch (source.toLowerCase()) {
    case "greenhouse":
      return "bg-green-100 text-green-800";
    case "lever":
      return "bg-blue-100 text-blue-800";
    case "workable":
      return "bg-purple-100 text-purple-800";
    case "bamboo":
      return "bg-yellow-100 text-yellow-800";
    case "smartrecruiters":
      return "bg-indigo-100 text-indigo-800";
    case "linkedin":
      return "bg-blue-100 text-blue-800";
    case "indeed":
      return "bg-purple-100 text-purple-800";
    case "glassdoor":
      return "bg-green-100 text-green-800";
    case "company career page":
      return "bg-orange-100 text-orange-800";
    case "remote job sites":
      return "bg-teal-100 text-teal-800";
    case "startup job boards":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function JobListingsView() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load discovered jobs from localStorage
  useEffect(() => {
    const loadJobs = () => {
      try {
        const discoveredJobs = localStorage.getItem('discoveredJobs');
        if (discoveredJobs) {
          const parsedJobs = JSON.parse(discoveredJobs);
          setJobs(parsedJobs);
        } else {
          // Fallback to mock data if no discovered jobs
          setJobs(mockJobListings);
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
        setJobs(mockJobListings);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleJobSelect = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(job => job.id));
    }
  };

  const handleAutoApply = async () => {
    if (selectedJobs.length === 0) {
      toast({
        title: "No jobs selected",
        description: "Please select at least one job to apply to",
        variant: "destructive",
      });
      return;
    }

    setIsAutoApplying(true);
    
    try {
                 // Get selected job data
           const selectedJobData = jobs.filter(job => 
             selectedJobs.includes(job.id)
           );

      // Store job data for extension
      localStorage.setItem('autoApplyJobs', JSON.stringify(selectedJobData));
      
      // Send message to extension (if available)
      if (typeof window !== 'undefined' && window.chrome?.runtime) {
        window.chrome.runtime.sendMessage({
          action: 'autoApplyJobs',
          jobs: selectedJobData
        });
      }

      toast({
        title: "Auto Apply Initiated",
        description: `Opening ${selectedJobs.length} job applications in new tabs`,
      });

      // Open jobs in new tabs
      selectedJobData.forEach((job, index) => {
        setTimeout(() => {
          window.open(job.url, '_blank');
        }, index * 1000); // 1 second delay between each tab
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate auto apply",
        variant: "destructive",
      });
    } finally {
      setIsAutoApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
                   {/* Header with Actions */}
             <div className="flex items-center justify-between">
               <div>
                 <h2 className="text-2xl font-bold text-slate-900">Job Listings</h2>
                 <p className="text-slate-600">
                   {jobs.length} jobs found • {selectedJobs.length} selected
                 </p>
                 {jobs.length > 0 && (
                   <p className="text-sm text-slate-500 mt-1">
                     Click "Auto Apply" to open selected jobs in new tabs and autofill applications
                   </p>
                 )}
               </div>
        
        <div className="flex items-center gap-3">
                           <Button
                   variant="outline"
                   onClick={handleSelectAll}
                   className="flex items-center gap-2"
                 >
                   <CheckSquare className="h-4 w-4" />
                   {selectedJobs.length === jobs.length ? "Deselect All" : "Select All"}
                 </Button>
          
          <Button
            onClick={handleAutoApply}
            disabled={selectedJobs.length === 0 || isAutoApplying}
            className="flex items-center gap-2"
          >
            {isAutoApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening Tabs...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Auto Apply ({selectedJobs.length})
              </>
            )}
          </Button>
        </div>
      </div>

                   {/* Job Listings */}
             <div className="space-y-4">
               {isLoading ? (
                 <div className="text-center py-8">
                   <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                   <p className="text-slate-600">Loading jobs...</p>
                 </div>
               ) : (
                 jobs.map((job) => (
                   <Card key={job.id} className="shadow-sm hover:shadow-md transition-shadow">
                     <CardContent className="p-6">
                       <div className="flex items-start gap-4">
                         {/* Checkbox */}
                         <div className="pt-1">
                           <Checkbox
                             checked={selectedJobs.includes(job.id)}
                             onCheckedChange={(checked) => 
                               handleJobSelect(job.id, !!checked)
                             }
                           />
                         </div>

                         {/* Job Details */}
                         <div className="flex-1 space-y-3">
                           <div className="flex items-start justify-between">
                             <div>
                               <h3 className="text-lg font-semibold text-slate-900">
                                 {job.title}
                               </h3>
                               <div className="flex items-center gap-4 mt-1">
                                 <div className="flex items-center gap-1 text-slate-600">
                                   <Building className="h-4 w-4" />
                                   <span className="text-sm">{job.company}</span>
                                 </div>
                                 <div className="flex items-center gap-1 text-slate-600">
                                   <MapPin className="h-4 w-4" />
                                   <span className="text-sm">{job.location}</span>
                                 </div>
                                 <div className="flex items-center gap-1 text-slate-600">
                                   <Calendar className="h-4 w-4" />
                                   <span className="text-sm">{formatDate(job.postedDate)}</span>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="flex items-center gap-2">
                               <Badge className={getSourceColor(job.source)}>
                                 <span className="mr-1">{getSourceIcon(job.source)}</span>
                                 {job.source}
                               </Badge>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => window.open(job.url, '_blank')}
                               >
                                 <ExternalLink className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>

                           {/* Additional Info */}
                           <div className="flex items-center gap-4 text-sm text-slate-600">
                             {job.salary && (
                               <div className="flex items-center gap-1">
                                 <Briefcase className="h-4 w-4" />
                                 <span>{job.salary}</span>
                               </div>
                             )}
                             {job.experience && (
                               <div className="flex items-center gap-1">
                                 <span>Experience: {job.experience}</span>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 ))
               )}
             </div>

      {/* Empty State */}
      {jobs.length === 0 && !isLoading && (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Sorry, we couldn't find relevant results
            </h3>
            <p className="text-slate-600 mb-4">
              No jobs match your current search criteria. Try adjusting your preferences or expanding your search.
            </p>
            <div className="space-y-2 text-sm text-slate-500 max-w-md mx-auto">
              <p>• Try different job titles or keywords</p>
              <p>• Expand your location search area</p>
              <p>• Remove some filters to see more results</p>
              <p>• Check back later for new opportunities</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 