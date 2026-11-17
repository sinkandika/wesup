import { supabase } from "../../lib/supabase";
import { AUDIT_ACTIONS, createAuditLog } from "../audit-log/audit.log.service";
import { uploadImageService } from "../image/image.service";
import { generateTicketNumber } from "./ticketNumber.service";

type createTicketItem = {
  categoryId: string;
  title: string;
  description?: string;
  images?: Buffer[];
}

type CreateTicket = {
  userId : string;
  locationId : string;
  departmentId: string;
  priority: "low" | "normal" | "high" | "urgent";
  items: createTicketItem[];
}

// -------------------------------------------- TICKET --------------------------------------------

// GET ALL TICKETS BY USER ID
export async function getMyTicket(userId: string) {
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      *,
      ticket_items (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// TICKET WITH TICKET STATUS "waiting" BY TECHNICIAN ID
export async function getWaitingTickets(technicianId: string) {
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      priority,  
      status,
      created_at,

      users:user_id (
        id,
        first_name,
        last_name
      ),

      ticket_items(
        id,
        title
      ),

      locations (
        name
      ),

      departments (
        name
      ),

      ticket_assignments (
        id,
        technician_id,
        status
      )
    `)
    .in("status", ["waiting", "on_progress"])
    .order("status", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // show waiting status to every technician
  const filteredTickets = data.filter((ticket) => {
    if (ticket.status === "waiting") {
      return true;
    }

    // show on_progress tickets only to technician who accept it
    return ticket.ticket_assignments.some((assign) => 
      assign.technician_id === technicianId &&
      assign.status === "on_progress"
    );
  });

  return filteredTickets;
}

// CREATE TICKET
export async function createTicket(input: CreateTicket) {
  const {
    userId,
    locationId,
    departmentId,
    priority= "normal",
    items,
  } = input

  if (!items.length) {
    throw new Error("A ticket must contain at least one item");
  }

  // generate ticket number
  const ticketNumber = await generateTicketNumber();

  // create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      ticket_number: ticketNumber,
      user_id: userId,
      location_id: locationId,
      department_id: departmentId,
      priority: priority,
    })
    .select()
    .single();

  if (ticketError) {
    throw new Error(ticketError.message);
  }

  // create ticket items 
  const createdItems = [];

  for (const item of items) {
    const { data: ticketItem, error } = await supabase
      .from("ticket_items")
      .insert({
        ticket_id: ticket.id,
        category_id: item.categoryId,
        title: item.title,
        description: item.description ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // create image by item
    for (const imageBuffer of item.images ?? []) {
      const result = await uploadImageService(
        imageBuffer,
        "wesup/ticket-items"
      ) as { secure_url: string };

      const { error: imageError } = await supabase
        .from("ticket_item_images")
        .insert({
          ticket_item_id: ticketItem.id,
          image_url: result.secure_url,
        });

      if (imageError) {
        throw new Error(imageError.message);
      }
    }

    createdItems.push(ticketItem);
  }

  // get user name
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Get user name error:", userError);
  }

  const userName = user
  ? `${user.first_name} ${user.last_name}`
  : "Unknown technician";

  // create audit log
  const auditResult = await createAuditLog({
    ticketId: ticket.id,
    userId: userId,
    action: AUDIT_ACTIONS.TICKET_CREATED,
    description: `Ticket ${ticketNumber} was created by ${userName}`,
  })

  if (!auditResult.success) {
    console.error("Ticket created, but audit logging failed:", auditResult.error);
  }

  return {
    ticket,
    items: createdItems,
  }
}

// USER CANCEL TICKET
export async function cancelUserTicket(
  ticketId: string,
  userId: string,
  cancellationNote: string
) {
  const { data, error } = await supabase
    .from("tickets")
    .update({
      status:"cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId,
      cancellation_note: cancellationNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error ("Ticket cannot be cancelled")
  }

  // get user name
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Get user name error:", userError);
  }

  const userName = user
  ? `${user.first_name} ${user.last_name}`
  : "Unknown technician";

  // create audit log
  const auditResult = await createAuditLog({
    ticketId: ticketId,
    userId: userId,
    action: AUDIT_ACTIONS.TICKET_CANCELLED,
    description: `Ticket ${data.ticket_number} was cancelled by ${userName}`,
  })

  if (!auditResult.success) {
    console.error("Ticket created, but audit logging failed:", auditResult.error);
  }

  return data;
}

// -------------------------------------------- ASSIGNMENT --------------------------------------------

// TECHNICIAN ACCEPT TICKET AND CREATE TICKET ASSIGNMENT
export async function  acceptTicket(
  ticketId: string,
  technicianId: string,
) {
  // get/check if ticket still in waiting
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, ticket_number, status")
    .eq("id", ticketId)
    .eq("status", "waiting")
    .maybeSingle();

  if (ticketError) {
    throw new Error(ticketError.message);
  }

  if (!ticket) {
    throw new Error("Ticket is no longer available");
  }

  // update tickets.status 
  const { data: updateTicket, error:updateError } = await supabase
    .from("tickets")
    .update({
      status: "on_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId)
    .eq("status", "waiting")
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (!updateTicket) {
    throw new Error("Ticket has already been accepted");
  }

  // create ticket.assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from("ticket_assignments")
    .insert({
      ticket_id: ticketId,
      technician_id: technicianId,
      status: "on_progress",
      accepted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (assignmentError) {
    // roll back tickets.status into waiting again if creating tickets.assignments fails
    const { error: rollbackError } = await supabase
      .from("tickets")
      .update({
        status: "waiting",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .eq("status", "on_progress");

    if (rollbackError) {
      throw new Error(
        `Create assignment failed: ${assignmentError.message}.` +
        `Ticket rollback aslo failed: ${rollbackError.message}`
      );
    }

    throw new Error(assignmentError.message);
  }
  
  // get technician name
  const { data: technician, error: technicianError } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", technicianId)
    .single();

  if (technicianError) {
    console.error("Get technician name error:", technicianError);
  }

  const technicianName = technician
  ? `${technician.first_name} ${technician.last_name}`
  : "Unknown technician";

  // create audit log
  const auditResult = await createAuditLog({
    ticketId: ticketId,
    assignmentId: assignment.id,
    userId: technicianId,
    action: AUDIT_ACTIONS.ASSIGNMENT_ACCEPTED,
    description: `Ticket ${ticket.ticket_number} was accepted by ${technicianName}`,
  });

  if (!auditResult.success) {
    console.error("Assignment created, but audit logging failed:", auditResult.error);
  }

    return assignment;
}

// GET TICKET DETAILS BY TICKET ID
export async function getTicketDetails(ticketId: string) {
  const {data, error} = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      priority,
      status,
      updated_at,
      resolved_at,
      created_at, 
      users:user_id (
        id,
        first_name,
        last_name
      ),

      locations (
        name
      ),

      departments (
        name
      ),

      ticket_items (
        id,
        title,
        description,

        categories (
          id,
          name
        ),

        ticket_item_images (
          id,
          image_url
        )
      ),

      ticket_assignments (
        id,
        status,
        accepted_at,
        completed_at,
        technician_note,
        supervisor_note,

        users:technician_id (
          id,
          first_name,
          last_name,
          employee_id
        )
      )
    `)
    .eq("id", ticketId)
    .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error ("Ticket not found");
    }

    return data;
}

