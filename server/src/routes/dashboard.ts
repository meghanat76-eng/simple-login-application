import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest, ApplicationStatus, JobType } from '../types.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticateToken);

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Wishlist: '#8B5CF6',  // Purple
  Applied: '#3B82F6',   // Blue
  Interview: '#F59E0B', // Amber
  Offer: '#10B981',     // Emerald Green
  Rejected: '#EF4444',  // Rose/Red
};

const JOB_TYPE_COLORS: Record<JobType, string> = {
  'Full-time': '#2563EB',
  'Remote': '#059669',
  'Contract': '#D97706',
  'Part-time': '#7C3AED',
  'Internship': '#0891B2',
};

// GET /api/dashboard/stats
dashboardRouter.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Fetch all applications for user to compute accurate stats
    const [totalApplications, allUserApplications, recentApplications] = await Promise.all([
      prisma.jobApplication.count({ where: { userId } }),
      prisma.jobApplication.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          jobType: true,
          appliedDate: true,
        },
      }),
      prisma.jobApplication.findMany({
        where: { userId },
        orderBy: { appliedDate: 'desc' },
        take: 5,
      }),
    ]);

    const statusCounts: Record<ApplicationStatus, number> = {
      Wishlist: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    const jobTypeCounts: Record<JobType, number> = {
      'Full-time': 0,
      'Part-time': 0,
      'Internship': 0,
      'Contract': 0,
      'Remote': 0,
    };

    allUserApplications.forEach((app) => {
      const s = app.status as ApplicationStatus;
      if (statusCounts[s] !== undefined) {
        statusCounts[s]++;
      }
      const jt = app.jobType as JobType;
      if (jobTypeCounts[jt] !== undefined) {
        jobTypeCounts[jt]++;
      }
    });

    const statusBreakdown = (Object.keys(statusCounts) as ApplicationStatus[]).map((status) => ({
      name: status,
      value: statusCounts[status],
      color: STATUS_COLORS[status],
    }));

    const jobTypeBreakdown = (Object.keys(jobTypeCounts) as JobType[]).map((type) => ({
      name: type,
      value: jobTypeCounts[type],
      color: JOB_TYPE_COLORS[type],
    }));

    res.json({
      totalApplications,
      statusCounts,
      jobTypeCounts,
      recentApplications,
      statusBreakdown,
      jobTypeBreakdown,
    });
  } catch (error: any) {
    console.error('Error computing dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});
