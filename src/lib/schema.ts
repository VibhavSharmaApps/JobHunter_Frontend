import { z } from "zod";

export const UserProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  currentSalary: z.string().optional(),
  expectedSalary: z.string().optional(),
  location: z.string().optional(),
  noticePeriod: z.string().optional(),
  education: z.string().optional(),
  experienceSummary: z.string().optional()
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserPreferencesSchema = z.object({
  qualifications: z.string().optional(),
  workExperience: z.string().optional(),
  jobPreferences: z.string().optional(),
});

export type UserPreferencesFormData = z.infer<typeof UserPreferencesSchema>;

export const JobUrlSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["pending", "applied", "interviewed", "rejected"]),
  createdAt: z.string(),
  userId: z.string(),
});

export type JobUrl = z.infer<typeof JobUrlSchema>;

export const ApplicationSchema = z.object({
  id: z.string(),
  company: z.string().optional(),
  position: z.string().optional(),
  appliedDate: z.string(), // ISO date string
  status: z.enum(["pending", "interview", "rejected", "accepted"]),
  // add other fields as needed
});

export type Application = z.infer<typeof ApplicationSchema>;