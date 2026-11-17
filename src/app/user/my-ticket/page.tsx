"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import TicketDetailModal from "@/src/components/ticket/TicketDetailModal";
import TicketCancelModal from "@/src/components/ticket/TicketCancelModal";
import Calendar from "@/src/components/common/Calendar";
import MyTicketTable, { Ticket } from "@/src/components/ticket/MyTicketTable";

export default function MyTicket() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cancelTicketId, setCancelTicketId] = useState<string | null> (null);
  const [ticketDetails, setTicketDetails] = useState<string | null>(null);
  const [assignmentDetails, setAssignmentDetails] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const DebounceSearch = useDebounce<string>(search,300);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [openOption, setOpenOption] = useState<string | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationNote, setCancellationNote] = useState("");

  const [selectDate, setSelectDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loadingCancel, setLoadingCancel] = useState<string | null>(null); // loading cancelling
  const [loading, setLoading] = useState(false)

  // FETCH TICKETS BY USER ID
  async function fetchTickets()  {
    try {
      setLoading(true);

      const response = await fetch ("/api/tickets/my-ticket");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch ticket");
      }

      console.log("Fetch ticket success!", result.data);
      setTickets(result.data);
    } catch (error) {
      console.error("Failed to fetch ticket", error)
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
    const matchedTickets = 
      ticket.ticket_number.toLowerCase().includes(searchTerms) ||
      ticket.priority.toLowerCase().includes(searchTerms) ||
      ticket.ticket_items?.some((item) =>
        item.title?.toLocaleLowerCase().includes(searchTerms)
      )
    
    // calendar
    const matchedDate = selectDate
      ? new Date(ticket.created_at).toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta"
      }) === selectDate
      : true;  
    return matchedTickets && matchedDate;
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

  // CANCEL TICKET
  async function handleCancelTicket() {
    if (!cancelTicketId || !cancellationNote.trim()) {
      return;
    }

    try {
      setLoadingCancel(cancelTicketId);

      const response = await fetch(
        `/api/tickets/${cancelTicketId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
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

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === cancelTicketId
            ? {
                ...ticket,
                status: "cancelled",
                updated_at: new Date().toISOString(),
              }
            : ticket
        )
      );

      setIsCancelModalOpen(false);
      setCancelTicketId(null);
      setCancellationNote("");

      alert("Ticket cancelled successfully!");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to cancel ticket"
      );
    } finally {
      setLoadingCancel(null);
    }
  }

  // HANDLE REFRESH
  const handleRefresh  = async () => {
    setCurrentPage(1);
    setSelectDate("");

    fetchTickets();

  }

  // OUTSIDE CLICK TO CLOSE OPTION MENU
  useEffect(() => {
    if (!openOption) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (!target.closest(`[data-ticket-menu="${openOption}"]`)) {
        setOpenOption(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openOption]);

  return(
    <main className="min-h-screen text-color-8 ">
      <div className="flex flex-col rounded-lg bg-white p-6 gap-y-2">
        <div>
          <p className="text-2xl font-medium">
            My Tickets
          </p>
          <p className="text-color-7">
            View and track all your ticket progress here
          </p>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-2 mt-5">
          <div className="relative flex-1">
            <img
            src={"/search.svg"} 
            alt="src"
            className="absolute w-4 translate-x-1/2 top-2.5 left-1"
            />
            <input
            type="text"
            placeholder="search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-auto border-2 rounded-lg pl-8 pr-4 py-1 border-color-6 outline-none focus:border-color-1 hover:border-color-1 transition duration-300"
            />
          </div>
          <div className="flex flex-row gap-2">
            <div className="relative">
              <img
              src={"/calendar.svg"}
              alt="calendar"
              className="absolute w-4 translate-x-1/2 top-2"
              />
              <button
              type="button"
              onClick={() => setShowCalendar((prev) => !prev)}
              className="w-full border-2 rounded-lg pl-8 py-1 px-3 border-color-6 outline-none focus:border-color-1 hover:border-color-1 transition duration-300"
              >
                {selectDate || "Filter by Date"}
              </button>
              {showCalendar && (
                <div className="absolute z-90 right-0">
                  <Calendar
                  selectedDate={selectDate}
                  onSelectDate={setSelectDate}
                  onClose={() => setShowCalendar(false)}
                  />
                </div>
              )}
            </div>
            <div className="relative">
              <img
              src={"/refresh.svg"}
              alt="ref"
              className="absolute w-4 translate-x-1/2 top-2"
              />
              <button
              type="button"
              onClick={handleRefresh}
              className="border-2 rounded-lg pl-8 py-1 px-3 border-color-6 outline-none hover:border-color-1 transition duration-300"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-lg flex flex-row gap-x-2 justify-center">
            <img
            src={"/loading.svg"} 
            alt="loading" 
            className="w-6 animate-spin"
            />
            <p>Loading table..</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white p-8 rounded-lg flex flex-row gap-x-2 justify-center">
            <p>No ticket found</p>
          </div>
        ) : (
          <MyTicketTable
            tickets={filteredTickets2}
            openOption={openOption}
            onToggleOption={(ticketId) =>
              setOpenOption((prev) => (prev === ticketId ? null : ticketId))
            }
            onViewTicket={(ticketId) => {
              setOpenOption(null);
              setIsDetailModalOpen(true);
              setAssignmentDetails(ticketId);
              setTicketDetails(ticketId);
            }}
            onCancelTicket={(ticketId) => {
              setOpenOption(null);
              setCancelTicketId(ticketId);
              setCancellationNote("");
              setIsCancelModalOpen(true);
            }}
          />
        )}

        {filteredTickets.length > 0 && (
          <div className="mt-5 flex items-center justify-between">
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

        <TicketDetailModal
        ticketId={ticketDetails}
        assignmentId={assignmentDetails}
        isOpen={isDetailModalOpen}
        mode="user"
        onClose={() => {
          setIsDetailModalOpen(false)
          setTicketDetails(null)
        }}
        />
        <TicketCancelModal
        isOpen={isCancelModalOpen}
        cancellationNote={cancellationNote}
        isCancelling={loadingCancel !== null}
        onNoteChange={setCancellationNote}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelTicketId(null);
          setCancellationNote("");
        }}
        onConfirm={handleCancelTicket}
        />
      </div>
    </main>
  )
}