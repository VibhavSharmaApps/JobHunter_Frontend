import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useJobUrls } from "@/hooks/use-job-urls";
import { apiRequest } from "@/lib/queryClient";
import AddUrlDialog from "./add-url-dialog";
import { 
  Plus, 
  Wand2, 
  CheckSquare, 
  Search, 
  ExternalLink, 
  Trash2,
  Building,
  Loader2
} from "lucide-react";

export default function UrlManagement() {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const { data: urls, isLoading, error } = useJobUrls();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debug logging
  console.log('UrlManagement render:', { urls, isLoading, error });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/job-urls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-urls"] });
      toast({
        title: "Success",
        description: "Job URL deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete job URL",
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = () => {
    if (selectedUrls.length === filteredUrls.length) {
      setSelectedUrls([]);
    } else {
      setSelectedUrls(filteredUrls.map(url => url.id));
    }
  };

  const handleUrlSelect = (urlId: string | number, checked: boolean) => {
  const idStr = String(urlId); // always string
  if (checked) {
    setSelectedUrls(prev => [...prev, idStr]);
  } else {
    setSelectedUrls(prev => prev.filter(id => id !== idStr));
  }
};


  const handleAutofill = () => {
    if (selectedUrls.length === 0) {
      toast({
        title: "No URLs selected",
        description: "Please select at least one URL to autofill",
        variant: "destructive",
      });
      return;
    }

    // Open selected URLs in new tabs
    const selectedUrlData = filteredUrls.filter(url => selectedUrls.includes(url.id));
    selectedUrlData.forEach(url => {
      window.open(url.url, '_blank');
    });

    toast({
      title: "URLs Opened",
      description: `Opened ${selectedUrls.length} URLs in new tabs for autofill`,
    });
  };

  const filteredUrls = urls?.filter(url => {
  const matchesSearch = !searchQuery || 
    url.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    url.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    url.url.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesStatus = !statusFilter || statusFilter === "all" || url.status === statusFilter;
  return matchesSearch && matchesStatus;
}) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "applied":
        return "bg-green-100 text-green-800";
      case "interviewed":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-64 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-slate-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.error('Error loading job URLs:', error);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Job URLs</h1>
          <p className="text-slate-600">Search and manage job opportunities</p>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Error loading job URLs</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Job URLs</h1>
          <p className="text-slate-600">Search and manage job opportunities</p>
        </div>

      {/* Search Window */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Job URLs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search for job URLs, companies, or positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <div className="flex justify-center">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8"
                onClick={() => {
                  // TODO: Connect to extension for bulk apply functionality
                  console.log('Bulk Apply clicked - will connect to extension later');
                }}
              >
                <Wand2 className="h-5 w-5 mr-2" />
                Bulk Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL Management Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Manage Job URLs</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add URL
              </Button>
              <Button 
                className="bg-accent hover:bg-accent/90"
                onClick={handleAutofill}
                disabled={selectedUrls.length === 0}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Autofill Selected ({selectedUrls.length})
              </Button>
              <Button variant="outline" onClick={handleSelectAll}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

     {/* URLs List */}
<Card className="shadow-sm">
  <CardHeader>
    <CardTitle>Collected Job URLs</CardTitle>
  </CardHeader>
  <CardContent className="p-0">
    {filteredUrls.length === 0 ? (
      <div className="text-center py-12 text-slate-500">
        <Building className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="text-lg font-medium mb-2">No job URLs found</p>
        <p className="text-sm">Add some job URLs to get started with autofill</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-3 px-4">
                <Checkbox
                  checked={selectedUrls.length === filteredUrls.length && filteredUrls.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-700">Company</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700">Title</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700">URL</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700">Date Added</th>
              {/* Removed Status column since 'status' not available */}
              <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUrls.map((url) => (
              <tr key={url.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Checkbox
                    checked={selectedUrls.includes(url.id)}
                    onCheckedChange={(checked) => handleUrlSelect(url.id, !!checked)}
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-900">{url.company || "Unknown"}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-900">{url.title || "Unknown Title"}</span>
                </td>
                <td className="py-3 px-4">
                  <a
                    href={url.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-blue-700 text-sm truncate max-w-xs block"
                  >
                    {url.url.length > 40 ? `${url.url.substring(0, 40)}...` : url.url}
                  </a>
                </td>
                <td className="py-3 px-4">
                  <Badge className={`${getStatusColor(url.status)}`}>
                    {url.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-slate-600 text-sm">
                  {new Date(url.createdAt).toLocaleDateString()}
                </td>
                {/* Removed Status cell */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(url.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(url.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </CardContent>
</Card>

<AddUrlDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
  } catch (error) {
    console.error('Error rendering UrlManagement:', error);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Job URLs</h1>
          <p className="text-slate-600">Search and manage job opportunities</p>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Error rendering component</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}