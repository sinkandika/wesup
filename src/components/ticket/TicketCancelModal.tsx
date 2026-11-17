"use client";

type CancelTicketModalProps = {
  isOpen: boolean;
  cancellationNote: string;
  isCancelling: boolean;
  onNoteChange: (note: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function TicketCancelModal({
  isOpen,
  cancellationNote,
  isCancelling,
  onNoteChange,
  onClose,
  onConfirm,
}: CancelTicketModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">
          Cancel Ticket
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Are you sure you want to cancel this ticket?
          Please provide a reason for cancellation.
        </p>

        <textarea
          value={cancellationNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Enter cancellation reason..."
          rows={4}
          className="mt-4 w-full rounded-lg border p-3 text-sm outline-none focus:border-red-500"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!cancellationNote.trim() || isCancelling}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCancelling ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}