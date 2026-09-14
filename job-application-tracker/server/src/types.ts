import { Request } from 'express';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Remote';

export type ApplicationStatus = 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface ApplicationInput {
  companyName: string;
  jobTitle: string;
  location: string;
  jobType: JobType;
  status: ApplicationStatus;
  appliedDate?: string | Date;
  salaryRange?: string;
  jobUrl?: string;
  contactName?: string;
  notes?: string;
}

export interface DashboardStats {
  totalApplications: number;
  statusCounts: Record<ApplicationStatus, number>;
  jobTypeCounts: Record<JobType, number>;
  recentApplications: any[];
  statusBreakdown: { name: string; value: number; color: string }[];
}
