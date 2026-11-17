import SideBar from "@/src/components/sidebar/sidebar";
import { requireRole } from "@/src/server/lib/auth";
import { connection } from "next/server";
import { ReactNode } from "react";

export default async function TechnicianLayout({
  children,
} : {
  children: ReactNode;
}) {
  await connection();

  const user = await requireRole(["technician"]);

  return (
    <div className="flex flex-row bg-color-5 p-2 gap-x-2">
      <SideBar
      role="technician"
      firstName={user.first_name}
      imageUrl={user.image_url}
      />
      
      <main className="w-full min-w-0">
        {children}
      </main>
    </div>
  )
}