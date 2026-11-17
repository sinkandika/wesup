"use client";

type MetricCardProps = {
  all_ticket: number;
  daily_ticket: number;
  daily_resolved: number;
  rejected_ticket: number;
  cancelled_ticket: number;
  average_completion_time: number;
}

export default function MetricCards ({
  all_ticket,
  daily_ticket,
  daily_resolved,
  rejected_ticket,
  cancelled_ticket,
  average_completion_time,
}: MetricCardProps) {
  
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 text-color-8 font-medium">

      <div className="bg-white rounded-lg p-5 gap-2">
        <div className="flex flex-row gap-2">
          <img
          src={"/all-ticket.svg"}
          alt="all"
          className="w-3.5"
          />
          <p>
            All Tickets
          </p>
        </div>
        <p className="ml-6">
          {all_ticket}
        </p>
      </div>

      <div className="bg-white rounded-lg p-5 gap-2">
        <div className="flex flex-row gap-2">
          <img
          src={"/resolved-ticket.svg"}
          alt="all"
          className="w-4"
          />
          <p>
            Today Tickets
          </p>
        </div>
        <p className="ml-6">
          {daily_ticket}
        </p>
      </div>

      <div className="bg-white rounded-lg p-5 gap-2">
        <div className="flex flex-row gap-2">
          <img
          src={"/resolved-ticket.svg"}
          alt="all"
          className="w-4"
          />
          <p>
            Daily Resolved
          </p>
        </div>
        <p className="ml-6">
          {daily_resolved}
        </p>
      </div>

      <div className="bg-white rounded-lg p-5 gap-2">
        <div className="flex flex-row gap-2">
          <img
          src={"/rejected-ticket.svg"}
          alt="all"
          className="w-3.5"
          />
          <p>
            Rejected Tickets
          </p>
        </div>
        <p className="ml-6">
          {rejected_ticket}
        </p>
      </div>

      <div className="bg-white rounded-lg p-5 gap-2">
        <div className="flex flex-row gap-2">
          <img
          src={"/cancelled-ticket.svg"}
          alt="all"
          className="w-4"
          />
          <p>
            Cancelled Tickets
          </p>
        </div>
        <p className="ml-6">
          {cancelled_ticket}
        </p>
      </div>

      <div className="bg-white rounded-lg p-5 gap-2 ">
        <div className="flex flex-row gap-2">
          <img
          src={"/avg-completion-ticket.svg"}
          alt="all"
          className="w-4"
          />
          <p>
            Avg. Completion Time
          </p>
        </div>
        <p className="ml-6">
          {average_completion_time}
        </p>
      </div>
    </div>
  )
}