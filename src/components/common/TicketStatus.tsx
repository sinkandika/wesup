"use client";

export type StatusType = 'waiting' | 'on_progress' | 'resolved' | 'cancelled' | 'on_review' | 'rejected' | 'completed';

interface TicketStatusProps {
  status: StatusType | string;
}

export default function TicketStatus({ status }: TicketStatusProps) {

  const normalizedStatus = status.toLowerCase() as StatusType;

  const statusLabels: Record<StatusType, string> = {
    waiting: 'Waiting',
    on_progress: 'On Progress',
    resolved: 'Resolved',
    cancelled: 'Cancelled',
    on_review: 'On Review',
    rejected: 'Rejected',
    completed: 'Completed',
  };

  const statusStyles: Record<StatusType, string> = {
    waiting: 'text-color-4',
    on_progress: 'text-color-1',
    resolved: 'text-color-10',
    cancelled: 'text-color-4',
    on_review: 'text-color-8',
    rejected: 'text-color-9',
    completed: 'text-color-10',
  };

  // Fallback styles if an unexpected status string is passed
  const currentStyle = statusStyles[normalizedStatus] || 'text-gray-800';
  const currentLabel = statusLabels[normalizedStatus] || status;

  return (
    <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium border ${currentStyle}`}>
      {currentLabel}
    </span>
  );
};
