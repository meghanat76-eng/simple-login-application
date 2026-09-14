import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  User as UserIcon,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { applicationsAPI } from '../services/api';
import { JobApplication, ApplicationStatus, JobType } from '../types/index';
import { StatusBadge } from '../components/ui/StatusBadge';
import { JobTypeBadge } from '../components/ui/JobTypeBadge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui/EmptyState';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'appliedDate' | 'companyName' | 'createdAt'>('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const itemsPerPage = 8;

  // Modals
  const [deleteModalApp, setDeleteModalApp] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [viewModalApp, setViewModalApp] = useState<JobApplication | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await applicationsAPI.getAll({
        search: searchTerm,
        status: statusFilter,
        jobType: jobTypeFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage,
      });

      setApplications(res.applications);
      setTotalPages(res.totalPages);
      setTotalItems(res.total);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setError(err.response?.data?.error || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, jobTypeFilter, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleDelete = async () => {
    if (!deleteModalApp) return;

    try {
      setIsDeleting(true);
      await applicationsAPI.delete(deleteModalApp.id);
      setSuccessMessage(`Application for ${deleteModalApp.companyName} was deleted.`);
      setDeleteModalApp(null);
      loadApplications();
    } catch (err: any) {
      console.error('Failed to delete application:', err);
      setError(err.response?.data?.error || 'Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadApplications();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setJobTypeFilter('All');
    setSortBy('appliedDate');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6" id="applications-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, inspect, and update your active submissions.
          </p>
        </div>
        <Link to="/applications/new" id="applications-add-new-btn">
          <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Add Application
          </Button>
        </Link>
      </div>

      {/* Success notification banner */}
      {successMessage && (
        <div
          id="applications-success-banner"
          className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-in fade-in"
        >
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="p-1 text-emerald-600 hover:text-emerald-800 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error notification banner */}
      {error && (
        <div
          id="applications-error-banner"
          className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between"
        >
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 text-rose-600 hover:text-rose-800 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar: Search, Filters, Sort & View Mode */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4" id="applications-controls">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative" id="applications-search-form">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="applications-search-input"
              type="text"
              placeholder="Search company, job title, or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 self-end md:self-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="toggle-view-table"
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              id="toggle-view-cards"
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>

        {/* Filters and Sorting Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-status-select" className="text-xs font-semibold text-slate-600">
              Status
            </label>
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Wishlist">Wishlist</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-jobtype-select" className="text-xs font-semibold text-slate-600">
              Job Type
            </label>
            <select
              id="filter-jobtype-select"
              value={jobTypeFilter}
              onChange={(e) => {
                setJobTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Sort By Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="sort-by-select" className="text-xs font-semibold text-slate-600">
              Sort By
            </label>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="appliedDate">Applied Date</option>
              <option value="companyName">Company Name</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>

          {/* Sort Order Direction */}
          <div className="flex flex-col gap-1">
            <label htmlFor="sort-order-select" className="text-xs font-semibold text-slate-600">
              Order
            </label>
            <div className="flex items-center gap-2">
              <select
                id="sort-order-select"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="desc">Descending (Latest / Z-A)</option>
                <option value="asc">Ascending (Oldest / A-Z)</option>
              </select>

              {(searchTerm || statusFilter !== 'All' || jobTypeFilter !== 'All') && (
                <button
                  id="reset-filters-button"
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap px-2 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 font-medium transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {isLoading ? (
        <Loader message="Fetching applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          id="applications-empty-state"
          title="No applications match your criteria"
          description={
            searchTerm || statusFilter !== 'All' || jobTypeFilter !== 'All'
              ? 'Try adjusting or clearing your search filters to find what you are looking for.'
              : 'You have not created any job applications yet.'
          }
          actionLabel={
            searchTerm || statusFilter !== 'All' || jobTypeFilter !== 'All'
              ? 'Clear All Filters'
              : 'Add Your First Application'
          }
          onAction={
            searchTerm || statusFilter !== 'All' || jobTypeFilter !== 'All'
              ? handleResetFilters
              : () => window.location.assign('/applications/new')
          }
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div
          id="applications-table-wrapper"
          className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600" id="applications-table">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-4 sm:px-6">
                    Company & Role
                  </th>
                  <th scope="col" className="py-3.5 px-4 hidden md:table-cell">
                    Location & Type
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Status
                  </th>
                  <th scope="col" className="py-3.5 px-4 hidden sm:table-cell">
                    Applied Date
                  </th>
                  <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">
                    Salary Range
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const formattedDate = new Date(app.appliedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={app.id}
                      id={`application-row-${app.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900 hover:text-blue-600 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewModalApp(app)}
                            className="text-left font-semibold text-slate-900 hover:text-blue-600"
                          >
                            {app.companyName}
                          </button>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-blue-600"
                              title="Open original job posting"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{app.jobTitle}</div>
                        {/* Mobile metadata */}
                        <div className="mt-1 flex items-center gap-2 md:hidden">
                          <JobTypeBadge jobType={app.jobType} />
                          <span className="text-xs text-slate-400">{app.location}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="text-xs font-medium text-slate-800">{app.location}</div>
                        <div className="mt-1">
                          <JobTypeBadge jobType={app.jobType} />
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="py-4 px-4 hidden sm:table-cell text-xs text-slate-600">
                        {formattedDate}
                      </td>

                      <td className="py-4 px-4 hidden lg:table-cell text-xs text-slate-600">
                        {app.salaryRange || <span className="text-slate-400">—</span>}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`view-btn-${app.id}`}
                            onClick={() => setViewModalApp(app)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/applications/${app.id}/edit`}
                            id={`edit-btn-${app.id}`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Application"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            id={`delete-btn-${app.id}`}
                            onClick={() => setDeleteModalApp(app)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="applications-card-grid">
          {applications.map((app) => {
            const formattedDate = new Date(app.appliedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={app.id}
                id={`application-card-${app.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <StatusBadge status={app.status} />
                    <JobTypeBadge jobType={app.jobType} />
                  </div>

                  <h3 className="font-semibold text-base text-slate-900 leading-snug">
                    <button
                      type="button"
                      onClick={() => setViewModalApp(app)}
                      className="text-left hover:text-blue-600"
                    >
                      {app.companyName}
                    </button>
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-1">{app.jobTitle}</p>

                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{app.location}</span>
                    </div>

                    {app.salaryRange && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{app.salaryRange}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Applied: {formattedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewModalApp(app)}
                    className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/applications/${app.id}/edit`}
                      className="text-xs font-medium text-slate-600 hover:text-blue-600 p-1 rounded-md hover:bg-slate-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setDeleteModalApp(app)}
                      className="text-xs font-medium text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div
          id="applications-pagination"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600"
        >
          <div>
            Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{totalItems}</span> applications
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="pagination-prev-button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <span className="px-3 py-1 font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              id="pagination-next-button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        id="delete-confirmation-modal"
        isOpen={!!deleteModalApp}
        onClose={() => setDeleteModalApp(null)}
        title="Confirm Application Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg text-rose-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>
              Are you sure you want to permanently delete the application for{' '}
              <strong className="font-bold">{deleteModalApp?.jobTitle}</strong> at{' '}
              <strong className="font-bold">{deleteModalApp?.companyName}</strong>?
            </p>
          </div>
          <p className="text-xs text-slate-500">
            This action removes the record from your local SQLite database and cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              id="cancel-delete-btn"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalApp(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              id="confirm-delete-btn"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Application Details Modal */}
      <Modal
        id="view-details-modal"
        isOpen={!!viewModalApp}
        onClose={() => setViewModalApp(null)}
        title="Application Details"
        maxWidth="lg"
      >
        {viewModalApp && (
          <div className="space-y-5 text-sm" id="view-details-content">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewModalApp.companyName}</h3>
                <p className="text-slate-600 font-medium text-sm mt-0.5">{viewModalApp.jobTitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={viewModalApp.status} />
                <JobTypeBadge jobType={viewModalApp.jobType} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium">Location</span>
                <p className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {viewModalApp.location}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium">Applied Date</span>
                <p className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(viewModalApp.appliedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium">Salary Range</span>
                <p className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  {viewModalApp.salaryRange || 'Not specified'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium">Contact Person</span>
                <p className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  {viewModalApp.contactName || 'No contact provided'}
                </p>
              </div>
            </div>

            {viewModalApp.jobUrl && (
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
                <span className="text-blue-900 font-medium">Job URL / Listing</span>
                <a
                  href={viewModalApp.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 underline"
                >
                  Visit Link <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {viewModalApp.notes && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Notes & Follow-ups
                </span>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {viewModalApp.notes}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Created: {new Date(viewModalApp.createdAt).toLocaleDateString()} • ID #{viewModalApp.id}
              </span>
              <div className="flex items-center gap-2">
                <Link to={`/applications/${viewModalApp.id}/edit`}>
                  <Button size="sm" variant="outline" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                    Edit
                  </Button>
                </Link>
                <Button size="sm" variant="secondary" onClick={() => setViewModalApp(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
