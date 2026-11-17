"use client";

import { useEffect, useState } from "react";

import { PriorityStatus } from "../common/PriorityStatus";
import { FormattedDateCols } from "../common/FormattedDate";
import TicketStatus from "@/src/components/common/TicketStatus";
import TicketCancelModal from "./TicketCancelModal";

type TicketDetails = {
  id: string;
  ticket_number: string;
  priority: string;
  status: string;
  updated_at: string | null;
  resolved_at: string | null;
  created_at: string;
  users: {
    id: string;
    first_name: string;
    last_name: string | null;
  };
  locations: {
    name: string;
  };
  departments: {
    name: string;
  };
  ticket_items: {
    id: string;
    title: string;
    description: string | null;
    categories: {
      id: string;
      name: string;
    };
    ticket_item_images: {
      id: string;
      image_url: string | null;
    }[];
  } [];
  ticket_assignments: {
    id: string;
    technician_id: string;
    status: string;
    users: {
      id: string;
      first_name: string;
      last_name: string | null;
      employee_id: string;
    };
    accepted_at: string;
    completed_at: string | null;
    technician_note: string | null;
    supervisor_note: string | null;
  } [];
};

interface ModalProps {
  ticketId: string | null;
  assignmentId: string | null;
  mode: "technician" | "supervisor" | "user";
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailModal({
  ticketId,
  assignmentId,
  mode,
  isOpen,
  onClose,
}: ModalProps) {

  const [tickets, setTickets] = useState<TicketDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  const [technicianNote, setTechnicianNote] = useState("");
  const [loadingCompleting, setLoadingCompleting] = useState(false);
  const [completeMessage, setCompleteMessage] = useState("");
  const [completeError, setCompleteError] = useState("")

  const [supervisorNote, setSupervisorNote] = useState("");
  const [loadingReview, setLoadingReview] = useState<"approve" | "reject" | null>(null);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [cancellationNote, setCancellationNote] = useState("");
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelError, setCancelError] = useState("");

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // PREVENT CLOSE
  const preventCloseClick = (e: React.MouseEvent) => e.stopPropagation();

  // HANDLE CLOSE
  const handleClose = () => {
    setTechnicianNote("");
    setSupervisorNote("");
    setCompleteMessage("");
    setCompleteError("")
    setError("");
    setReviewMessage("");
    setReviewError("");
    setCancelMessage("");
    setCancelError("");
    setTickets(null)
    setIsCancelModalOpen(false)
    onClose();
  }

