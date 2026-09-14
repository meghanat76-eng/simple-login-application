import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

export const applicationsRouter = Router();

// Protect all application routes
applicationsRouter.use(authenticateToken);

// GET /api/applications - list applications with search, filter, sorting, pagination
applicationsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      search,
      status,
      jobType,
      sortBy = 'appliedDate',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNumber - 1) * pageSize;

    // Build Prisma where conditions
    const where: any = {
      userId,
    };

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { companyName: { contains: q } },
        { jobTitle: { contains: q } },
        { location: { contains: q } },
      ];
    }

    if (status && status !== 'All' && typeof status === 'string') {
      where.status = status;
    }

    if (jobType && jobType !== 'All' && typeof jobType === 'string') {
      where.jobType = jobType;
    }

    // Determine valid sort field
    const validSortFields = ['appliedDate', 'companyName', 'createdAt', 'status', 'jobTitle'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'appliedDate';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, applications] = await Promise.all([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        orderBy: {
          [sortField]: orderDirection,
        },
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    res.json({
      applications,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch job applications' });
  }
});

// GET /api/applications/:id - get single application owned by user
applicationsRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const applicationId = parseInt(req.params.id, 10);

    if (isNaN(applicationId)) {
      res.status(400).json({ error: 'Invalid application ID' });
      return;
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found or unauthorized' });
      return;
    }

    res.json(application);
  } catch (error: any) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// POST /api/applications - create application
applicationsRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      companyName,
      jobTitle,
      location,
      jobType,
      status,
      appliedDate,
      salaryRange,
      jobUrl,
      contactName,
      notes,
    } = req.body;

    // Validation
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      res.status(400).json({ error: 'Company name is required' });
      return;
    }

    if (!jobTitle || typeof jobTitle !== 'string' || jobTitle.trim().length === 0) {
      res.status(400).json({ error: 'Job title is required' });
      return;
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      res.status(400).json({ error: 'Location is required' });
      return;
    }

    const validJobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];
    if (!jobType || !validJobTypes.includes(jobType)) {
      res.status(400).json({ error: `Job type must be one of: ${validJobTypes.join(', ')}` });
      return;
    }

    const validStatuses = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    let parsedAppliedDate = new Date();
    if (appliedDate) {
      const parsed = new Date(appliedDate);
      if (!isNaN(parsed.getTime())) {
        parsedAppliedDate = parsed;
      }
    }

    const application = await prisma.jobApplication.create({
      data: {
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        location: location.trim(),
        jobType,
        status,
        appliedDate: parsedAppliedDate,
        salaryRange: salaryRange ? salaryRange.trim() : null,
        jobUrl: jobUrl ? jobUrl.trim() : null,
        contactName: contactName ? contactName.trim() : null,
        notes: notes ? notes.trim() : null,
        userId,
      },
    });

    res.status(201).json(application);
  } catch (error: any) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create job application' });
  }
});

// PUT /api/applications/:id - update application owned by user
applicationsRouter.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const applicationId = parseInt(req.params.id, 10);

    if (isNaN(applicationId)) {
      res.status(400).json({ error: 'Invalid application ID' });
      return;
    }

    // Verify ownership
    const existing = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Application not found or unauthorized' });
      return;
    }

    const {
      companyName,
      jobTitle,
      location,
      jobType,
      status,
      appliedDate,
      salaryRange,
      jobUrl,
      contactName,
      notes,
    } = req.body;

    // Validation for updated fields
    if (companyName !== undefined && (typeof companyName !== 'string' || companyName.trim().length === 0)) {
      res.status(400).json({ error: 'Company name cannot be empty' });
      return;
    }

    if (jobTitle !== undefined && (typeof jobTitle !== 'string' || jobTitle.trim().length === 0)) {
      res.status(400).json({ error: 'Job title cannot be empty' });
      return;
    }

    if (location !== undefined && (typeof location !== 'string' || location.trim().length === 0)) {
      res.status(400).json({ error: 'Location cannot be empty' });
      return;
    }

    const validJobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];
    if (jobType !== undefined && !validJobTypes.includes(jobType)) {
      res.status(400).json({ error: `Job type must be one of: ${validJobTypes.join(', ')}` });
      return;
    }

    const validStatuses = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];
    if (status !== undefined && !validStatuses.includes(status)) {
      res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const updateData: any = {};
    if (companyName !== undefined) updateData.companyName = companyName.trim();
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (jobType !== undefined) updateData.jobType = jobType;
    if (status !== undefined) updateData.status = status;
    if (salaryRange !== undefined) updateData.salaryRange = salaryRange ? salaryRange.trim() : null;
    if (jobUrl !== undefined) updateData.jobUrl = jobUrl ? jobUrl.trim() : null;
    if (contactName !== undefined) updateData.contactName = contactName ? contactName.trim() : null;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

    if (appliedDate !== undefined) {
      const parsed = new Date(appliedDate);
      if (!isNaN(parsed.getTime())) {
        updateData.appliedDate = parsed;
      }
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: updateData,
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update job application' });
  }
});

// DELETE /api/applications/:id - delete application owned by user
applicationsRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const applicationId = parseInt(req.params.id, 10);

    if (isNaN(applicationId)) {
      res.status(400).json({ error: 'Invalid application ID' });
      return;
    }

    const existing = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Application not found or unauthorized' });
      return;
    }

    await prisma.jobApplication.delete({
      where: { id: applicationId },
    });

    res.json({ message: 'Application deleted successfully', id: applicationId });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});
