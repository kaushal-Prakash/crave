"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { user } from "@/types/types";

function ProfilePage() {
  const [user, setUser] = useState<user | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}users/get-user-by-id`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          setUser(response.data.result[0]);
        } else {
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Internal server error! Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-yellow-200 via-green-200 to-orange-200">
        <p className="text-2xl font-bold text-gray-800">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-yellow-200 via-green-200 to-orange-200">
        <p className="text-2xl font-bold text-gray-800">No user data found.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          "linear-gradient(135deg, #FFD700 0%, #32CD32 50%, #FFA500 100%)", // Retro gradient
        fontFamily: "'Press Start 2P', cursive",
      }}
    >
      <div className="max-w-2xl mt-16 mx-auto bg-white rounded-xl shadow-2xl p-8 border-2 border-orange-300">
        <h1 className="text-4xl font-bold text-center mb-8 text-orange-600">
          Profile
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Full Name
            </label>
            <p className="text-xl text-gray-800">{user.fullName}</p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Username
            </label>
            <p className="text-xl text-gray-800">{user.username}</p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Email
            </label>
            <p className="text-xl text-gray-800">{user.email}</p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Member Since
            </label>
            <p className="text-xl text-gray-800">
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;