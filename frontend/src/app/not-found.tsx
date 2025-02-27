import Link from "next/link";
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-green-200 to-yellow-200 text-center">
      <FaExclamationTriangle className="text-orange-600 text-6xl mb-4 animate-bounce" />

      <h1 className="text-5xl font-bold text-gray-800">404</h1>
      <p className="text-lg text-gray-600 mt-2">Oops! The page you're looking for doesn't exist.</p>

      <Link
        href="/home"
        className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition duration-300"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;
