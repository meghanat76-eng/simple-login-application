import React from 'react';
import { JobType } from '../../types/index';

interface JobTypeBadgeProps {
  jobType: JobType | string;
  id?: string;
}

export const JobTypeBadge: React.FC<JobTypeBadgeProps> = ({ jobType, id }) => {
  const styles: Record<string, string> = {
    'Full-time': 'bg-sky-50 text-sky-700 border-sky-200',
    'Part-time': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Internship': 'bg-teal-50 text-teal-700 border-teal-200',
    'Contract': 'bg-amber-50 text-amber-700 border-amber-200',
    'Remote': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const badgeClass = styles[jobType] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      id={id}
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border ${badgeClass}`}
    >
      {jobType}
    </span>
  );
};
