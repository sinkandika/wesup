import { supabase } from "../../lib/supabase";

// AUDIT ACTIONS
export const AUDIT_ACTIONS = {
  TICKET_CREATED: "ticket_created",
  TICKET_CANCELLED: "ticket_cancelled",
  ASSIGNMENT_ACCEPTED: "assignment_accepted",
  TECHNICIAN_COMPLETED: "technician_completed",
  TECHNICIAN_CANCELLED: "technician_cancelled",
  TICKET_APPROVED: "ticket_approved",
  TICKET_REJECTED: "ticket_rejected",
} as const;

type CreateAuditLogParams = {
  ticketId: string;
  assignmentId?: string | null;
  userId: string;
  action: string;
  description?: string | null;
};

// CREATE AUDIT LOG
export async function createAuditLog({
  ticketId,
  assignmentId = null,
  userId,
  action,
  description = null,
}: CreateAuditLogParams) {
  const { data, error } = await supabase
    .from("audit_log")
    .insert({
      ticket_id: ticketId,
      assignment_id: assignmentId,
      user_id: userId,
      action,
      description,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Create audit log error:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data,
  };
}

// GET AUDIT LOGS
export async function getAuditLogs(
  page: number = 1,
  limit: number = 10
) {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { data, error, count } = await supabase
    .from("audit_log")
    .select(
      `
        id,
        ticket_id,
        assignment_id,
        user_id,
        action,
        description,
        created_at,

        tickets:ticket_id (
          ticket_number
        ),

        users:user_id (
          id,
          first_name,
          last_name,
          role,
          image_url
        )
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Get audit logs error:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data,
    total: count ?? 0,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil((count ?? 0) / safeLimit),
  };
}

