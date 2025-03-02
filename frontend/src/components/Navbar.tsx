"use client";
import axios from "axios";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}users/is-loged-in`,{withCredentials: true});

        if (response.status == 200) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);
  
  const handleLogout = async () => {
    try {
      const res = await axios(`${process.env.NEXT_PUBLIC_BACKEND_URL}users/user-logout`,{withCredentials : true});

      if(res.status == 200){
        toast.success(res.data.message);
        window.location.href = "/login";
      }
    } catch (error) {
      console.log("Error during logout : ",error)
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full p-5 flex justify-between items-center shadow-md z-50 backdrop-blur-sm rounded-b-2xl">
      {/* Logo */}
      <div className="text-2xl font-bold text-appetizingRed text-amber-950 tracking-widest cursor-pointer" onClick={ () => window.location.href = "/"}>
        Crave.
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
          className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100 cursor-pointer"
        >
          Home
        </Link>

        {/* Conditional Rendering */}
        {isLoggedIn ? (
          <>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100 cursor-pointer"
            >
              Profile
            </Link>
            <Link
              href="/add-recipe"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100 cursor-pointer"
            >
              Add Recipe
            </Link>
            <Link
              href="/my-recipes"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100 cursor-pointer"
            >
              My Recipes
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100 cursor-pointer"
            >
              Favorites
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100 cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100 cursor-pointer"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100 cursor-pointer"
            >
              Signup
            </Link>
          </>
        )}

        <Link
          href="/about-us"
          onClick={() => setIsOpen(false)}
          className="text-gray-800 hover:text-appetizingRed hover:scale-110 hover:underline transition-all duration-100 cursor-pointer"
        >
          About Us
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;