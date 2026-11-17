"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import Calendar from "@/src/components/common/Calendar";
import { PriorityStatus } from "@/src/components/common/PriorityStatus";
import FormattedDate from "@/src/components/common/FormattedDate";

import TicketDetailModal from "@/src/components/ticket/TicketDetailModal";
import TicketStatus from "@/src/components/common/TicketStatus";

type Ticket = {
  id: string;
  status: string;
  ticket_id: string;
  accepted_at: string;
  completed_at: string;
  created_at: string;
  users: {
    id: string;
    first_name: string;
    last_name: string | null;
    employee_id: string | null;
  };
  tickets: {
    id: string;
    ticket_number: string;
    priority: string;
  }
}

export default function TicketReview() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const DebounceSearch = useDebounce<string>(search,300);

  const [selectDate, setSelectDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [ticketDetails, setTicketDetails] = useState<string | null>(null);
  // if ticket rejected and take by another technician, this make showing only one/recent ticket assignment by recent technician
  const [assignmentDetails, setAssignmentDetails] = useState<string | null>(null); 
 
  // FETCH TICKET
  async function fetchTickets() {
    setLoading(true)
    try {
      const response = await fetch("/api/reviews");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch tickets");
      }

      setTickets(result.reviews); // check route response
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
    fetchTickets();
  }, [search, selectDate]);

  // FILTER
  const filteredTickets = tickets.filter((ticket) => {
    const searchTerms = DebounceSearch.toLowerCase().trim();

    // search
    const matchedSearch = 
      ticket.users.first_name.toLowerCase().includes(searchTerms) ||
      ticket.tickets.ticket_number.toLowerCase().includes(searchTerms) ||
      ticket.users.employee_id?.toLowerCase().includes(searchTerms) ||
      ticket.tickets.priority.toLowerCase().includes(searchTerms)
    
    // calendar
    const matchedDate = selectDate
      ? new Date(ticket.created_at).toLocaleDateString("en-CA", {
          timeZone: "Asia/Jakarta",
        }) === selectDate
      : true;

      return matchedSearch && matchedDate;
  })

  // PAGINATION
  const totalPages = Math.ceil(
    filteredTickets.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const filteredTickets2 = filteredTickets.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // HANDLE REFRESH
  const handleRefresh  = async () => {
    setCurrentPage(1);
    setLoading(true);
    setSelectDate("");

    try {
      await fetchTickets();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-color-5 min-h-screen text-color-8">
      <div className=" flex flex-col gap-y-2">

        <div className="flex flex-col bg-white rounded-lg gap-y-5">
          <div className="p-8">
            <p className="text-2xl font-medium">
              Ticket Review
            </p>
            <p className="text-color-7">
              Review all technician&apos;s work and take action to accept or reject their task
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-2 justify-start md:justify-end items-start md:items-center text-sm p-4 ">
            <div className="flex flex-row gap-2 w-auto">
              <div className="relative">
                <img
                src={"/refresh.svg"}
                alt="ref"
                className="w-4 absolute top-2.5 translate-x-1/2"
                />
                <button
                onClick={handleRefresh}
                className="border-2 rounded-lg pl-7 pr-4 py-2 border-color-6 outline-none hover:border-color-1 transition duration-300"
                >
                  <p>Refresh</p>
                </button>
              </div>
              <div
              className="relative"
              >
                <img
                src={"/calendar.svg"}
                alt="cal"
                className="w-4 absolute top-2.5 translate-x-1/2"
                />
                <button
                type="button"
                onClick={() => setShowCalendar((prev) => !prev)}
                className="border-2 rounded-lg pl-7 pr-4 py-2 border-color-6 outline-none focus:border-color-1 hover:border-color-1 transition duration-300"
                >
                  {selectDate || "Filter by date"}
                </button>
                {showCalendar && (
                  <div className="absolute z-90">
                    <Calendar
                    selectedDate={selectDate}
                    onSelectDate={setSelectDate}
                    onClose={() => setShowCalendar(false)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <img
              src={"/search.svg"}
              alt="src"
              className="w-4 absolute top-2.5 left-1 translate-x-1/2"
              />
              <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-2 rounded-lg pl-8 pr-4 py-2 border-color-6 outline-none focus:border-color-1"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {loading ? (
            <div className="bg-white p-8 rounded-lg flex flex-row gap-x-2 justify-center">
              <img
              src={"/loading.svg"} 
              alt="loading" 
              className="w-6 animate-spin"
              />
              <p>Loading table..</p>
            </div>
          ) : filteredTickets2.length === 0 ? (
            <div className="bg-white p-8 rounded-lg flex flex-row gap-x-2 justify-center">
              <p>No ticket found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-left border-separate border-spacing-y-2 w-full min-w-300">
                <thead>
                  <tr className="text-color-6">
                    <th className="px-4">Assigned By</th>
                    <th className="px-4">Technician ID</th>
                    <th className="px-4">Ticket Number</th>
                    <th className="px-6">Priority</th>
                    <th className="px-4">Accepted At</th>
                    <th className="px-4">Completed At</th>
                    <th className="px-4">Assignment Status</th>
                    <th className="px-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets2.map((ticket) => (
                    <tr key={ticket.id} >
                      <td className="bg-white rounded-l-lg px-4 py-8">
                        {ticket.users.first_name}
                      </td>
                      <td className="bg-white px-4">
                        {ticket.users.employee_id}
                      </td>
                      <td className="bg-white px-4">
                        {ticket.tickets.ticket_number}
                      </td>
                      <td className="bg-white px-4">
                        <PriorityStatus priority={ticket.tickets.priority}/>
                      </td>
                      <td className="bg-white px-4">
                        <FormattedDate dateString={ticket.accepted_at}/>
                      </td>
                      <td className="bg-white px-4">
                        <FormattedDate dateString={ticket.completed_at}/>
                      </td>
                      <td className="bg-white px-4">
                        <TicketStatus status={ticket.status}/>
                      </td>
                      <td className="bg-white rounded-r-lg px-6">
                        <button 
                        onClick={() => { 
                          setIsDetailModalOpen(true)
                          setAssignmentDetails(ticket.id); // ticket_assignments.id
                          setTicketDetails(ticket.ticket_id) // tickets.id
                        }}
                        className="bg-color-1 hover:bg-color-1/80 px-4 py-2 rounded-lg  text-white text-sm transition duration-300"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTickets.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {startIndex + 1}–
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredTickets.length
                    )}{" "}
                    page
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(page - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="py-2 px-3 rounded-full hover:bg-color-1/50 transition duration-300 disabled:opacity-30 disabled:hover:bg-color-1/0"
                    >
                      <img 
                      src={"/left.svg"} 
                      alt="lft" 
                      className="w-2" />
                    </button>
                    <span className="px-2 py-1 text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(page + 1, totalPages)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="py-2 px-3 rounded-full hover:bg-color-1/50 transition duration-300 disabled:opacity-30 disabled:hover:bg-color-1/0"
                    >
                      <img 
                      src={"/right.svg"} 
                      alt="rgh" 
                      className="w-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <TicketDetailModal 
        ticketId={ticketDetails}
        assignmentId={assignmentDetails}
        mode="supervisor"
        isOpen = {isDetailModalOpen}
        onClose={() => {
          console.log("Modal closed, refreshing reviews")
          setIsDetailModalOpen(false);
          setTicketDetails(null);
          setAssignmentDetails(null);
          fetchTickets();
        }}
        />

      </div>
    </main>
  )
}