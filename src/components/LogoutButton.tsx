"use client";

import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  collapsed?: boolean;
}

export default function LogoutButton({
  collapsed = false,
} : LogoutButtonProps) {
  const router = useRouter();
  
  // HANDLE LOGOUT
  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <div 
    onClick={handleLogout}
    className={`hover:bg-color-5 flex p-2 items-center rounded-lg
      ${collapsed
        ? "justify-center h-12"
        : "flex-row gap-4"
      }
    `}>
      <div className="flex w-6 justify-center">
        <img
        src="/logout.svg"
        alt=""
        className="w-3.5"
        />
      </div>
      <button
        type="button"
        className="text-sm"
      >
        <span className={` text-left text-sm md:text-center
          ${collapsed
          ? "hidden"
          : "block"
        }
        `}>
          Sign Out
        </span>
      </button>
    </div>
  );
}