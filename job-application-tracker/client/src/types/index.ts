export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Remote';

export type ApplicationStatus = 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface JobApplication {
  id: number;
  companyName: string;
  jobTitle: string;
  location: string;
  jobType: JobType;
  status: ApplicationStatus;
  appliedDate: string;
  salaryRange?: string | null;
  jobUrl?: string | null;
  contactName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface ApplicationFormData {
  companyName: string;
  jobTitle: string;
  location: string;
  jobType: JobType;
  status: ApplicationStatus;
  appliedDate: string;
  salaryRange?: string;
  jobUrl?: string;
  contactName?: string;
  notes?: string;
}

export interface DashboardStats {
  totalApplications: number;
  statusCounts: Record<ApplicationStatus, number>;
  jobTypeCounts: Record<JobType, number>;
  recentApplications: JobApplication[];
  statusBreakdown: { name: ApplicationStatus; value: number; color: string }[];
  jobTypeBreakdown: { name: JobType; value: number; color: string }[];
}

export interface ApplicationsResponse {
  applications: JobApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApplicationsQueryParams {
  search?: string;
  status?: string;
  jobType?: string;
  sortBy?: 'appliedDate' | 'companyName' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
