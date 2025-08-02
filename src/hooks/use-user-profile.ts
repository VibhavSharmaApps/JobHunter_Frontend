import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

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

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  experience: string;
  education: string;
  summary: string;
  skills: string[];
  work_history: WorkHistoryItem[];
  availability: string;
  salary_expectation?: string;
  remote_preference: boolean;
  languages: string[];
  certifications: string[];
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  // ChatGPT API key is managed centrally on the backend
  created_at?: string;
  updated_at?: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load user profile
  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`https://jobhunter-backend-v2-1020050031271.us-central1.run.app/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else if (response.status === 404) {
        // Profile doesn't exist yet
        setProfile(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load profile');
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save user profile
  const saveProfile = async (profileData: UserProfile): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('No authentication token found');
        return false;
      }

      const response = await fetch(`https://jobhunter-backend-v2-1020050031271.us-central1.run.app/api/user/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        toast({
          title: "Profile saved!",
          description: "Your professional profile has been saved successfully.",
        });
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save profile');
        toast({
          title: "Error saving profile",
          description: errorData.error || "Failed to save profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      setError('Failed to save profile');
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get profile for AI form filling
  const getProfileForAI = async (): Promise<UserProfile | null> => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return null;
      }

      const response = await fetch(`https://jobhunter-backend-v2-1020050031271.us-central1.run.app/api/user/profile/ai`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.profile;
      } else {
        console.error('Failed to get AI profile');
        return null;
      }
    } catch (err) {
      console.error('Error getting AI profile:', err);
      return null;
    }
  };

  // Note: ChatGPT API key is managed centrally on the backend

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    saveProfile,
    getProfileForAI,
  };
} 