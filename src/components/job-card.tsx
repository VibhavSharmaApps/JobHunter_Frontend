import React from "react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    status?: string;
    // Add more fields as needed
  };
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="p-4 border rounded shadow mb-2">
      <h3 className="font-semibold text-lg">{job.title}</h3>
      <p className="text-gray-600">{job.company}</p>
      {job.status && <p className="text-sm text-blue-500">Status: {job.status}</p>}
    </div>
  );
}
