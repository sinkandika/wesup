"use client";

import MetricCards from "@/src/components/technician/MetricCards";
import TicketHistoryTable, { TicketAssignment } from "@/src/components/technician/TicketHistoryTable";
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";

export default function TicketHistoy() {

  const [assignments, setAssignments] = useState<TicketAssignment[]>([]); // add TicketAssignment from TicketHistoryTable to pass their type

  const [allTickets, setAllTickets] = useState(0)
  const [dailyTickets, setDailyTickets] = useState(0);
  const [dailyResolved, setDailyResolved] = useState(0);
  const [rejectedTickets, setRejectedTickets] = useState(0);
  const [cancelledTickets, setCancelledTickets] = useState(0);
  const [averageTime, setAverageTime] = useState(0);

  const [search, setSearch] = useState("");
  const DebounceSearch = useDebounce<string>(search, 300);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loadingTable, setLoadingTable] = useState(false);
  
  /*
  const [stats, setStats] = useState({
    all_tickets: 0,
    daily_tickets: 0,
    daily_resolved: 0,
    rejected_tickets: 0,
    cancelled_tickets: 0,
    average_completion_time: 0,
  })

  const [loadingStats, setLoadingStats] = useState ({
    all_tickets: true,
    daily_tickets: true,
    daily_resolved: true,
    rejected_tickets: true,
    cancelled_tickets: true,
    average_completion_time: true,
  })
  */

  // FETCH TICKET ASSIGNMENT BY ID
  async function fetchTicketAssignments() {

    try {
      const response = await fetch ("/api/assignments/technician-history");
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch ticket assignments");
      }

      console.log("fetch ticket assignments success");
      setAssignments(result.data);
    } catch (error) {
      console.error("Failed to fetch ticket assignments", error);
    }
  };

  /* 
  // FETCH ALL STATS HISTORY COUNT
  useEffect(() => {
    async function fetchHistoryStats() {
      const endpoint = [
        { url: "/api/assignments/technician-history/all-tickets", key: "all_ticket", label: "All tickets"},
        { url: "/api/assignments/technician-history/daily-tickets", key: "daily_ticket", label: "Daily tickets"},
        { url: "/api/assignments/technician-history/daily-resolved", key: "daily_resolved", label: "Daily resolved tickets" },
        { url: "/api/assignments/technician-history/rejected-tickets", key: "rejected_ticket", label: "Rejected tickets" },
        { url: "/api/assignments/technician-history/cancelled-tickets", key: "cancelled_ticket", label: "Cancelled tickets" },
        { url: "/api/assignments/technician-history/avg-completion-time", key: "average_completion_time", label: "Average completion time" },
      ] as const;

      await Promise.allSettled(endpoint.map(async ({ url, key, label }) => {
          try {
            const response = await fetch(url)
            const result = response.json();

            if (!response.ok || !result.success) {
              throw new Error(result.message || `Failed to fetch ${label}`)
            }

            setStats((prev) => ({ ...prev, [key]: result.data}))
          } catch (error) {
            console.error(`Error fetching ${label}:`, error)
          } finally {
            setLoadingStats((prev) => ({ ...prev, [key]: false }));
          }
        })
      )
    }
  })
  */

  // FETCH ALL TICKET COUNT
  async function fetchAllTicket() {
    try {
      setLoadingTable(true);
      const response = await fetch("/api/assignments/technician-history/all-tickets");
      const result = await response.json()

      if (!response.ok || !result.success){
        throw new Error(result.message || "Failed to fetch all tickets count");
      }

      console.log("fetch daily tickets success");
      setAllTickets(result.data);
    } catch (error) {
      console.error("Failed to fetch all tickets count", error);
    } finally {
      setLoadingTable(false);
    }
  };

  // FETCH DAILY TICKET COUNT
  async function fetchDailyTicket() {
    try {
      const response = await fetch("/api/assignments/technician-history/daily-tickets");
      const result = await response.json()

      if (!response.ok || !result.success){
        throw new Error(result.message || "Failed to fetch daily tickets");
      }

      console.log("fetch daily tickets success");
      setDailyTickets(result.data);
    } catch (error) {
      console.error("Failed to fetch daily tickets", error);
    }
  };

  // FETCH DAILY RESOLVED COUNT
  async function fetchDailyResolved() {
    try {
      const response = await fetch("/api/assignments/technician-history/daily-resolved");
      const result = await response.json()

      if (!response.ok || !result.success){
        throw new Error(result.message || "Failed to fetch daily resolved");
      }

      console.log("fetch daily resolved success");
      setDailyResolved(result.data);
    } catch (error) {
      console.error("Failed to fetch daily resolved", error);
    }
  };

  // FETCH REJECTED TICKET COUNT
  async function fetchRejectedTickets() {
    try {
      const response = await fetch("/api/assignments/technician-history/rejected-tickets");
      const result = await response.json()

      if (!response.ok || !result.success){
        throw new Error(result.message || "Failed to fetch rejected daily");
      }

      console.log("fetch rejected tickets success");
      setRejectedTickets(result.data);
    } catch (error) {
      console.error("Failed to fetch rejected daily", error);
    }
  };

  // FETCH CANCELLED TICKET COUNT
  async function fetchCancelledTickets() {
    try {
      const response = await fetch("/api/assignments/technician-history/cancelled-tickets");
      const result = await response.json()

      if (!response.ok || !result.success){
        throw new Error(result.message || "Failed to fetch cancelled daily");
      }

      console.log("fetch cancelled tickets success");
      setCancelledTickets(result.data);
    } catch (error) {
      console.error("Failed to fetch cancelled daily", error);
    }
  };

  // FETCH AVERAGE COMPLETION TIME COUNT
  async function fetchAverageCompletion() {
    try {
      const response = await fetch("/api/assignments/technician-history/avg-completion-time");
      const result = await response.json()

      if (!response.ok || !result.success){
        throw new Error(result.message || "Failed to fetch completion time");
      }

      console.log("fetch completion time success");
      setAverageTime(result.data);
    } catch (error) {
      console.error("Failed to fetch completion time", error);
    }
  };

  useEffect(() => {
    fetchTicketAssignments();
    fetchAllTicket();
    fetchDailyTicket();
    fetchDailyResolved();
    fetchRejectedTickets();
    fetchCancelledTickets();
    fetchAverageCompletion();
  },[])

  // SEARCH
  const filteredAssignments = assignments.filter((assign) => {
    const searchTerm = DebounceSearch.toLocaleLowerCase().trim();

    // search
    const matchedSearch = String
    (assign?.tickets?.ticket_number ?? "").toLowerCase();

    return matchedSearch.includes(searchTerm);
  })

  // PAGINATION
  const totalPages = Math.ceil(
    filteredAssignments.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const filteredAssignments2 = filteredAssignments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <main className="flex flex-col rounded-lg gap-y-2">
      <div className="p-8 bg-white rounded-lg">
        <p className="text-2xl font-medium">
          Ticket History
        </p>
        <p className="text-color-7">
          Record all your tickets you&apos;ve working with
        </p>
      </div>

      <MetricCards
      all_ticket={allTickets}
      daily_ticket={dailyTickets}
      daily_resolved={dailyResolved}
      rejected_ticket={rejectedTickets}
      cancelled_ticket={cancelledTickets}
      average_completion_time={averageTime}
      />

      <div className="flex flex-col gap-4 p-8 bg-white rounded-lg">
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
          className="w-full md:w-auto border rounded-lg pl-8 pr-4 py-1 border-color-6 outline-none focus:border-color-1 hover:border-color-1 transition duration-300"
          />
        </div>

        {loadingTable ? (
          <div className="p-8 rounded-lg flex flex-row gap-x-2 justify-center">
            <img
            src={"/loading.svg"} 
            alt="loading" 
            className="w-6 animate-spin"
            />
            <p>Loading table..</p>
          </div>
        ) : assignments.length === 0 ? (
          <div>
            <p>No history found</p>
          </div>
        ) : (
          <TicketHistoryTable
          assignments={filteredAssignments2}
          />
        )}

        {filteredAssignments.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + itemsPerPage,
                filteredAssignments.length
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
    </main>
  )
}