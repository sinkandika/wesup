"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function RegisterSuccess(){

  const [countdown, setCountdown] = useState(5);

  // COUNTDOWN
  useEffect (() => {
    if (countdown === 0) {
      window.location.replace("/login");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev -1 );
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]); 

  return (
    <div className="flex min-h-screen justify-center items-center text-color-8 bg-color-5">
      <div className="bg-white shadow-md p-8 rounded-none md:rounded-[35px] text-center w-lg h-100 max-h-screen">
        <div>
          <p className="font-medium text-xl">
            Register Success!
          </p>
          <p>
            Your account created successfully
          </p>
        </div>

        <div className="flex justify-center items-center p-8">

          <div className="flex justify-center items-center w-25 h-25 rounded-full bg-color-1 shrink-0 z-40">
            <img
            src="/success-icon.svg"
            alt="success-icon"
            className="w-17 absolute z-50"
            />
          </div>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute flex justify-center items-center w-30 h-30 rounded-full bg-color-1/60 shrink-0 z-30"
          />
            
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute flex justify-center items-center w-35 h-35 rounded-full bg-color-1/30 shrink-0 z-30"
          />
        </div>

        <div className="flex justify-center gap-x-1 text-sm">
          <p>Back to Sign In page in</p>
          <p className="text-color-1 font-medium">{countdown}</p>
          <p>second</p>
        </div>

        <Link
        href={"/login"}
        className="text-sm text-color-1 hover:text-color-1/80"
        >
          Back to Sign In page instead
        </Link>
      </div>
    </div>
  )
}