"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // handle submit
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message);
        return;
      }

      const role = result.data.user.role;

      if (role === "user") {
        router.push("/user/create-ticket");
      } else if (role === "technician") {
        router.push("/technician/assignments");
      } else if (role === "supervisor") {
        router.push("/supervisor/create-ticket");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-color-5 px-4">
      <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}

      >
        <div className="flex flex-row shadow-md p-4 rounded-[35px] bg-white">
          <div className="p-8 flex flex-col gap-y-10">
            <div className="flex text-xl justify-center text-color-8 font-medium">
              <p>Sign In</p>
            </div>


            <form onSubmit={handleSubmit} className="flex flex-col text-color-8 gap-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="text-color-8 text-sm"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                  className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="text-color-8 text-sm"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
                />
              </div>

              <div className="">
                {error && (
                  <p className="font-medium text-color-9 text-sm">
                    Invalid email or password
                  </p>
                )}
              </div>
            
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-color-1 px-4 py-3 font-medium text-white transition hover:bg-color-1/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <div className="flex flex-row gap-x-1 text-sm justify-center">
                <p>Doesn&apos;t have an account?</p>
                <Link
                href={"/register"}
                className="text-color-2 font-medium hover:text-color-2/60 transition duration-300"
                >
                Sign Up
                </Link>
              </div>
            </form>
            

            <div className="flex flex-col gap-y-5">
              <div className="flex justify-center items-center gap-x-5 text-sm">
                <div className="flex-1 border-t"></div>
                <p>Or sign in with</p>
                <div className="flex-1 border-t"></div>
              </div>
              <div className="flex flex-row justify-between gap-x-5">
                <button className="w-full shadow-md py-3 px-5 rounded-lg flex justify-center hover:shadow-lg transition duration-300">
                  <img
                  src="/google-icon.svg"
                  alt="google-icon"
                  className="w-6"
                  />
                </button>
                <button className="w-full shadow-md py-3 px-5 rounded-lg flex justify-center hover:shadow-lg transition duration-300">
                  <img
                  src="/facebook-icon.svg"
                  alt="facebook-icon"
                  className="w-6"
                  />
                </button>
                <button className="w-full shadow-md py-3 px-5 rounded-lg flex justify-center hover:shadow-lg transition duration-300">
                  <img
                  src="/friendster-icon.svg"
                  alt="friendster-icon"
                  className="w-6"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute top-0 left-0 flex p-4 gap-x-2">
              <img 
              src="/wesup-logo-white.svg" 
              alt="wesup-icon" 
              className="relative w-7"
              />
              <img 
              src="wesup-wordmark-white.svg" 
              alt="wesup-wordmark" 
              className=" w-20 relative top-0.5"
              />
            </div>
            <img
            src="/gradient-image.svg"
            alt="gradient-image"
            className="w-sm h-full object-cover"
            />
            <div className="absolute flex flex-col bottom-4 left-4 right-0 text-color-8">
              <p className="text-2xl font-bold">
                Welcome to WeSup
              </p>
              <p className="font-medium">
                Always supporting and facing your problem
              </p>
            </div>
          </div>
        </div>
      </motion.div>  
    </main>
  );
}