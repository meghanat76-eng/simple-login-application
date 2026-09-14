import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  CheckCircle,
  HelpCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Plus,
  ExternalLink,
  Calendar,
  Building2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { dashboardAPI } from '../services/api';
import { DashboardStats, JobApplication } from '../types/index';
import { StatusBadge } from '../components/ui/StatusBadge';
import { JobTypeBadge } from '../components/ui/JobTypeBadge';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui/EmptyState';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return <Loader message="Loading dashboard statistics..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 rounded-xl border border-rose-200 text-center" id="dashboard-error-state">
        <p className="text-rose-700 font-medium mb-4">{error}</p>
        <Button onClick={fetchStats} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (!stats || stats.totalApplications === 0) {
    return (
      <div className="space-y-6" id="dashboard-empty-view">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your job hunt progress, pipeline health, and interview schedule.
          </p>
        </div>

        <EmptyState
          id="dashboard-no-apps-state"
          icon={<Briefcase className="w-8 h-8 text-blue-600" />}
          title="No job applications tracked yet"
          description="Get started by adding your first application, or import sample entries to visualize your metrics."
          actionLabel="Add Your First Application"
          onAction={() => window.location.assign('/applications/new')}
        />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tracked',
      value: stats.totalApplications,
      icon: <Briefcase className="w-5 h-5 text-slate-600" />,
      bg: 'bg-white',
      border: 'border-slate-200',
      id: 'stat-total-applications',
    },
    {
      title: 'Wishlist',
      value: stats.statusCounts.Wishlist,
      icon: <HelpCircle className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50/50',
      border: 'border-purple-200/80',
      id: 'stat-wishlist',
    },
    {
      title: 'Applied',
      value: stats.statusCounts.Applied,
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50/50',
      border: 'border-blue-200/80',
      id: 'stat-applied',
    },
    {
      title: 'Interviewing',
      value: stats.statusCounts.Interview,
      icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/50',
      border: 'border-amber-200/80',
      id: 'stat-interview',
    },
    {
      title: 'Offers Received',
      value: stats.statusCounts.Offer,
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200/80',
      id: 'stat-offer',
    },
    {
      title: 'Rejected',
      value: stats.statusCounts.Rejected,
      icon: <XCircle className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50/50',
      border: 'border-rose-200/80',
      id: 'stat-rejected',
    },
  ];

  // Filter out status breakdown entries with 0 for cleaner charts
  const activeStatusData = stats.statusBreakdown.filter((item) => item.value > 0);
  const activeJobTypeData = stats.jobTypeBreakdown.filter((item) => item.value > 0);

  return (
    <div className="space-y-8" id="dashboard-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time pipeline metrics and status of your active submissions.
          </p>
        </div>
        <Link to="/applications/new" id="dashboard-new-application-btn">
          <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
            New Application
          </Button>
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" id="dashboard-kpi-grid">
        {statCards.map((card) => (
          <div
            key={card.id}
            id={card.id}
            className={`p-4 rounded-xl border ${card.border} ${card.bg} shadow-xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 truncate">{card.title}</span>
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-grid">
        {/* Status Breakdown Pie Chart */}
        <div
          id="dashboard-status-chart-card"
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Application Status Distribution</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ratio of applications across pipeline stages</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {activeStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {activeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val} application${val === 1 ? '' : 's'}`, 'Count']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No status data available</p>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
            {stats.statusBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span>
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Job Type Bar Chart */}
        <div
          id="dashboard-job-type-chart-card"
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Applications by Work Arrangement</h2>
            <p className="text-xs text-slate-500 mt-0.5">Classification by employment arrangement</p>
          </div>

          <div className="h-64 w-full">
            {activeJobTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeJobTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: number) => [`${val} application${val === 1 ? '' : 's'}`, 'Total']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {activeJobTypeData.map((entry, index) => (
                      <Cell key={`type-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No job type data available
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span>Filter jobs on the Applications page</span>
            <Link to="/applications" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              View table <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Applications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="dashboard-recent-apps-card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most recently updated opportunities in your pipeline</p>
          </div>
          <Link
            to="/applications"
            id="dashboard-view-all-link"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All ({stats.totalApplications})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.recentApplications.map((app: JobApplication) => {
            const formattedDate = new Date(app.appliedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={app.id}
                id={`recent-app-item-${app.id}`}
                className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                    <Building2 className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/applications/${app.id}/edit`}
                        className="font-semibold text-sm text-slate-900 hover:text-blue-600"
                      >
                        {app.companyName}
                      </Link>
                      <JobTypeBadge jobType={app.jobType} />
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{app.jobTitle}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{app.location}</span>
                      {app.salaryRange && <span>• {app.salaryRange}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                  <Link
                    to={`/applications/${app.id}/edit`}
                    className="text-xs font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
