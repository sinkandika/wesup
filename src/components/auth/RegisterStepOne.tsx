"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

type RegisterStepOneProps = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onNext: () => void;
  onResetForm: () => void;
};

export default function RegisterStepOne({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  onChange,
  onNext,
  onResetForm,
}: RegisterStepOneProps) {

  const [error, setError] = useState("");

  // HANDLE SUBMIT
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Your password do not match!");
      return;
    }

    onNext();
  }

  // HANDLE BACK TO LOGIN
  const handleBackToLogin = () => {
    onResetForm();
    setError("");
  }

  return (
    <motion.div
    initial={{ opacity: 0, x:20, y:0 }}
    animate={{ opacity: 1, x:0, y:0 }}
    transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col md:flex-row gap-x-5 gap-y-4 md:gap-y-0">
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col">
              <label
                htmlFor="firstName"
                className="text-sm font-medium flex gap-x-1"
              >
                First name
                <p className="text-color-9">*</p>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={firstName}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="text-sm font-medium"
              >
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={lastName}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium flex gap-x-1"
              >
                Email
                <p className="text-color-9">*</p>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium flex gap-x-1"
              >
                Password
                <p className="text-color-9">*</p>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium flex gap-x-1"
              >
                Confirm password
                <p className="text-color-9">*</p>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
              />
              { error && (
                <p className="mt-3 text-color-9">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-10">
          <Link
          onClick={handleBackToLogin}
          href={"/login"}
          className="flex items-center gap-x-2 hover:text-color-2 text-sm transition duration-300">
            <img
            src="/left-arrow.svg"
            alt="arrow"
            className="w-5"
            />
            Back to Sign In
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-color-1 px-6 py-2 font-medium text-white transition hover:bg-color-1/80"
          >
            Next
          </button>
        </div>
      </form>
    </motion.div>
    
  );
}