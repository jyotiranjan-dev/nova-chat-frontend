"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api, { extractErrorMessage } from "@/lib/api";

export function useChatData({ socket, connected, currentUserId }) {
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]); // [{id, otherUser, lastMessage, unreadCount}]
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [presence, setPresence] = useState({}); // userId -> {status, lastSeen}
  const [loading, setLoading] = useState(true);

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messagesByConversation, setMessagesByConversation] = useState({}); // convId -> [messages]
  const [typingByConversation, setTypingByConversation] = useState({}); // convId -> Set(userId)

  const messagesByConversationRef = useRef(messagesByConversation);
  messagesByConversationRef.current = messagesByConversation;

  // ── Initial data load ──────────────────────────────────────
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsRes, convRes, reqRes] = await Promise.all([
        api.get("/friends"),
        api.get("/conversations"),
        api.get("/friends/requests"),
      ]);
      setFriends(friendsRes.data.friends);
      setConversations(convRes.data.conversations);
      setIncomingRequests(reqRes.data.incoming);
      setOutgoingRequests(reqRes.data.outgoing);

      const presenceMap = {};
      friendsRes.data.friends.forEach((f) => {
        presenceMap[f.id] = { status: f.status, lastSeen: f.lastSeen };
      });
      setPresence(presenceMap);
    } catch (err) {
      console.error("Failed to load chat data:", extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ── Socket event wiring ─────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onMessageNew = (msg) => {
      setMessagesByConversation((prev) => {
        const list = prev[msg.conversationId] || [];
        // Reconcile optimistic message by clientId if present
        if (msg.clientId) {
          const idx = list.findIndex((m) => m.clientId === msg.clientId);
          if (idx !== -1) {
            const next = [...list];
            next[idx] = msg;
            return { ...prev, [msg.conversationId]: next };
          }
        }
        if (list.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [msg.conversationId]: [...list, msg] };
      });
    };

    const onMessageEdited = (msg) => {
      setMessagesByConversation((prev) => {
        const list = prev[msg.conversationId] || [];
        return {
          ...prev,
          [msg.conversationId]: list.map((m) => (m.id === msg.id ? msg : m)),
        };
      });
    };

    const onMessageDeleted = ({ messageId, conversationId }) => {
      setMessagesByConversation((prev) => {
        const list = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: list.map((m) =>
            m.id === messageId ? { ...m, deleted: true, text: null, imageUrl: null } : m
          ),
        };
      });
    };

    const onReactionUpdated = ({ messageId, reactions }) => {
      setMessagesByConversation((prev) => {
        const next = { ...prev };
        for (const convId of Object.keys(next)) {
          const idx = next[convId].findIndex((m) => m.id === messageId);
          if (idx !== -1) {
            const list = [...next[convId]];
            list[idx] = { ...list[idx], reactions };
            next[convId] = list;
            break;
          }
        }
        return next;
      });
    };

    const onTypingUpdate = ({ conversationId, userId, isTyping }) => {
      setTypingByConversation((prev) => {
        const set = new Set(prev[conversationId] || []);
        if (isTyping) set.add(userId);
        else set.delete(userId);
        return { ...prev, [conversationId]: set };
      });
    };

    const onPresenceUpdate = ({ userId, status, lastSeen }) => {
      setPresence((prev) => ({ ...prev, [userId]: { status, lastSeen: lastSeen || prev[userId]?.lastSeen } }));
      setFriends((prev) => prev.map((f) => (f.id === userId ? { ...f, status, lastSeen: lastSeen || f.lastSeen } : f)));
    };

    const onConversationUpdated = ({ conversationId, lastMessage }) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId);
        if (idx === -1) {
          // New conversation we don't have locally yet — refetch list
          refreshAll();
          return prev;
        }
        const updated = {
          ...prev[idx],
          lastMessage,
          unreadCount:
            lastMessage.senderId !== currentUserId && conversationId !== activeConversationId
              ? (prev[idx].unreadCount || 0) + 1
              : prev[idx].unreadCount,
        };
        const next = [...prev];
        next.splice(idx, 1);
        return [updated, ...next];
      });
    };

    const onFriendRequestReceived = ({ requestId, from, createdAt }) => {
      setIncomingRequests((prev) => [{ requestId, user: from, createdAt }, ...prev]);
    };

    const onFriendAccepted = ({ friend }) => {
      setFriends((prev) => (prev.some((f) => f.id === friend.id) ? prev : [friend, ...prev]));
      setOutgoingRequests((prev) => prev.filter((r) => r.user.id !== friend.id));
      refreshAll();
    };

    const onFriendRemoved = ({ userId }) => {
      setFriends((prev) => prev.filter((f) => f.id !== userId));
      setConversations((prev) => prev.filter((c) => c.otherUser.id !== userId));
    };

    const onMessagesRead = ({ conversationId, readAt }) => {
      setMessagesByConversation((prev) => {
        const list = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: list.map((m) =>
            m.senderId === currentUserId && !m.readAt ? { ...m, readAt } : m
          ),
        };
      });
    };

    socket.on("message:new", onMessageNew);
    socket.on("message:edited", onMessageEdited);
    socket.on("message:deleted", onMessageDeleted);
    socket.on("message:reaction_updated", onReactionUpdated);
    socket.on("typing:update", onTypingUpdate);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("conversation:updated", onConversationUpdated);
    socket.on("friend:request_received", onFriendRequestReceived);
    socket.on("friend:accepted", onFriendAccepted);
    socket.on("friend:removed", onFriendRemoved);
    socket.on("messages:read", onMessagesRead);

    return () => {
      socket.off("message:new", onMessageNew);
      socket.off("message:edited", onMessageEdited);
      socket.off("message:deleted", onMessageDeleted);
      socket.off("message:reaction_updated", onReactionUpdated);
      socket.off("typing:update", onTypingUpdate);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("conversation:updated", onConversationUpdated);
      socket.off("friend:request_received", onFriendRequestReceived);
      socket.off("friend:accepted", onFriendAccepted);
      socket.off("friend:removed", onFriendRemoved);
      socket.off("messages:read", onMessagesRead);
    };
  }, [socket, currentUserId, activeConversationId, refreshAll]);

  // ── Conversation actions ───────────────────────────────────
  const openConversationWithFriend = useCallback(
    async (friendId) => {
      const existing = conversations.find((c) => c.otherUser.id === friendId);
      let convId = existing?.id;
      if (!convId) {
        const { data } = await api.post(`/conversations/with/${friendId}`);
        convId = data.conversationId;
        await refreshAll();
      }
      setActiveConversationId(convId);
      socket?.emit("conversation:join", { conversationId: convId });
      return convId;
    },
    [conversations, socket, refreshAll]
  );

  const loadMessages = useCallback(
    async (conversationId) => {
      if (messagesByConversationRef.current[conversationId]) return; // already loaded
      const { data } = await api.get(`/conversations/${conversationId}/messages`, {
        params: { limit: 40 },
      });
      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: data.messages }));
    },
    []
  );

  const markRead = useCallback(
    async (conversationId) => {
      try {
        await api.post(`/conversations/${conversationId}/read`);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        );
      } catch {
        /* non-critical */
      }
    },
    []
  );

  const sendMessage = useCallback(
    (conversationId, text, replyToId) => {
      if (!socket) return;
      const clientId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic = {
        id: clientId,
        clientId,
        conversationId,
        senderId: currentUserId,
        type: "TEXT",
        text,
        imageUrl: null,
        replyTo: replyToId ? findMessageById(messagesByConversationRef.current, replyToId) : null,
        edited: false,
        deleted: false,
        createdAt: new Date().toISOString(),
        reactions: {},
        pending: true,
      };
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), optimistic],
      }));

      socket.emit("message:send", { conversationId, text, replyToId, clientId }, (res) => {
        if (res?.error) {
          setMessagesByConversation((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map((m) =>
              m.clientId === clientId ? { ...m, failed: true, pending: false } : m
            ),
          }));
        }
      });
    },
    [socket, currentUserId]
  );

  const sendImageMessage = useCallback(
    async (conversationId, file, caption, replyToId) => {
      const formData = new FormData();
      formData.append("image", file);
      if (caption) formData.append("caption", caption);
      if (replyToId) formData.append("replyToId", replyToId);
      const { data } = await api.post(`/conversations/${conversationId}/messages/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessagesByConversation((prev) => {
        const list = prev[conversationId] || [];
        if (list.some((m) => m.id === data.message.id)) return prev;
        return { ...prev, [conversationId]: [...list, data.message] };
      });
      return data.message;
    },
    []
  );

  const editMessage = useCallback(
    (conversationId, messageId, text) => {
      socket?.emit("message:edit", { messageId, text });
    },
    [socket]
  );

  const deleteMessage = useCallback(
    (conversationId, messageId) => {
      socket?.emit("message:delete", { messageId });
    },
    [socket]
  );

  const reactToMessage = useCallback(
    (messageId, emoji) => {
      socket?.emit("message:react", { messageId, emoji });
    },
    [socket]
  );

  const setTyping = useCallback(
    (conversationId, isTyping) => {
      socket?.emit(isTyping ? "typing:start" : "typing:stop", { conversationId });
    },
    [socket]
  );

  // ── Friend actions ──────────────────────────────────────────
  const sendFriendRequest = useCallback(async (query) => {
    const isNumeric = /^\d{10}$/.test(query);
    const { data } = await api.post("/friends/requests", isNumeric ? { novaId: query } : { username: query });
    if (data.status === "ACCEPTED") {
      await refreshAll();
    } else {
      setOutgoingRequests((prev) => [
        { requestId: data.requestId, user: null, createdAt: new Date().toISOString(), pendingQuery: query },
        ...prev,
      ]);
    }
    return data;
  }, [refreshAll]);

  const acceptFriendRequest = useCallback(async (requestId) => {
    const { data } = await api.post(`/friends/requests/${requestId}/accept`);
    setIncomingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    setFriends((prev) => [data.friend, ...prev]);
    return data.friend;
  }, []);

  const declineFriendRequest = useCallback(async (requestId) => {
    await api.post(`/friends/requests/${requestId}/decline`);
    setIncomingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
  }, []);

  const cancelFriendRequest = useCallback(async (requestId) => {
    await api.delete(`/friends/requests/${requestId}`);
    setOutgoingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
  }, []);

  const removeFriend = useCallback(async (friendId) => {
    await api.delete(`/friends/${friendId}`);
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    setConversations((prev) => prev.filter((c) => c.otherUser.id !== friendId));
  }, []);

  const blockUser = useCallback(async (userId) => {
    await api.post(`/friends/${userId}/block`);
    setFriends((prev) => prev.filter((f) => f.id !== userId));
    setConversations((prev) => prev.filter((c) => c.otherUser.id !== userId));
  }, []);

  return {
    loading,
    friends,
    conversations,
    incomingRequests,
    outgoingRequests,
    presence,
    activeConversationId,
    setActiveConversationId,
    messagesByConversation,
    typingByConversation,
    openConversationWithFriend,
    loadMessages,
    markRead,
    sendMessage,
    sendImageMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    setTyping,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    removeFriend,
    blockUser,
    refreshAll,
  };
}

function findMessageById(messagesByConversation, id) {
  for (const list of Object.values(messagesByConversation)) {
    const found = list.find((m) => m.id === id);
    if (found) return { id: found.id, text: found.text, senderId: found.senderId, deleted: found.deleted };
  }
  return null;
}
