import React, { createContext, useContext, useState, useEffect } from "react";
import { api, useAuth } from "./AuthContext.jsx";
import {
  sendMessage,
  subscribeToMessages,
  setTypingStatus,
  subscribeToTyping,
} from "../firebase.js";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Fetch all chat rooms for current user
  const fetchRooms = async () => {
    if (!user) return [];
    setLoadingRooms(true);
    try {
      const res = await api.get("/api/rooms/userrooms");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setRooms(res.data.data);
        return res.data.data;
      }
    } catch {
      // Ignore fetch errors
    } finally {
      setLoadingRooms(false);
    }
    return [];
  };

  useEffect(() => {
    if (user) {
      fetchRooms();
    } else {
      setRooms([]);
      setActiveRoom(null);
      setMessages([]);
    }
  }, [user]);

  // Subscribe to messages when active room changes
  useEffect(() => {
    if (!activeRoom?._id) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(activeRoom._id, (newMessages) => {
      setMessages(newMessages);
    });

    const otherUser = activeRoom.users?.find((u) => u._id !== user?._id);
    let unsubscribeTyping = () => { };
    if (otherUser?._id) {
      unsubscribeTyping = subscribeToTyping(
        activeRoom._id,
        otherUser._id,
        (typing) => {
          setIsOtherTyping(typing);
        }
      );
    }

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [activeRoom?._id, user?._id]);

  // Select a chat room
  const selectRoom = (room) => {
    setActiveRoom(room);
  };

  // Initialize or open room with user
  const initChatWithUser = async (otherUserId) => {
    try {
      const res = await api.post("/api/rooms/init", { otheruser: otherUserId });
      if (res.data?.success && res.data?.data) {
        const room = res.data.data;
        setRooms((prev) => {
          const exists = prev.some((r) => r._id === room._id);
          return exists ? prev : [room, ...prev];
        });
        setActiveRoom(room);
        return room;
      }
    } catch {
      // Ignore init errors
    }
    return null;
  };

  // Send a message
  const sendNewMessage = async (content) => {
    if (!activeRoom?._id || !user?._id || !content.trim()) return;
    await sendMessage(activeRoom._id, {
      content: content.trim(),
      senderId: user._id,
    });
    setTypingStatus(activeRoom._id, user._id, false);
  };

  // Update typing indicator
  const handleTyping = (typing) => {
    if (activeRoom?._id && user?._id) {
      setTypingStatus(activeRoom._id, user._id, typing);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        rooms,
        activeRoom,
        messages,
        isOtherTyping,
        loadingRooms,
        fetchRooms,
        selectRoom,
        initChatWithUser,
        sendNewMessage,
        handleTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

