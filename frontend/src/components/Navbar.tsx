"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    // Clear the token cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false); // Update login status
    toast.success("Logged out successfully");
    setIsOpen(false); // Close the mobile menu
  };

  return (
    <nav className="fixed top-0 left-0 w-full p-5 flex justify-between items-center shadow-md z-50 backdrop-blur-sm rounded-b-2xl">
      {/* Logo */}
      <div className="text-2xl font-bold text-appetizingRed text-amber-950 tracking-widest">
        Crave
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="text-3xl text-gray-800 cursor-pointer"
      >
        <FiMenu />
      </button>

      <div
        className={`fixed top-0 left-0 w-full bg-gradient-to-br from-cyan-200 to-orange-400 flex flex-col items-center justify-center gap-8 text-2xl transition-transform duration-300 h-screen font-semibold tracking-wide text-amber-800 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 text-4xl cursor-pointer text-gray-800"
        >
          <FiX />
        </button>

        {/* Navigation Links */}
        <Link
          href="/home"
          onClick={() => setIsOpen(false)}
          className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100"
        >
          Home
        </Link>

        {/* Conditional Rendering */}
        {isLoggedIn ? (
          <>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100"
            >
              Profile
            </Link>
            <Link
              href="/my-recipes"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100"
            >
              My Recipes
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100"
            >
              Signup
            </Link>
          </>
        )}

        <Link
          href="/about-us"
          onClick={() => setIsOpen(false)}
          className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100"
        >
          About Us
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;