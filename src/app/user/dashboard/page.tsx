import LogoutButton from "@/src/components/LogoutButton";
import { requireRole } from "@/src/server/lib/auth";

export const instant = false;

export default async function UserDashboard() {
  
  const user = await requireRole(["user"]);

  return (
    <main>
      <h1>User Dashboard</h1>
      <p>Welcome, {user.first_name}</p>
      <LogoutButton />
    </main>
  );
}