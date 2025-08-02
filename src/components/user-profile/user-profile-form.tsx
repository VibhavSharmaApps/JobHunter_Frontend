import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Save, Loader2, User, Briefcase, GraduationCap, MapPin, Phone, Mail, Globe, Github, Linkedin } from "lucide-react";

// Form validation schema
const UserProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  experience: z.string().min(1, "Experience level is required"),
  education: z.string().min(1, "Education is required"),
  summary: z.string().min(10, "Professional summary must be at least 10 characters"),
  availability: z.string().min(1, "Availability is required"),
  salary_expectation: z.string().optional(),
  remote_preference: z.boolean().default(false),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  // Note: ChatGPT API key is managed centrally on the backend
});

type UserProfile = z.infer<typeof UserProfileSchema>;

interface WorkHistoryItem {
  id: string;
  job_title: string;
  company: string;
  duration: string;
  location: string;
  description: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
}

interface UserProfileFormProps {
  onSave?: (profile: any) => void;
}

export default function UserProfileForm({ onSave }: UserProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");
  const { toast } = useToast();

  const form = useForm<UserProfile>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      experience: "",
      education: "",
      summary: "",
      availability: "",
      salary_expectation: "",
      remote_preference: false,
      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
      // ChatGPT API key is managed centrally on the backend
    },
  });

  // Load existing profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;
        
        // Populate form fields
        form.reset({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          experience: profile.experience || "",
          education: profile.education || "",
          summary: profile.summary || "",
          availability: profile.availability || "",
          salary_expectation: profile.salary_expectation || "",
          remote_preference: profile.remote_preference || false,
          linkedin_url: profile.linkedin_url || "",
          github_url: profile.github_url || "",
          portfolio_url: profile.portfolio_url || "",
          // ChatGPT API key is managed centrally on the backend
        });

        // Load arrays
        setSkills(profile.skills || []);
        setWorkHistory(profile.work_history || []);
        setLanguages(profile.languages || []);
        setCertifications(profile.certifications || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const onSubmit = async (data: UserProfile) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your profile.",
          variant: "destructive",
        });
        return;
      }

      const profileData = {
        ...data,
        skills,
        work_history: workHistory,
        languages,
        certifications,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast({
          title: "Profile saved!",
          description: "Your professional profile has been saved successfully.",
        });
        onSave?.(profileData);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error saving profile",
          description: errorData.error || "Failed to save profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addWorkHistory = () => {
    const newJob: WorkHistoryItem = {
      id: Date.now().toString(),
      job_title: "",
      company: "",
      duration: "",
      location: "",
      description: "",
      is_current: false,
    };
    setWorkHistory([...workHistory, newJob]);
  };

  const updateWorkHistory = (id: string, field: keyof WorkHistoryItem, value: any) => {
    setWorkHistory(workHistory.map(job => 
      job.id === id ? { ...job, [field]: value } : job
    ));
  };

  const removeWorkHistory = (id: string) => {
    setWorkHistory(workHistory.filter(job => job.id !== id));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setLanguages(languages.filter(lang => lang !== languageToRemove));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (certToRemove: string) => {
    setCertifications(certifications.filter(cert => cert !== certToRemove));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Professional Profile
          </CardTitle>
          <CardDescription>
            Complete your professional profile to enable AI-powered job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="John Doe"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="john.doe@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+1-555-123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  {...form.register("location")}
                  placeholder="San Francisco, CA"
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Professional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level *</Label>
                <Select onValueChange={(value) => form.setValue("experience", value)} defaultValue={form.getValues("experience")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years (Entry Level)</SelectItem>
                    <SelectItem value="1-3">1-3 years (Junior)</SelectItem>
                    <SelectItem value="3-5">3-5 years (Mid Level)</SelectItem>
                    <SelectItem value="5-7">5-7 years (Senior)</SelectItem>
                    <SelectItem value="7+">7+ years (Expert)</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.experience && (
                  <p className="text-sm text-red-500">{form.formState.errors.experience.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education *</Label>
                <Input
                  id="education"
                  {...form.register("education")}
                  placeholder="Bachelor's in Computer Science"
                />
                {form.formState.errors.education && (
                  <p className="text-sm text-red-500">{form.formState.errors.education.message}</p>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary *</Label>
              <Textarea
                id="summary"
                {...form.register("summary")}
                placeholder="Brief description of your professional background, skills, and career goals..."
                rows={4}
              />
              {form.formState.errors.summary && (
                <p className="text-sm text-red-500">{form.formState.errors.summary.message}</p>
                )}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills *</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Work History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Work History</Label>
                <Button type="button" onClick={addWorkHistory} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </div>
              
              {workHistory.map((job, index) => (
                <Card key={job.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Job {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeWorkHistory(job.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input
                        value={job.job_title}
                        onChange={(e) => updateWorkHistory(job.id, 'job_title', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={job.company}
                        onChange={(e) => updateWorkHistory(job.id, 'company', e.target.value)}
                        placeholder="Google"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        value={job.duration}
                        onChange={(e) => updateWorkHistory(job.id, 'duration', e.target.value)}
                        placeholder="2020-2023"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={job.location}
                        onChange={(e) => updateWorkHistory(job.id, 'location', e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label>Description</Label>
                    <Textarea
                      value={job.description}
                      onChange={(e) => updateWorkHistory(job.id, 'description', e.target.value)}
                      placeholder="Brief description of your role, responsibilities, and achievements..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id={`current-${job.id}`}
                      checked={job.is_current}
                      onCheckedChange={(checked) => updateWorkHistory(job.id, 'is_current', checked)}
                    />
                    <Label htmlFor={`current-${job.id}`}>Current Position</Label>
                  </div>
                </Card>
              ))}
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability *</Label>
                <Select onValueChange={(value) => form.setValue("availability", value)} defaultValue={form.getValues("availability")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="2-weeks">2 weeks notice</SelectItem>
                    <SelectItem value="1-month">1 month notice</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.availability && (
                  <p className="text-sm text-red-500">{form.formState.errors.availability.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_expectation">Salary Expectation</Label>
                <Input
                  id="salary_expectation"
                  {...form.register("salary_expectation")}
                  placeholder="$100,000 - $150,000"
                />
              </div>
            </div>

            {/* Remote Preference */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                {...form.register("remote_preference")}
              />
              <Label htmlFor="remote">Open to remote work</Label>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  {...form.register("linkedin_url")}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  {...form.register("github_url")}
                  placeholder="https://github.com/johndoe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  {...form.register("portfolio_url")}
                  placeholder="https://johndoe.dev"
                />
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {languages.map((language) => (
                  <Badge key={language} variant="outline" className="flex items-center gap-1">
                    {language}
                    <button
                      type="button"
                      onClick={() => removeLanguage(language)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add a language"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                />
                <Button type="button" onClick={addLanguage} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {certifications.map((certification) => (
                  <Badge key={certification} variant="outline" className="flex items-center gap-1">
                    {certification}
                    <button
                      type="button"
                      onClick={() => removeCertification(certification)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add a certification"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                />
                <Button type="button" onClick={addCertification} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Note: ChatGPT API key is managed centrally on the backend */}

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 