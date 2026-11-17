import { supabase } from "../../lib/supabase";

// GENERATE TICKET NUMBER
export const generateTicketNumber = async () => {
  const now = new Date();

  // use indonesia WIB timezone
  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })  
    .format(now)
    .replace(/-/g, "");

  const { data, error } = await supabase
    .from("tickets")
    .select("ticket_number")
    .like("ticket_number", `WS-${datePart}-%`)
    .order("ticket_number", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  let nextNumber = 1;

  if (data && data.length > 0) {
    const lastNumber = parseInt(
      data[0].ticket_number.slice(-4),
      10
    );

    nextNumber = lastNumber + 1;
  }

  return `WS-${datePart}-${String(nextNumber).padStart(4, "0")}`;
};