  // FETCH TICKET DETAILS
  useEffect(() => {
    if (!ticketId) {
      setTickets(null);
      return;
    }

    const fetchTicketDetails = async () => {
      setLoadingDetails(true);
      setError("");
      setTickets(null);

      try {
        const response = await fetch(`/api/tickets/${ticketId}`)
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch ticket details");
        };

        setTickets(result.data as TicketDetails);

      } catch (error) {
        setError(
          error instanceof Error
          ? error.message
          : "Something went wrong"
        );

      }finally {
        setLoadingDetails(false);
      }
    }

    fetchTicketDetails();
  }, [ticketId]);

  // TECHNICIAN HANDLE COMPLETE
  const handleComplete = async () => {
    if (!tickets) return;

    setLoadingCompleting(true);
    setCompleteMessage("");
    setError("");

    try {
      const response = await fetch(`/api/assignments/${tickets.id}/complete`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            technicianNote: technicianNote.trim() || null,
          }),
        }
      ); 

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to complete ticket");
      }

      setCompleteMessage("Ticket submitted!");

      // refresh ticket details
      const detailsResponse = await fetch(`/api/tickets/${tickets.id}`);
      const detailsResult = await detailsResponse.json();

      if (!detailsResponse.ok || !detailsResult.success) {
        throw new Error(detailsResult.message || "Ticket complete, but failed refresh details");
      }

      setTickets(detailsResult.data as TicketDetails);
      setTechnicianNote("");

      setTimeout(() => {
        handleClose();
      }, 2000);

    }  catch(error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoadingCompleting(false);
    }
  }

  // SUPERVISOR HANDLE APPROVE/REJECT
  const handleReview = async (action: "approve" | "reject") => {
    if (!assignmentId) return;

    if (action === "reject" && !supervisorNote.trim()) {
      setReviewError("Please provide a reason for your rejection");
      return;
    }

    setLoadingReview(action);
    setReviewError("");
    setReviewMessage("");

    try {
      const response = await fetch(
        `/api/reviews/${assignmentId}/${action}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            supervisorNote: supervisorNote.trim() || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${action} ticket`)
      }

      setReviewMessage(
        action === "approve"
          ? "Ticket approve success"
          : "Ticket rejected success"
      );

      // refresh ticket details
      const detailsResponse = await fetch(`/api/tickets/${ticketId}`);
      const detailsResult = await detailsResponse.json();

      if (!detailsResponse.ok || !detailsResult.success) {
        throw new Error(detailsResult.message || "Ticket complete, but failed refresh details");
      }

      setTickets(detailsResult.data as TicketDetails);
      setSupervisorNote("");

      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoadingReview(null);
    }
  };

  // GET CURRENT TECHNICIAN INFO (INSTEAD SHOWING MULTIPLE TECHNICIAN WHO GOT REJECTED)
  const currentAssignment = tickets?.ticket_assignments.find((assign) => 
    assign.status === "on_progress" ||
    assign.status === "on_review" ||
    assign.status === "completed"
  );

  // ENSURE SUPERVISOR ONLY REVIEW THE CORRECT/RECENT TECHNICIAN (unused yet)
  const currentReview = tickets?.ticket_assignments.find((assign) => 
    assign.id === assignmentId
  );

  // TECHNICIAN HANDLE CANCEL
  const handleCancel = async () => {
    if (!tickets) return;

    if (!cancellationNote.trim()) {
      setCancelError("Please provide a reason for cancellation");
      return;
    }

    setLoadingCancel(true);
    setCancelError("");
    setCancelMessage("");

    try {
      const response = await fetch(
        `/api/assignments/${tickets.id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            cancellationNote: cancellationNote.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to cancel ticket");
      }

      setCancelMessage("Ticket cancelled successfully");

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setCancelError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoadingCancel(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
    onClick={handleClose}
    className="fixed inset-0 flex justify-center items-center bg-color-7/20 text-color-8"
    >
      <div 
      onClick={preventCloseClick}
      className="bg-white max-h-5/6 overflow-y-auto rounded-xl relative max-w-200"
      >
        
        {completeMessage && (
          <div className="sticky top-0 p-4 z-10">
            <p className="bg-color-10 p-4 rounded-lg text-center font-medium text-white">{completeMessage}</p>
          </div>
        )}
        {completeError && (
          <div className="sticky top-0 p-4 z-10">
            <p className="bg-color-9 p-4 rounded-lg text-center font-medium text-white">{completeError}</p>
          </div>
        )}

        {reviewMessage && (
          <div className="sticky top-0 p-4 z-10">
            <p className="bg-color-10 p-4 rounded-lg text-center font-medium text-white">{reviewMessage}</p>
          </div>
        )}
        {reviewError && (
          <div className="sticky top-0 p-4 z-10">
            <p className="bg-color-9 p-4 rounded-lg text-center font-medium text-white">{reviewError}</p>
          </div>
        )}

        {cancelMessage && (
          <div className="sticky top-0 p-4 z-10">
            <p className="bg-color-10 p-4 rounded-lg text-center font-medium text-white">{reviewMessage}</p>
          </div>
        )}
        {cancelError && (
          <div className="sticky top-0 p-4 z-10">
            <p className="bg-color-9 p-4 rounded-lg text-center font-medium text-white">{reviewError}</p>
          </div>
        )}
        
        <div className="relative border-b border-color-5 p-5">
          <p className="text-lg font-medium">
            Ticket Details
          </p>
          <img
          onClick={handleClose}
          src={"/close.svg"}
          alt="close" 
          className="absolute w-3 right-3 top-3"
          />
        </div>
        {loadingDetails ? (
          <div className="bg-white w-md p-8 rounded-lg flex flex-row gap-x-2 justify-center">
            <img
            src={"/loading.svg"} 
            alt="loading" 
            className="w-6 animate-spin"
            />
            <p>Loading Data..</p>
          </div>
        ) : !loadingDetails && error ? (
          <div>
            {error}
          </div>
        ) : !loadingDetails && !error && tickets && (
          <div className="">
            <div className="flex flex-col border-b border-color-5 p-8 gap-4">

              <p className="font-medium">General Info</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-10">
                <div>
                  <p className="text-color-6 text-sm">Ticket Number</p>
                  <p>{tickets.ticket_number}</p>
                </div>
                <div>
                  <p className="text-color-6 text-sm">Priority</p>
                  <PriorityStatus priority={tickets.priority}/>
                </div>
                <div>
                  <p className="text-color-6 text-sm mb-1">Ticket Status</p>
                  <TicketStatus status={tickets.status} />
                </div>
                <div>
                  <p className="text-color-6 text-sm">Created At</p>
                  <FormattedDateCols dateString={tickets.created_at} />
                </div>
                <div>
                  <p className="text-color-6 text-sm">Updated At</p>
                  <FormattedDateCols dateString={tickets.updated_at || "-"} />
                </div>
                <div>
                  <p className="text-color-6 text-sm">Resolved At</p>
                  <FormattedDateCols dateString={tickets.resolved_at || "-"} />
                </div>
              </div>
            </div>

            <div className="flex flex-col border-b border-color-5 p-8 gap-4">
              <p className="font-medium">Request Info</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-10">
                <div>
                  <p className="text-color-6 text-sm">Requested By</p>
                  <p>{tickets.users.first_name} {tickets.users.last_name}</p>
                </div>
                <div>
                  <p className="text-color-6 text-sm">Request Location</p>
                  <p>{tickets.locations.name}</p>
                  <p>{tickets.departments.name}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col border-b border-color-5 p-8 gap-4">
              <p className="font-medium">Issue Details</p>
              {tickets.ticket_items.map((item, index) => (
                <div 
                key={item.id}
                className="flex flex-col"
                >
                  <p className="text-color-2 text-sm font-medium">Issue #{index + 1}</p>
                  <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-2">
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="text-color-6 text-sm">Title</p>
                        <p>{item.title}</p>
                      </div>
                      <div>
                        <p className="text-color-6 text-sm">Description</p>
                        <p>{item.description}</p>
                      </div>
                      <div>
                        <p className="text-color-6 text-sm">Category</p>
                        <p>{item.categories.name}</p>
                      </div>
                    </div>
                    {item.ticket_item_images.length > 0 ? (
                      <div>
                        {item.ticket_item_images.map((image) => (
                          <div key={image.id}>
                            <img
                            src={image.image_url || "/no-image.svg"}
                            alt={`Image ${item.title}`}
                            className="w-50 h-50 aspect-square object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <img
                        src="/no-image.svg"
                        alt={`No image for ${item.title}`}
                        className="w-40 h-40 aspect-square object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col border-b border-color-5 p-8 gap-4">
              <p className="font-medium">Technician info</p>
              {currentAssignment ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-10">
                  <div>
                    <p className="text-color-6 text-sm">Name</p>
                    <p>
                      {currentAssignment.users
                        ? `${currentAssignment.users.first_name} ${currentAssignment.users.last_name}`
                        : "Unknown Technician"
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-color-6 text-sm">Technician ID</p>
                    <p>{currentAssignment.users.employee_id}</p>
                  </div>
                  <div>
                    <p className="text-color-6 text-sm mb-1">Assignment Status</p>
                    <TicketStatus status={currentAssignment.status}/>
                  </div> 
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-10">
                  <div>
                    <p className="text-color-6 text-sm">Name</p>
                    <p>-</p>
                  </div>
                  <div>
                    <p className="text-color-6 text-sm">Technician ID</p>
                    <p>-</p>
                  </div>
                  <div>
                    <p className="text-color-6 text-sm mb-1">Assignment Status</p>
                    <TicketStatus status={tickets.status}/>
                  </div> 
                </div>
              )}
            </div>

            {currentReview ? (
              <div>
                {currentReview.status === "on_review" ? (
                  <div className="flex flex-col border-b border-color-5 p-8 gap-4">
                    <p className="font-medium">Completion Info</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-10">
                      <div>
                        <p className="text-color-6 text-sm">Accepted At</p>
                        <FormattedDateCols dateString={currentReview.accepted_at}/>
                      </div>
                      <div>
                        <p className="text-color-6 text-sm">Completed At</p>
                        <FormattedDateCols dateString={currentReview.completed_at || "-"}/>
                      </div>
                      <div>
                        <p className="text-color-6 text-sm">Technician Note</p>
                        <p>{currentReview.technician_note || "No note provided."}</p>
                      </div>
                      {mode === "supervisor" && (
                        <div>
                          <p className="text-color-6 text-sm">Supervisor Note</p>
                          <textarea
                          value={supervisorNote}
                          onChange={(e) => setSupervisorNote(e.target.value)}
                          placeholder="Add some note..."
                          disabled={loadingReview !== null}
                          className="w-full min-h-20 border p-3 border-color-6 outline-none focus:border-color-1 rounded-lg disabled:cursor-not-allowed"
                          />
                        </div>
                      )}
                    </div>
                    {mode === "technician" && (
                      <div className="bg-color-4/20 p-4 rounded-lg text-center  text-color-4 mt-2">
                        <p>Brace yourself, supervisor is reviewing your work </p>
                      </div>
                    )}
                    {mode === "supervisor" && (
                      <div>
                        <div className="flex flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => handleReview("reject")}
                            disabled={loadingReview !== null}
                            className={`
                              w-full transition duration-300 rounded-lg p-4 text-white disabled:cursor-not-allowed
                              ${loadingReview === "reject"
                                ? "bg-color-6"
                                : "bg-color-9 hover:bg-color-9/80"
                              }
                            `}
                          >
                            {loadingReview === "reject"
                              ? "Rejecting..."
                              : "Reject"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReview("approve")}
                            disabled={loadingReview !== null}
                            className={`
                              w-full transition duration-300 rounded-lg p-4 text-white disabled:cursor-not-allowed
                              ${loadingReview === "approve"
                                ? "bg-color-6"
                                : "bg-color-10 hover:bg-color-10/80"
                              }
                            `}
                          >
                            {loadingReview === "approve"
                              ? "Approving..."
                              : "Approve"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : currentReview.status === "on_progress" && mode === "technician" && (
                  <div className="flex flex-col border-b border-color-5 p-8 gap-4">
                    <p className="font-medium">Completion Info</p>

                    <div>
                      <p className="text-color-6 text-sm mb-1">Technician Note (Optional)</p>
                      <textarea
                        value={technicianNote}
                        onChange={(e) => setTechnicianNote(e.target.value)}
                        placeholder="Add some note..."
                        disabled={loadingCompleting}
                        className="w-full min-h-20 border p-3 border-color-6 outline-none focus:border-color-1 rounded-lg disabled:cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCancellationNote("");
                        setCancelError("");
                        setIsCancelModalOpen(true);
                      }}
                      disabled={loadingCompleting || loadingCancel}
                      className="rounded-lg border border-red-500 p-4 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed"
                    >
                      Cancel Ticket
                    </button>

                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={loadingCompleting}
                      className={`
                        transition duration-300 rounded-lg p-4 text-white disabled:cursor-not-allowed
                        ${loadingCompleting
                          ? "bg-color-6"
                          : "bg-color-10 hover:bg-color-10/80"
                        }
                        `}
                    >
                      {loadingCompleting
                        ? "Submitting..."
                        : "Mark as Complete"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col border-b border-color-5 p-8 gap-4">
                <p className="font-medium">Completion Info</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-10">
                  <div>
                    <p className="text-color-6 text-sm">Accepted At</p>
                    <p>-</p>
                  </div>
                  <div>
                    <p className="text-color-6 text-sm">Completed At</p>
                    <p>-</p>
                  </div>
                  <div>
                    <p className="text-color-6 text-sm">Technician Note</p>
                    <p>-</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <TicketCancelModal
          isOpen={isCancelModalOpen}
          cancellationNote={cancellationNote}
          isCancelling={loadingCancel}
          onNoteChange={setCancellationNote}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancel}
        />
      </div>
    </div>
  )
}