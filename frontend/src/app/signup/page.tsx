"use client";
/* eslint-disable */
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSignup = async () => {
    if (busy) return;
    if(password.length < 8){
      toast.info("Password must have atleast 8 characters !");
      return;
    }

    setBusy(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}users/user-signup`,
        { fullName, username, email, password },
        { withCredentials: true }
      );
      console.log(res)
      if (res.status === 200) {
        toast.success("User registered successfully");
        window.location.href = "/home";
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      console.log("Error in user signup:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Signup failed");
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
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">Sign Up</h2>

        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
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
              placeholder="Create a password"
            />
          </div>

          <button
            type="button"
            className={`w-full ${
              busy ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500"
            } text-white py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-all cursor-pointer duration-300`}
            onClick={handleSignup}
            disabled={busy} 
          >
            {busy ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;