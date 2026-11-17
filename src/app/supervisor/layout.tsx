import SideBar from "@/src/components/sidebar/sidebar";
import { requireRole } from "@/src/server/lib/auth";
import { connection } from "next/server";
import { ReactNode } from "react";

export const instant = false;

export default async function SupervisorLayout({
  children,
} : {
  children: ReactNode;
}) {
  await connection();

  // GET ROLE (include users db, check auth/me in auth service)
  const user = await requireRole(["supervisor"]);


  return (
    <div className="flex flex-row bg-color-5 p-2 gap-x-2">
      <SideBar 
      role="supervisor" 
      imageUrl={user.image_url}
      firstName={user.first_name}
      />
      
      <main className="w-full min-w-0">
        {children}
      </main>
    </div>
  )
}