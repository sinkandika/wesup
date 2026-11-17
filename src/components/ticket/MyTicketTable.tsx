"use client";

import FormattedDate from "@/src/components/common/FormattedDate";
import TicketStatus from "@/src/components/common/TicketStatus";
import { PriorityStatus } from "@/src/components/common/PriorityStatus";

export type Ticket = {
  id: string;
  ticket_number: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  status: string;
  ticket_items: {
    id: string;
    title: string;
  }[];
};

type MyTicketTableProps = {
  tickets: Ticket[];
  openOption: string | null;
  onToggleOption: (ticketId: string) => void;
  onViewTicket: (ticketId: string) => void;
  onCancelTicket: (ticketId: string) => void;
};

export default function MyTicketTable({
  tickets,
  openOption,
  onToggleOption,
  onViewTicket,
  onCancelTicket,
}: MyTicketTableProps) {
  return (
    <div 
    className="overflow-x-auto w-full"
    >
      <table className="w-full text-left rounded-2xl overflow-hidden min-w-350">
        <thead>
          <tr className="bg-color-5">
            <th className="px-6 py-4 ">Ticket Number</th>
            <th className="px-8">Issues</th>
            <th className="px-6">Priority</th>
            <th className="px-6">Created Date</th>
            <th className="px-6">Updated At</th>
            <th className="px-6">Resolved At</th>
            <th className="px-6">Status</th>
            <th className="px-6">Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
            onClick={() => onViewTicket(ticket.id)}
            key={ticket.id} 
            className="border-b-2 border-color-5 hover:bg-color-5/50">
              <td className="px-6 py-4">{ticket.ticket_number}</td>
              <td className="px-8">
                <div className="flex flex-col">
                  {ticket.ticket_items?.map((item) => (
                    <span key={item.id} className="">
                      •{" "}{item.title}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6">
                <PriorityStatus priority={ticket.priority} />
              </td>
              <td className="px-6">
                <FormattedDate dateString={ticket.created_at} />
              </td>
              <td className="px-6">
                <FormattedDate dateString={ticket.updated_at} />
              </td>
              <td className="px-6">
                <FormattedDate dateString={ticket.resolved_at || "-"} />
              </td>
              <td className="px-6">
                <TicketStatus status={ticket.status} />
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <div
                  data-ticket-menu={ticket.id}
                  className="relative flex justify-center"
                >
                  <button
                    type="button"
                    onClick={() => onToggleOption(ticket.id)}
                    className="p-2 rounded-full hover:bg-color-5"
                  >
                    <img
                      src={"/three-dot.svg"}
                      alt="dot"
                      className="w-1"
                    />
                  </button>
                  {openOption === ticket.id && (
                    <div className="absolute bg-white z-90 flex flex-col p-2 shadow-md rounded-lg translate-y-1/2">
                      <button
                        onClick={() => onViewTicket(ticket.id)}
                        className="hover:bg-color-5 px-5 py-2 rounded-lg"
                      >
                        View
                      </button>
                      {ticket.status === "waiting" && (
                        <button
                          onClick={() => onCancelTicket(ticket.id)}
                          className="hover:bg-color-5 px-5 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
