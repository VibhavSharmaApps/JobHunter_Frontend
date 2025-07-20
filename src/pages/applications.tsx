import React from "react";
import useUserPreferences from "@/hooks/use-user-preferences";

export default function Applications() {
  // Fetch user profile data (single object)
  const { data: userProfile, isLoading, isError } = useUserPreferences();

  if (isLoading) {
    return (
      <div className="flex justify-center mt-10">
        Loading user profile...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 mt-10">
        Failed to load user profile.
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center mt-10">
        No user profile found.
      </div>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <p><strong>Name:</strong> {userProfile.name}</p>
      <p><strong>Email:</strong> {userProfile.email}</p>
      <p><strong>Phone:</strong> {userProfile.phone || "N/A"}</p>
      <p><strong>Current Salary:</strong> {userProfile.currentSalary || "N/A"}</p>
      <p><strong>Expected Salary:</strong> {userProfile.expectedSalary || "N/A"}</p>
      <p><strong>Location:</strong> {userProfile.location || "N/A"}</p>
      <p><strong>Notice Period:</strong> {userProfile.noticePeriod || "N/A"}</p>
      <p><strong>Education:</strong> {userProfile.education || "N/A"}</p>
      <p><strong>Experience Summary:</strong> {userProfile.experienceSummary || "N/A"}</p>
    </main>
  );
}