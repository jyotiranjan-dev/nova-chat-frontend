"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { useChatData } from "@/hooks/useChatData";

import NavRail from "@/components/NavRail";
import ConversationList from "@/components/ConversationList";
import FriendsList from "@/components/FriendsList";
import AddFriendPanel from "@/components/AddFriendPanel";
import RequestsPanel from "@/components/RequestsPanel";
import ProfilePanel from "@/components/ProfilePanel";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const { socket, connected } = useSocket(token);
  const chat = useChatData({ socket, connected, currentUserId: user?.id });

  const [activeTab, setActiveTab] = useState("chats");
  const [activeConversation, setActiveConversation] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSelectConversation = useCallback(
    (conv) => {
      setActiveConversation(conv);
      chat.setActiveConversationId(conv.id);
      socket?.emit("conversation:join", { conversationId: conv.id });
      if (isMobile) setMobileShowChat(true);
    },
    [chat, socket, isMobile]
  );

  const handleOpenChatWithFriend = useCallback(
    async (friendId) => {
      const convId = await chat.openConversationWithFriend(friendId);
      const conv = chat.conversations.find((c) => c.id === convId) || {
        id: convId,
        otherUser: chat.friends.find((f) => f.id === friendId),
        lastMessage: null,
        unreadCount: 0,
      };
      setActiveConversation(conv);
      setActiveTab("chats");
      if (isMobile) setMobileShowChat(true);
    },
    [chat, isMobile]
  );

  // Keep activeConversation in sync if the underlying conversation data changes
  useEffect(() => {
    if (!activeConversation) return;
    const updated = chat.conversations.find((c) => c.id === activeConversation.id);
    if (updated && updated !== activeConversation) setActiveConversation(updated);
  }, [chat.conversations, activeConversation]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-nova-bg flex items-center justify-center">
        <div className="w-9 h-9 rounded-xl bg-nova-primary/20 border border-nova-primary/30 flex items-center justify-center animate-pulse">
          <span className="text-nova-primary font-display font-bold text-sm">N</span>
        </div>
      </div>
    );
  }

  const showSidebar = !isMobile || !mobileShowChat;
  const showChat = !isMobile || mobileShowChat;

  return (
    <div className="h-[100dvh] flex bg-nova-bg overflow-hidden">
      {!isMobile && (
        <NavRail
          active={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          currentUser={user}
          requestCount={chat.incomingRequests.length}
        />
      )}

      {showSidebar && (
        <div className={`${isMobile ? "w-full" : "w-[340px]"} shrink-0 border-r border-nova-border bg-nova-panel flex flex-col`}>
          {isMobile && (
            <MobileTabBar
              active={activeTab}
              onChange={setActiveTab}
              requestCount={chat.incomingRequests.length}
              currentUser={user}
            />
          )}

          {activeTab === "chats" && (
            <ConversationList
              conversations={chat.conversations}
              presence={chat.presence}
              activeConversationId={activeConversation?.id}
              onSelect={handleSelectConversation}
              currentUserId={user.id}
            />
          )}
          {activeTab === "friends" && (
            <FriendsList
              friends={chat.friends}
              presence={chat.presence}
              onOpenChat={handleOpenChatWithFriend}
              onRemove={chat.removeFriend}
              onBlock={chat.blockUser}
            />
          )}
          {activeTab === "add" && (
            <AddFriendPanel currentUser={user} onSendRequest={chat.sendFriendRequest} outgoingRequests={chat.outgoingRequests} />
          )}
          {activeTab === "requests" && (
            <RequestsPanel
              incoming={chat.incomingRequests}
              outgoing={chat.outgoingRequests}
              onAccept={chat.acceptFriendRequest}
              onDecline={chat.declineFriendRequest}
              onCancel={chat.cancelFriendRequest}
            />
          )}
          {activeTab === "profile" && <ProfilePanel currentUser={user} />}
        </div>
      )}

      {showChat && (
        <div className="flex-1 min-w-0">
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              chat={chat}
              currentUser={user}
              isMobile={isMobile}
              onBack={() => setMobileShowChat(false)}
            />
          ) : (
            <EmptyState connected={connected} />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ connected }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-nova-bg px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-nova-primaryLight flex items-center justify-center mb-4">
        <ChatGlyph />
      </div>
      <h2 className="font-display font-semibold text-lg text-nova-text">Your messages</h2>
      <p className="text-sm text-nova-textMuted mt-1 max-w-[280px]">
        Select a conversation, or add a friend to start a new one.
      </p>
      {!connected && (
        <div className="mt-4 flex items-center gap-2 text-xs text-nova-amber bg-nova-amber/10 border border-nova-amber/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-nova-amber animate-pulse" />
          Reconnecting…
        </div>
      )}
    </div>
  );
}

function ChatGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#4F9CF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MobileTabBar({ active, onChange, requestCount, currentUser }) {
  const tabs = [
    { id: "chats", label: "Chats" },
    { id: "friends", label: "Friends" },
    { id: "add", label: "Add" },
    { id: "requests", label: "Requests", badge: requestCount },
    { id: "profile", label: "Me" },
  ];
  return (
    <div className="flex items-center border-b border-nova-border px-1 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-3.5 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors ${
            active === tab.id ? "text-nova-primary" : "text-nova-textFaint"
          }`}
        >
          {tab.label}
          {tab.badge > 0 && (
            <span className="absolute top-1.5 right-0.5 w-2 h-2 rounded-full bg-nova-danger" />
          )}
          {active === tab.id && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-nova-primary rounded-full" />}
        </button>
      ))}
    </div>
  );
}
