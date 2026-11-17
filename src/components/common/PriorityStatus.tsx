"use client";

export type PriorityType = 'low' | 'normal' | 'high' | 'urgent'

interface PriorityStatusProps {
  priority: PriorityType | string;
}

export const PriorityStatus: React.FC<PriorityStatusProps> = ({priority}) => {

  const normalizedPriority = priority.toLowerCase() as PriorityType;
  
  const priorityStyle: Record<PriorityType, string> = {
    low: "text-color-4",
    normal: "text-color-1",
    high: "text-color-2",
    urgent: "text-color-9",
  }

  const priorityLabels: Record<PriorityType, string> = {
    low: "Low",
    normal: "Normal",
    high: "High",
    urgent: "Urgent",
  }

  // fallback for unexpected type
  const currentStyle = priorityStyle[normalizedPriority] || "bg-gray-100";
  const currentLabel = priorityLabels[normalizedPriority] || priority;

  return (
    <span className={`${currentStyle}`}>
      {currentLabel}
    </span>
  )
}


