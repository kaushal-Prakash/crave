import React from "react";

function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-200 to-yellow-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">Login</h2>

        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button className="w-full bg-orange-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 cursor-pointer hover:rounded-3xl transition-all duration-300">
            Login
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="#" className="text-orange-600 font-semibold hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
