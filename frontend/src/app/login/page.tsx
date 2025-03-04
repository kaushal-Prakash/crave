"use client";
/* eslint-disable */
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (busy) return;

    setBusy(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}users/user-login`,
        { username, password },
        { withCredentials: true } 
      );
      

      if (res.status === 200) {
        toast.success("User logged in successfully");
        window.location.href = "/home";
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (error: any) {
      console.log("Error in user login:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Login failed");
      } else if (error.request) {
        toast.error("No response from the server. Please try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-200 to-yellow-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">
          Login
        </h2>

        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="button"
            className={`w-full ${
              busy ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500"
            } text-white py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-all duration-300`}
            onClick={handleLogin}
            disabled={busy} // Disable the button when busy
          >
            {busy ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-orange-600 font-semibold cursor-pointer hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
