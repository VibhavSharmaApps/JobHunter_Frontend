import { useState } from "react";
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
  Loader2
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

// Mock data for demonstration
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
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function JobListingsView() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const { toast } = useToast();

  const handleJobSelect = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === mockJobListings.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(mockJobListings.map(job => job.id));
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
      const selectedJobData = mockJobListings.filter(job => 
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
            {mockJobListings.length} jobs found • {selectedJobs.length} selected
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            {selectedJobs.length === mockJobListings.length ? "Deselect All" : "Select All"}
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
        {mockJobListings.map((job) => (
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
        ))}
      </div>

      {/* Empty State */}
      {mockJobListings.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No jobs found
            </h3>
            <p className="text-slate-600">
              Try adjusting your search criteria or job preferences
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 