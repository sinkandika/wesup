"use client";

type Audit = {
  id: string;
  ticket_id: string;
  assignment_id: string | null;
  user_id: string;
  action: string;
  description: string;
  created_at: string;

  tickets: {
    ticket_number: string;
  };

  users: {
    id: string;
    first_name: string;
    last_name: string | null;
    role: string;
    image_url: string | null;
  }
}

import AuditAction from "@/src/components/common/AuditAction";
import { FormattedDateCols } from "@/src/components/common/FormattedDate";
import { useEffect, useState } from "react"

export default function TicketHistory() {

  const [auditLog, setAuditLog] = useState<(Audit[])>([]);
  const [loading, setLoading] = useState(false);

  // FETCH AUDIT LOG
  useEffect(() => {
    const fetchAuditLog = async () => {

      setLoading(true);

      try {
        const response = await fetch("/api/audit-log?page=1&limit=10");
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch audit log");
        } 

        console.log("Success fetch audit log");
        setAuditLog(result.data);
      } catch (error) {
        console.error("Failed to fetch audit log", error)
      } finally {
        setLoading(false);
      }
    }

    fetchAuditLog();
  }, []);

  return(
    <div className="flex flex-col gap-2 text-color-8">
      <div className="p-8 bg-white rounded-lg">
        <p className="text-2xl font-medium">
          Ticket Activity
        </p>
        <p className="text-color-7">
          View and record all tickets activity and its actions
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-lg flex flex-row gap-x-2 justify-center">
          <img
          src={"/loading.svg"} 
          alt="loading" 
          className="w-6 animate-spin"
          />
          <p>Loading audit log..</p>
        </div>
      ) : auditLog.length === 0 ? (
        <div>
          <div className="bg-white p-8 rounded-lg flex flex-row gap-x-2 justify-center">
            <p>No audit log found</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg flex flex-col gap-2">
          {auditLog.map((log) => (
            <div
            key={log.id}
            className="flex flex-col md:flex-row p-8 gap-2 bg-white rounded-lg"
            >
              <div className="flex flex-row-reverse md:flex-row text-sm text-left md:text-right gap-4 justify-between md:justify-normal">
                <FormattedDateCols
                dateString={log.created_at}
                />
                <img
                src={log.users?.image_url || "/user-blank.svg"}
                alt="img"
                className="w-10 h-10 object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <AuditAction action={log.action}/>
                <p className="text-sm">
                  {log.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}