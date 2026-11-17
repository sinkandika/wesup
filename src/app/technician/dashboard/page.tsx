import LogoutButton from "@/src/components/LogoutButton";
import { requireRole } from "@/src/server/lib/auth";

export const instant = false;

export default async function TechnicianDashboard() {
  
  const user = await requireRole(["technician"]);

  return (
    <main>
      <h1>Technician Dashboard</h1>
      <p>Welcome, {user.first_name}</p>
      <LogoutButton />
    </main>
  );
}