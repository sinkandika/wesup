"use client";

import AccountSettings, { UserDetail } from "@/src/components/settings/AccountSettings";
import { useEffect, useState } from "react";

export default function Settings() {
  const [user, setuser] = useState<UserDetail | null>(null)

  // get user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/settings/account");
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || "failed to fetch account details");
        }

        console.log("fetch account details success");
        setuser(result.data);

      } catch (error) {
        console.error("Failed to fetch accout details", error);
      }
    }

    fetchUser();
  }, []);

  return (
    <div className="">
      <AccountSettings user={user}/>
    </div>
  )
}