"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import axios from "axios";

interface RecentMessage {
  id: number;
  username: string;
  fullName: string;
  message: string;
  created_at: string;
}

function GroupsPage() {
  const [recentVegMessages, setRecentVegMessages] = useState<RecentMessage[]>([]);
  const [recentNonVegMessages, setRecentNonVegMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupStats, setGroupStats] = useState({
    veg: { onlineUsers: 12, totalMessages: 256 },
    nonVeg: { onlineUsers: 18, totalMessages: 342 }
  });

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent messages
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}messages/recent`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setRecentVegMessages(response.data.vegMessages || []);
          setRecentNonVegMessages(response.data.nonVegMessages || []);
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, []);

  const groups = [
    {
      id: "veg",
      title: "Vegetarian Recipes",
      description: "Discover delicious plant-based recipes",
      color: "from-green-400 to-emerald-500",
      icon: "🥗",
      route: "/groups/veg",
      recentMessages: recentVegMessages,
      stats: groupStats.veg,
    },
    {
      id: "non-veg",
      title: "Non-Vegetarian Recipes",
      description: "Explore meat and seafood recipes",
      color: "from-red-400 to-orange-500",
      icon: "🍗",
      route: "/groups/non-veg",
      recentMessages: recentNonVegMessages,
      stats: groupStats.nonVeg,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto pt-16 md:pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Recipe Community Groups
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Join our vibrant community of food lovers. Share recipes, ask questions, 
            and connect with like-minded people in real-time!
          </p>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <Link href={group.route} className="block h-full">
                <div className={`bg-gradient-to-br ${group.color} rounded-3xl shadow-2xl overflow-hidden h-full transform transition-all duration-300 hover:shadow-3xl cursor-pointer`}>
                  <div className="p-6 md:p-8 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="text-5xl md:text-6xl">{group.icon}</span>
                          <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                              {group.title}
                            </h2>
                            <p className="text-white/90">
                              {group.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center space-x-6 mt-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                            <span className="text-white font-medium">
                              {group.stats.onlineUsers} online
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                            <span className="text-white font-medium">
                              {group.stats.totalMessages} messages
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Messages Preview */}
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold text-lg">Recent Activity:</h3>
                        <span className="text-white/70 text-sm">
                          {group.recentMessages.length > 0 ? 'Just now' : 'No activity'}
                        </span>
                      </div>
                      
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="bg-white/20 rounded-lg p-3">
                                <div className="flex space-x-3">
                                  <div className="w-8 h-8 bg-white/30 rounded-full"></div>
                                  <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-white/30 rounded w-1/4"></div>
                                    <div className="h-3 bg-white/30 rounded w-3/4"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : group.recentMessages.length > 0 ? (
                        <div className="space-y-4">
                          {group.recentMessages.slice(0, 3).map((msg) => (
                            <div 
                              key={msg.id} 
                              className="bg-white/20 rounded-xl p-4 hover:bg-white/30 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-white font-semibold">
                                    {(msg.username || msg.fullName || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-medium text-white block">
                                      {msg.fullName || msg.username}
                                    </span>
                                    <span className="text-white/70 text-xs">
                                      {new Date(msg.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-white text-sm line-clamp-2 pl-11">
                                {msg.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="text-4xl mb-3">💬</div>
                          <p className="text-white/80">
                            No messages yet. Be the first to start the conversation!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Join Button */}
                    <div className="w-full bg-white text-gray-800 py-4 rounded-2xl font-bold text-lg text-center hover:shadow-lg transition-shadow flex items-center justify-center space-x-3">
                      <span>Join {group.title} Chat</span>
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Community Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "💬", title: "Real-time Chat", description: "Instant messaging with recipe enthusiasts" },
              { icon: "👨‍🍳", title: "Share Recipes", description: "Upload and discuss your favorite recipes" },
              { icon: "🤝", title: "Community Support", description: "Get help and tips from experienced cooks" },
              { icon: "⭐", title: "Rate & Review", description: "Share your experiences with recipes" },
              { icon: "🔔", title: "Notifications", description: "Get notified about new messages" },
              { icon: "💾", title: "Message History", description: "All conversations are saved" }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupsPage;