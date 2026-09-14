import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  User as UserIcon,
  FileText,
  AlertCircle,
  Save,
} from 'lucide-react';
import { applicationsAPI } from '../services/api';
import { ApplicationFormData, JobType, ApplicationStatus } from '../types/index';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Loader } from '../components/ui/Loader';

export const ApplicationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ApplicationFormData>({
    companyName: '',
    jobTitle: '',
    location: '',
    jobType: 'Full-time',
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0],
    salaryRange: '',
    jobUrl: '',
    contactName: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchApp = async () => {
        try {
          setIsLoading(true);
          const app = await applicationsAPI.getById(id);
          setFormData({
            companyName: app.companyName,
            jobTitle: app.jobTitle,
            location: app.location,
            jobType: app.jobType,
            status: app.status,
            appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : '',
            salaryRange: app.salaryRange || '',
            jobUrl: app.jobUrl || '',
            contactName: app.contactName || '',
            notes: app.notes || '',
          });
        } catch (err: any) {
          console.error('Failed to load application for editing:', err);
          setServerError(err.response?.data?.error || 'Failed to load application data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchApp();
    }
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required (e.g. San Francisco, CA or Remote)';
    }

    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Application date is required';
    }

    if (formData.jobUrl && formData.jobUrl.trim()) {
      try {
        const urlToTest = formData.jobUrl.startsWith('http')
          ? formData.jobUrl
          : `https://${formData.jobUrl}`;
        new URL(urlToTest);
      } catch {
        newErrors.jobUrl = 'Please enter a valid URL (e.g., https://company.com/job)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for field on change
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditMode && id) {
        await applicationsAPI.update(id, formData);
      } else {
        await applicationsAPI.create(formData);
      }
      navigate('/applications');
    } catch (err: any) {
      console.error('Failed to save application:', err);
      setServerError(err.response?.data?.error || 'Failed to save application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader message="Loading application details..." />;
  }

  const jobTypeOptions = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Remote', label: 'Remote' },
  ];

  const statusOptions = [
    { value: 'Wishlist', label: 'Wishlist' },
    { value: 'Applied', label: 'Applied' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Offer', label: 'Offer' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6" id="application-form-page">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/applications"
          id="back-to-applications-link"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Back to applications"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Application' : 'Add New Application'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEditMode
              ? 'Update the details and current stage of this opportunity.'
              : 'Log a new position to keep your job search organized.'}
          </p>
        </div>
      </div>

      {serverError && (
        <div
          id="form-server-error-banner"
          className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6" id="job-application-form">
          {/* Section 1: Core Job Details */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Role & Company Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="form-company-name"
                name="companyName"
                label="Company Name"
                placeholder="e.g. Acme Corp or Google"
                value={formData.companyName}
                onChange={handleChange}
                error={errors.companyName}
                required
                leftIcon={<Building2 className="w-4 h-4" />}
              />

              <Input
                id="form-job-title"
                name="jobTitle"
                label="Job Title"
                placeholder="e.g. Senior Software Engineer"
                value={formData.jobTitle}
                onChange={handleChange}
                error={errors.jobTitle}
                required
                leftIcon={<Briefcase className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="form-location"
                name="location"
                label="Location"
                placeholder="e.g. San Francisco, CA or Remote"
                value={formData.location}
                onChange={handleChange}
                error={errors.location}
                required
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              <Select
                id="form-job-type"
                name="jobType"
                label="Job Type"
                options={jobTypeOptions}
                value={formData.jobType}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status & Application Timeline
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="form-status"
                name="status"
                label="Pipeline Status"
                options={statusOptions}
                value={formData.status}
                onChange={handleChange}
                required
              />

              <Input
                id="form-applied-date"
                name="appliedDate"
                type="date"
                label="Date Applied"
                value={formData.appliedDate}
                onChange={handleChange}
                error={errors.appliedDate}
                required
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Compensation & Contact Details (Optional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="form-salary-range"
                name="salaryRange"
                label="Salary Range / Rate"
                placeholder="e.g. $140,000 - $160,000"
                value={formData.salaryRange}
                onChange={handleChange}
                leftIcon={<DollarSign className="w-4 h-4" />}
              />

              <Input
                id="form-contact-name"
                name="contactName"
                label="Recruiter / Contact Person"
                placeholder="e.g. Jane Doe (Technical Recruiter)"
                value={formData.contactName}
                onChange={handleChange}
                leftIcon={<UserIcon className="w-4 h-4" />}
              />
            </div>

            <Input
              id="form-job-url"
              name="jobUrl"
              label="Job URL / Posting Link"
              placeholder="https://company.com/careers/job-id"
              value={formData.jobUrl}
              onChange={handleChange}
              error={errors.jobUrl}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-2">
            <label htmlFor="form-notes" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes & Interview Takeaways
            </label>
            <textarea
              id="form-notes"
              name="notes"
              rows={4}
              placeholder="Record notes on recruiters, interview rounds, prep questions, or follow-up dates..."
              value={formData.notes}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 text-sm text-slate-900 bg-white p-3.5 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/applications" id="cancel-form-button">
              <Button type="button" variant="outline" size="md" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>

            <Button
              id="submit-form-button"
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isEditMode ? 'Update Application' : 'Save Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
