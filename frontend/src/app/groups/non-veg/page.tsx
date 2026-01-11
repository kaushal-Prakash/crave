"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useSocket } from "@/contexts/socketContext";

interface Message {
  id: number;
  user_id: number;
  username: string;
  fullName?: string;
  message: string;
  group_type: string;
  created_at: string;
}

interface User {
  user_id: number;
  username: string;
}

function NonVegChatPage() {
  const group = "non-veg";

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    fullName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const joinedRef = useRef(false);
  const listenersRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    socket,
    isConnected,
    joinGroup,
    leaveGroup,
    sendMessage,
    sendTyping,
    sendStopTyping,
  } = useSocket();

  /* ------------------ FETCH USER ------------------ */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}users/get-user`,
        { withCredentials: true }
      );
      setCurrentUser({
        id: res.data.userId,
        username: res.data.username,
        fullName: res.data.fullName,
      });
    } catch {
      toast.error("Failed to load user");
    }
  }, []);

  /* ------------------ FETCH MESSAGES ------------------ */
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}messages/${group}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setMessages(res.data.messages.reverse());
      }
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [group]);

  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();
  }, [fetchCurrentUser, fetchMessages]);

  /* ------------------ JOIN GROUP ------------------ */
  useEffect(() => {
    if (!socket || !currentUser || !isConnected) return;
    if (joinedRef.current) return;

    joinGroup(group, currentUser.id.toString(), currentUser.username);
    joinedRef.current = true;

    return () => {
      leaveGroup(group, currentUser.username);
      joinedRef.current = false;
    };
  }, [socket, currentUser, isConnected, group, joinGroup, leaveGroup]);

  /* ------------------ SOCKET LISTENERS ------------------ */
  useEffect(() => {
    if (!socket || listenersRef.current) return;

    socket.on("new_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          user_id: Number(data.userId),
          username: data.username,
          message: data.message,
          group_type: data.group,
          created_at: data.timestamp,
        },
      ]);
    });

    socket.on("room_users", (list: User[]) => {
      setUsers(list);
    });

    socket.on("user_typing", ({ username }) => {
      setTypingUsers((prev) =>
        prev.includes(username) ? prev : [...prev, username]
      );
    });

    socket.on("user_stop_typing", ({ username }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    });

    listenersRef.current = true;

    return () => {
      socket.off("new_message");
      socket.off("room_users");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      listenersRef.current = false;
    };
  }, [socket]);

  /* ------------------ AUTO SCROLL ------------------ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  /* ------------------ SEND MESSAGE ------------------ */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || sending) return;

    const text = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      sendMessage(group, text, currentUser.id.toString(), currentUser.username);
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}messages`,
        { group, message: text },
        { withCredentials: true }
      );
    } catch {
      toast.error("Message failed");
    } finally {
      setSending(false);
      sendStopTyping(group, currentUser.username);
      inputRef.current?.focus();
    }
  };

  /* ------------------ TYPING ------------------ */
  const handleTyping = () => {
    if (!currentUser) return;
    sendTyping(group, currentUser.username);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping(group, currentUser.username);
    }, 1500);
  };

  const formatTime = (t: string) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto pt-16">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/groups"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Groups</span>
          </Link>

          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              isConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500">
                <span className="text-4xl">🍗</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Non-Vegetarian Recipes Chat
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {users.length} users online
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {messages.length} messages
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">You are:</div>
                <div className="font-bold text-gray-800">
                  {currentUser?.fullName ||
                    currentUser?.username ||
                    "Loading..."}
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                {(currentUser?.fullName || currentUser?.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Online Users Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Online Users ({users.length})
              </h2>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">
                      {user.username}
                    </span>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">👤</div>
                    <p>No users online</p>
                  </div>
                )}
              </div>

              {/* Typing Indicators */}
              <AnimatePresence>
                {typingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl"
                  >
                    <div className="text-sm text-red-700 font-medium flex items-center">
                      <div className="flex space-x-1 mr-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      {typingUsers.length === 1
                        ? `${typingUsers[0]} is typing...`
                        : `${typingUsers.slice(0, 2).join(", ")} are typing...`}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden h-[70vh] flex flex-col">
              {/* Messages Header */}
              <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-bold text-gray-800">Chat Messages</h3>
              </div>

              {/* Messages Container */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No messages yet
                    </h3>
                    <p className="text-gray-600">
                      Be the first to start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isCurrentUser = msg.user_id === currentUser?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isCurrentUser ? "ml-auto" : "mr-auto"
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {msg.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {msg.fullName || msg.username}
                              </span>
                            </div>
                          )}
                          <div
                            className={`rounded-2xl p-4 ${
                              isCurrentUser
                                ? "bg-gradient-to-r from-red-100 to-orange-100"
                                : "bg-gray-100"
                            }`}
                          >
                            <p className="text-gray-800">{msg.message}</p>
                            <div
                              className={`text-xs mt-2 ${
                                isCurrentUser
                                  ? "text-right text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {formatTime(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type your message here..."
                    className="flex-1 p-4 border border-gray-300 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={!isConnected || sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected || sending}
                    className="px-6 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-2xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Send"
                    )}
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Connect with other non-vegetarian food
                  lovers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NonVegChatPage;
