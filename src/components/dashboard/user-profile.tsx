import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Loader2 } from "lucide-react";

import {
  UserProfileSchema,
  type UserProfile,
} from "@/lib/schema";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UserProfile>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      currentSalary: "",
      expectedSalary: "",
      location: "",
      noticePeriod: "",
      education: "",
      experienceSummary: "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      const response = await apiRequest("PUT", "/api/user-profile", data);
      if (!response.ok) throw new Error("Failed to save profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-profile"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "User profile saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save user profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserProfile) => {
    saveMutation.mutate(data);
  };

  // Load initial data from localStorage or API
  useEffect(() => {
    const userEmail = localStorage.getItem("user_email");
    if (userEmail) {
      form.setValue("email", userEmail);
    }
  }, [form]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Profile</CardTitle>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your full name"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your phone number"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your location"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Salary</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your current salary"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Salary</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your expected salary"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noticePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Period</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 2 weeks, 1 month"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your education details..."
                        rows={4}
                        className="resize-none"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Summarize your work experience..."
                        rows={4}
                        className="resize-none"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save Profile
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 