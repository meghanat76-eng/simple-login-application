import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data for clean demo
  await prisma.jobApplication.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
    },
  });

  console.log(`Created user: ${demoUser.email} (password: password123)`);

  const sampleApplications = [
    {
      companyName: 'Stripe',
      jobTitle: 'Senior Frontend Engineer',
      location: 'San Francisco, CA (Remote)',
      jobType: 'Remote',
      status: 'Offer',
      appliedDate: new Date('2026-08-15T09:00:00.000Z'),
      salaryRange: '$165,000 - $190,000',
      jobUrl: 'https://stripe.com/jobs',
      contactName: 'Sarah Jenkins (Recruiter)',
      notes: 'Final offer letter received! Reviewing equity package and benefits before signing.',
    },
    {
      companyName: 'Airbnb',
      jobTitle: 'Full Stack Developer',
      location: 'San Francisco, CA',
      jobType: 'Full-time',
      status: 'Interview',
      appliedDate: new Date('2026-08-28T14:30:00.000Z'),
      salaryRange: '$150,000 - $175,000',
      jobUrl: 'https://airbnb.com/careers',
      contactName: 'Marcus Chen (Engineering Manager)',
      notes: 'Completed technical coding round. System design interview scheduled for Thursday.',
    },
    {
      companyName: 'GitHub',
      jobTitle: 'Software Engineer II, Ecosystem',
      location: 'Remote, USA',
      jobType: 'Remote',
      status: 'Applied',
      appliedDate: new Date('2026-09-02T11:00:00.000Z'),
      salaryRange: '$140,000 - $160,000',
      jobUrl: 'https://github.com/careers',
      contactName: 'Emily Vance',
      notes: 'Applied with referral from former colleague. Confirmation email received.',
    },
    {
      companyName: 'Figma',
      jobTitle: 'Product Engineer, Canvas UI',
      location: 'San Francisco, CA',
      jobType: 'Full-time',
      status: 'Interview',
      appliedDate: new Date('2026-08-20T10:15:00.000Z'),
      salaryRange: '$160,000 - $185,000',
      jobUrl: 'https://figma.com/careers',
      contactName: 'Alex Wong',
      notes: 'Take-home assessment passed with praise for React performance. Meeting team this week.',
    },
    {
      companyName: 'Datadog',
      jobTitle: 'Backend Engineer, Platform Services',
      location: 'New York, NY',
      jobType: 'Full-time',
      status: 'Applied',
      appliedDate: new Date('2026-09-05T16:45:00.000Z'),
      salaryRange: '$145,000 - $170,000',
      jobUrl: 'https://datadoghq.com/careers',
      contactName: 'Jessica Miller',
      notes: 'Submitted resume and portfolio through university portal.',
    },
    {
      companyName: 'Vercel',
      jobTitle: 'Developer Experience Engineer',
      location: 'Remote',
      jobType: 'Remote',
      status: 'Wishlist',
      appliedDate: new Date('2026-09-10T13:00:00.000Z'),
      salaryRange: '$150,000 - $170,000',
      jobUrl: 'https://vercel.com/careers',
      contactName: 'Guillermo Rau',
      notes: 'Target role. Working on open-source Next.js contribution before applying.',
    },
    {
      companyName: 'Linear',
      jobTitle: 'Product Systems Contractor',
      location: 'Remote, Global',
      jobType: 'Contract',
      status: 'Wishlist',
      appliedDate: new Date('2026-09-12T12:00:00.000Z'),
      salaryRange: '$90 - $120 / hr',
      jobUrl: 'https://linear.app/careers',
      contactName: 'Karri Saarinen',
      notes: '6-month contract with possibility of full-time conversion.',
    },
    {
      companyName: 'Cloudflare',
      jobTitle: 'Systems Engineer, Edge Network',
      location: 'Austin, TX',
      jobType: 'Full-time',
      status: 'Rejected',
      appliedDate: new Date('2026-07-20T09:30:00.000Z'),
      salaryRange: '$135,000 - $155,000',
      jobUrl: 'https://cloudflare.com/careers',
      contactName: 'Robert Taylor',
      notes: 'Position closed due to internal candidate selection. Recruiter encouraged re-applying in 6 months.',
    },
    {
      companyName: 'Spotify',
      jobTitle: 'Web Infrastructure Specialist',
      location: 'Boston, MA',
      jobType: 'Part-time',
      status: 'Rejected',
      appliedDate: new Date('2026-07-15T15:00:00.000Z'),
      salaryRange: '$70 - $85 / hr',
      jobUrl: 'https://spotify.com/jobs',
      contactName: 'Daniel Ekstrom',
      notes: 'Resume screening rejection after 2 weeks.',
    },
    {
      companyName: 'Notion',
      jobTitle: 'Frontend Engineer, Blocks & Editor',
      location: 'San Francisco, CA',
      jobType: 'Full-time',
      status: 'Applied',
      appliedDate: new Date('2026-09-08T11:20:00.000Z'),
      salaryRange: '$155,000 - $180,000',
      jobUrl: 'https://notion.so/careers',
      contactName: 'Rachel Green',
      notes: 'Applied via website. Followed up with hiring manager on LinkedIn.',
    },
    {
      companyName: 'Supabase',
      jobTitle: 'Developer Advocate & Community',
      location: 'Remote',
      jobType: 'Remote',
      status: 'Interview',
      appliedDate: new Date('2026-08-25T17:00:00.000Z'),
      salaryRange: '$130,000 - $150,000',
      jobUrl: 'https://supabase.com/careers',
      contactName: 'Thorsten Schaeff',
      notes: 'Initial chat completed. Preparing a 15-minute tutorial presentation for round 2.',
    },
    {
      companyName: 'OpenAI',
      jobTitle: 'UI Engineering Intern',
      location: 'San Francisco, CA',
      jobType: 'Internship',
      status: 'Wishlist',
      appliedDate: new Date('2026-09-11T10:00:00.000Z'),
      salaryRange: '$60 - $70 / hr',
      jobUrl: 'https://openai.com/careers',
      contactName: 'Talent Acquisition Team',
      notes: 'Applications open next week. Refining resume and AI portfolio demos.',
    },
  ];

  for (const app of sampleApplications) {
    await prisma.jobApplication.create({
      data: {
        ...app,
        userId: demoUser.id,
      },
    });
  }

  console.log(`Seeded ${sampleApplications.length} sample job applications.`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
