
export type ActionType =
  | "ticket_created"
  | "ticket_cancelled"
  | "assignment_accepted"
  | "technician_completed"
  | "technician_cancelled"
  | "ticket_approved"
  | "ticket_rejected";

type ActionProps = {
  action: ActionType | string;
};

const actionStyles: Record<ActionType,{ label: string; color: string }> = {
  ticket_created: {
    label: "Ticket Created",
    color: "text-color-3",
  },
  ticket_cancelled: {
    label: "Ticket Cancelled",
    color: "text-color-4",
  },
  assignment_accepted: {
    label: "Ticket Accepted",
    color: "text-color-10",
  },
  technician_completed: {
    label: "Ticket Completed",
    color: "text-color-1",
  },
  technician_cancelled: {
    label: "Assignment Cancelled",
    color: "text-color-4",
  },
  ticket_approved: {
    label: "Assignment Approved",
    color: "text-color-10",
  },
  ticket_rejected: {
    label: "Assignment Rejected",
    color: "text-color-9",
  },
};

// LABEL STYLES
export default function AuditAction({ action }: ActionProps) {

  // fallback
  const actionStyle = actionStyles[action as ActionType] ?? {
      label: action.replaceAll("_", " "),
      color: "bg-gray-100 text-gray-700",
    };

  return (
    <span
      className={`font-medium 
        ${actionStyle.color}
      `}
    >
      {actionStyle.label}
    </span>
  );
}


