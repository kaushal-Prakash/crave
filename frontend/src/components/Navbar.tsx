"use client";
import Link from "next/link";
import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full p-5 flex justify-between items-center shadow-md z-50 backdrop-blur-sm rounded-b-2xl">
      {/* Logo */}
      <div className="text-2xl font-bold text-appetizingRed text-amber-950 tracking-widest">Crave</div>

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
          signup
        </Link>
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