// TECHNICIAN COMPLETE TICKET (update tickets and tickets assignments)
export async function completeTicket(
  ticketId: string,
  technicianId: string,
  technicianNote: string | null
) {

  const note = technicianNote?.trim() || null;

  // check if ticket is currently on_progress
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, ticket_number, status")
    .eq("id", ticketId)
    .eq("status", "on_progress")
    .maybeSingle();

  if (ticketError) {
    throw new Error(ticketError.message);
  }

  if (!ticket) {
    throw new Error("Ticket is not available for completion");
  }

  // find the technician active assignment
  const { data: assignment, error: assignmentError} = await supabase
    .from("ticket_assignments")
    .select("id, status")
    .eq("ticket_id", ticketId)
    .eq("technician_id", technicianId)
    .eq("status", "on_progress")
    .maybeSingle();

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  if (!assignment) {
    throw new Error("No active assignment found for this technician")
  }

  const completeAt = new Date().toISOString();

  // change ticket_assignment.status with on_review
  const { data: updateAssignment, error: updateAssignmentError }= await supabase
    .from("ticket_assignments")
    .update({
      status: "on_review",
      completed_at: completeAt,
      technician_note: note,
    })
    .eq("id", assignment.id)
    .eq("status","on_progress")
    .select()
    .maybeSingle();

  if (updateAssignmentError) {
    throw new Error(updateAssignmentError.message);
  }

  if (!updateAssignment) {
    throw new Error("Assignment has already been updated");
  }

  // update the tickets.updated_at
  const { data: updateTicket, error:updateTicketError } = await supabase
    .from("tickets")
    .update({
      updated_at: completeAt
    })
    .eq("id", ticketId)
    .eq("status", "on_progress")
    .select("id")
    .maybeSingle();

  if (updateTicketError || !updateTicket) {
    // rollback of update
    const { error: rollbackError } = await supabase
      .from("ticket_assignments")
      .update({
        status: "on_progress",
        complete_at: null,
        technician_note: null,
      })
      .eq("id", assignment.id)
      .eq("status", "on_review");

    if (rollbackError) {
      throw new Error (`Ticket update failed. Assignment rollback also failed: ${rollbackError.message}`)
    };

    throw new Error (
      updateTicketError?.message ?? "Ticket status changed before completion"
    );
  }

  // get technician name
  const { data: technician, error: technicianError } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", technicianId)
    .single();

  if (technicianError) {
    console.error("Get technician name error:", technicianError);
  }

  const technicianName = technician
  ? `${technician.first_name} ${technician.last_name}`
  : "Unknown technician";

  // get audit log
  const auditResult = await createAuditLog({
    ticketId,
    assignmentId: assignment.id,
    userId: technicianId,
    action: AUDIT_ACTIONS.TECHNICIAN_COMPLETED,
    description: `Ticket ${ticket.ticket_number} was completed by ${technicianName}`
  })

  if (!auditResult.success) {
    console.error("Assignment completed, but audit logging failed:", auditResult.error)
  }

  return {
    ticket: updateTicket,
    assignment: updateAssignment
  }
}

