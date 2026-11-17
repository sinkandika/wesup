"use client";

import FormattedDate from "../common/FormattedDate";
import { PriorityStatus } from "../common/PriorityStatus";
import TicketStatus from "../common/TicketStatus";


export type TicketAssignment = {
  id: string;
  status: string;
  accepted_at: string;
  completed_at: string | null;
  
  tickets: {
    id: string;
    ticket_number: string;
    priority: string;
  }
}

type TicketHistoryTableProps = {
  assignments: TicketAssignment[]
}

export default function TicketHistoryTable({
  assignments,

}: TicketHistoryTableProps) {

  return (
    <div className="overflow-x-auto">
      <table className="border-color-5 w-full text-left rounded-2xl overflow-hidden min-w-200">
        <thead>
          <tr className="bg-color-5">
            <th className="px-6 py-4">
              Ticket Number
            </th>
            <th>
              Priority
            </th>
            <th>
              Accepted Date
            </th>
            <th>
              Completed Date
            </th>
            <th>
              Assignment Status
            </th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assign) => (
            <tr key={assign.id} className="border-b-2 border-color-5">
              <td className="px-6 py-4">
                {assign.tickets.ticket_number}
              </td>
              <td>
                <PriorityStatus priority={assign.tickets.priority}/>
              </td>
              <td>
                <FormattedDate dateString={assign.accepted_at}/>
              </td>
              <td>
                <FormattedDate dateString={assign.completed_at || "-"}/>
              </td>
              <td>
                <TicketStatus status={assign.status}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}