// GET TICKET WITH ASSIGNMENT STATUS "on_review" (SUPERVISOR REVIEW)
export async function getReviewTicket() {
  const { data, error } = await supabase
    .from("ticket_assignments")
    .select(`
      id,
      status,
      ticket_id,
      accepted_at,
      completed_at,
      created_at,
      users:technician_id (
        id,
        first_name,
        last_name,
        employee_id
      ),

      tickets (
        id,
        ticket_number,
        priority,
        status,

        locations (
          name
        ),

        departments (
          name
        ),

        ticket_items (
          id,
          title
        ),

        users:user_id(
          first_name,
          last_name
        )
      )
    `) 
    .eq("status", "on_review")
    .order("completed_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// SUPERVISOR APPROVE THE TICKET
export async function approveTicket(
  assignmentId: string,
  supervisorId: string,
  supervisorNote?: string
) {

  // check assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from("ticket_assignments")
    .select("id, ticket_id, status")
    .eq("id", assignmentId)
    .eq("status", "on_review")
    .single();
    
  if (assignmentError) { 
    throw new Error(assignmentError.message);
  }

  if (!assignment) {
    throw new Error("Assignment is not available");
  }

  const now = new Date().toISOString();

  // update ticket_assignments
  const { error: updateAssignmentError } = await supabase
    .from("ticket_assignments")
    .update({
      status: "completed",
      supervisor_note: supervisorNote?.trim() || null,
    })
    .eq("id", assignmentId)
    .eq("status", "on_review");

  if (updateAssignmentError) {
    throw new Error(updateAssignmentError.message);
  }

  // update tickets
  const { error: updateTicketError } = await supabase
    .from("tickets")
    .update({
      status: "resolved",
      updated_at: now,
      resolved_at: now,
    })
    .eq("id", assignment.ticket_id)
  
  // rollback
  if (updateTicketError) {
    const { error: rollbackError } = await supabase
      .from("ticket_assignments")
      .update({
        status: "on_review",
        supervisor_note: null,
      })
      .eq("id", assignmentId);

      if (rollbackError) {
        console.error("rollback failed:", rollbackError);
      }

      throw new Error(updateTicketError.message);
  }

  // get ticket number
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, ticket_number")
    .eq("id", assignment.ticket_id)
    .single();

  if (ticketError) {
    throw new Error(ticketError.message);
  }

  // get supervisor name
  const { data: supervisor, error: supervisorError} = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", supervisorId)
    .single();

  if (supervisorError) {
    console.error("Get users for supervisor name error:", supervisorError)
  }

  const supervisorName = supervisor
    ? `${supervisor.first_name} ${supervisor.last_name}`
    : "Unknown supervisor";

  // create audit log
  const auditResult = await createAuditLog({
    ticketId: assignment.ticket_id,
    assignmentId,
    userId: supervisorId,
    action: AUDIT_ACTIONS.TICKET_APPROVED,
    description: `Ticket ${ticket.ticket_number} was approved by ${supervisorName}`
  })

  if (!auditResult.success) {
    console.error("Ticket and assignment approved, but audit log failed:", auditResult.error)
  }

  return {
    ticketId: assignment.ticket_id,
    assignmentId,
  }
} 

// SUPERVISOR REJECT THE TICKET
export async function rejectTicket(
  assignmentId: string,
  supervisorId: string,
  supervisorNote: string
) {

  // note not null
  const note = supervisorNote?.trim();

  if (!note) {
    throw new Error("Supervisor note is required");
  }

  // check ticket_assignments
  const { data: assignment, error: assignmentError } = await supabase
    .from("ticket_assignments")
    .select("id, ticket_id, status")
    .eq("id", assignmentId)
    .eq("status", "on_review")
    .single();

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  const now = new Date().toISOString();

  // update ticket_assignments
  const { error: updateAssignmentError } = await supabase
    .from("ticket_assignments")
    .update({
      status: "rejected",
      supervisor_note: note,
    })
    .eq("id", assignmentId)
    .eq("status", "on_review");

  if (updateAssignmentError) {
    throw new Error(updateAssignmentError.message)
  }

  // update tickets
  const { error: updateTicketError } = await supabase
    .from("tickets")
    .update({
      status: "waiting",
      updated_at: now,
      resolved_at: null,
    })
    .eq("id", assignment.ticket_id);

  // rollback
  if (updateTicketError) {
    const { error: rollbackError } = await supabase
      .from("ticket_assignments")
      .update({
        status: "on_review",
        supervisor_note: null,
      })
      .eq("id", assignmentId);

      if (rollbackError) {
        console.error("Rejection rollback failed", rollbackError);
      }

      throw new Error(updateTicketError.message);
  }

  // get ticket number
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, ticket_number")
    .eq("id", assignment.ticket_id)
    .single();

  if (ticketError) {
    throw new Error(ticketError.message);
  }

  // get supervisor name
  const { data: supervisor, error: supervisorError} = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", supervisorId)
    .single();

  if (supervisorError) {
    console.error("Get users for supervisor name error:", supervisorError)
  }

  const supervisorName = supervisor
    ? `${supervisor.first_name} ${supervisor.last_name}`
    : "Unknown supervisor";

  // create audit log
  const auditResult = await createAuditLog({
    ticketId: assignment.ticket_id,
    assignmentId,
    userId: supervisorId,
    action: AUDIT_ACTIONS.TICKET_REJECTED,
    description: `Ticket ${ticket.ticket_number} was rejected by ${supervisorName}`
  })

  if (!auditResult.success) {
    console.error("Ticket and assignment rejected, but audit log failed:", auditResult.error)
  }

  return {
    ticketId: assignment.ticket_id,
    assignmentId,
  };
}

// TECHNICIAN CANCEL TICKET
export async function cancelTechnicianTicket(
  ticketId: string,
  technicianId: string,
  cancellationNote: string
) {
  // get/check if ticket still in on progress
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, ticket_number, status")
    .eq("id", ticketId)
    .eq("status", "on_progress")
    .maybeSingle();

  if (ticketError) {
    throw new Error(ticketError.message);
  }

  if (!ticket) {
    throw new Error("Ticket is no longer available");
  }

  // Check whether this technician owns an active assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from("ticket_assignments")
    .select("id, status")
    .eq("ticket_id", ticketId)
    .eq("technician_id", technicianId)
    .eq("status", "on_progress")
    .maybeSingle();

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  if (!assignment) {
    throw new Error("You do not have an active assignment for this ticket");
  }

  // Cancel the ticket
  const { data: cancleTicket, error: cancelTicketError } = await supabase
    .from("tickets")
    .update({
      status: "cancelled",
      cancelled_by: technicianId,
      cancelled_at: new Date().toISOString(),
      cancellation_note: cancellationNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId)
    .eq("status", "on_progress")
    .select("id")
    .maybeSingle();

  if (cancelTicketError) {
    throw new Error(cancelTicketError.message);
  }

  if (!cancleTicket) {
    throw new Error("Ticket is no longer available for cancellation");
  }

  // Cancel the technician assignment
  const { error: updateAssignmentError } = await supabase
    .from("ticket_assignments")
    .update({
      status: "cancelled",
    })
    .eq("id", assignment.id)
    .eq("status", "on_progress");

  if (updateAssignmentError) {
    throw new Error(updateAssignmentError.message);
  }

  // get technician name
  const { data: technician, error: technicianError } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", technicianId)
    .single();

  if (technicianError) {
    console.error("Get technician name error:", technicianError);
  }
  
  const technicianName = technician
  ? `${technician.first_name} ${technician.last_name}`
  : "Unknown technician";

  // create audit log
  const auditResult = await createAuditLog({
    ticketId,
    assignmentId: assignment.id,
    userId: technicianId,
    action: AUDIT_ACTIONS.TECHNICIAN_CANCELLED,
    description: `Ticket ${ticket.ticket_number} was cancelled by ${technicianName}`,
  });

  if (!auditResult.success) {
    console.error("Assignment created, but audit logging failed:", auditResult.error);
  }

  return {
    ticketId,
    assignmentId: assignment.id,
  };
}

// -------------------------------------------- HISTORY --------------------------------------------

// GET TECHNICIAN TICKET ASSIGNMENT BY ID EXPCEPT on_progress STATUS
export async function getTechnicianHistory(
  technicianId: string
) {
  const { data, error } = await supabase
    .from("ticket_assignments")
    .select(`
      id,
      status,
      accepted_at,
      completed_at,

      tickets:ticket_id (
        id,
        ticket_number,
        priority
      ),

      users:technician_id (
        id,
        first_name,
        last_name
      )
    `)
    .eq("technician_id", technicianId)
    .neq("status", "on_progress")
    .order("created_at", { ascending: false});

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// GET ALL TICKETS RECEIVED
export async function getAllTicketsReceived(
  technicianID: string
) {
  const { count, error } = await supabase
    .from("ticket_assignments")
    .select("id", { count: "exact", head: true })
    .eq("technician_id", technicianID);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

// GET TECHNICIAN DAILY TICKET (ONLY TRACK IF TICKET CREATED TODAY)
export async function getDailyTicket(
  technicianId: string
) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { count, error } = await supabase
    .from("ticket_assignments")
    .select("id", { count: "exact", head: true })
    .eq("technician_id", technicianId)
    .gte("accepted_at", startOfDay.toISOString())
    .lte("accepted_at", endOfDay.toISOString())

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

// GET TECHNICIAN CANCELLED TICKET RECEIVED
export async function getCancelledTicket(
  technicianId: string
) {
  const { count, error } = await supabase
    .from("ticket_assignments")
    .select("id", { count: "exact", head: true })
    .eq("technician_id", technicianId)
    .eq("status", "cancelled")

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

// GET TECHNICIAN REJECTED TICKET RECEIVED
export async function getRejectedTicket(
  technicianId: string
) {
  const { count, error } = await supabase
    .from("ticket_assignments")
    .select("id", { count: "exact", head: true })
    .eq("technician_id", technicianId)
    .eq("status", "rejected")

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

// GET TECHNICIAN AVERAGE COMPLETION TIME
export async function getAverageCompletionTime(
  technicianID: string
): Promise<string> {
  const { data, error } = await supabase
    .from("ticket_assignments")
    .select("accepted_at, completed_at")
    .eq("technician_id", technicianID)
    .eq("status", "completed")
    .not("completed_at", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return "00:00:00";
  }

  const totalTime = data.reduce((total, assignment) => {
    const accepted = new Date(assignment.accepted_at).getTime();
    const completed = new Date(assignment.completed_at!).getTime();

    return total + (completed - accepted);
  }, 0);

  const averageTimeMs = totalTime / data.length;

  // Convert milliseconds to total seconds
  const totalSeconds = Math.round(averageTimeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

// GET TECHNICIAN DAILY TICKET RESOLVED
export async function getDailyResolvedTicket(technicianId: string) {

  // Get today's date in Jakarta timezone
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")!.value;
  const month = parts.find((part) => part.type === "month")!.value;
  const day = parts.find((part) => part.type === "day")!.value;

  // Convert Jakarta midnight to UTC
  const startOfDay = new Date(
    `${year}-${month}-${day}T00:00:00+07:00`
  );

  const endOfDay = new Date(
    startOfDay.getTime() + 24 * 60 * 60 * 1000
  );

  const { count, error } = await supabase
    .from("ticket_assignments")
    .select("id, tickets:ticket_id!inner(resolved_at)", {
      count: "exact",
      head: true,
    })
    .eq("technician_id", technicianId)
    .eq("status", "completed")
    .gte("tickets.resolved_at", startOfDay.toISOString())
    .lt("tickets.resolved_at", endOfDay.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}