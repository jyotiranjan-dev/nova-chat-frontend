"use client";

import { useState, useMemo } from "react";
import Avatar from "./Avatar";
import { formatRelativeShort } from "@/lib/time";

export default function ConversationList({ conversations, presence, activeConversationId, onSelect, currentUserId }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) => c.otherUser.displayName.toLowerCase().includes(q) || c.otherUser.username.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display font-semibold text-xl text-nova-text">Messages</h1>
        <div className="relative mt-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nova-textFaint">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-nova-card border border-nova-border rounded-nova-sm pl-9 pr-3 py-2 text-sm text-nova-text placeholder:text-nova-textFaint outline-none focus:border-nova-primary focus:ring-2 focus:ring-nova-primary/15 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 && conversations.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-nova-textMuted">No conversations yet.</p>
            <p className="text-xs text-nova-textFaint mt-1">Add a friend to start chatting.</p>
          </div>
        )}
        {filtered.length === 0 && conversations.length > 0 && (
          <div className="px-4 py-10 text-center text-sm text-nova-textMuted">No matches for &quot;{query}&quot;</div>
        )}

        {filtered.map((conv) => {
          const liveStatus = presence[conv.otherUser.id]?.status || conv.otherUser.status;
          const isActive = conv.id === activeConversationId;
          const lm = conv.lastMessage;

          let preview = "Say hello \u{1F44B}";
          if (lm) {
            if (lm.deleted) preview = "Message deleted";
            else if (lm.type === "IMAGE") preview = `${lm.senderId === currentUserId ? "You: " : ""}\u{1F4F7} Photo`;
            else preview = `${lm.senderId === currentUserId ? "You: " : ""}${lm.text || ""}`;
          }

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-nova-sm text-left transition-colors mb-0.5 ${
                isActive ? "bg-nova-primaryLight" : "hover:bg-nova-card"
              }`}
            >
              <Avatar user={{ ...conv.otherUser, status: liveStatus }} size={48} showPresence />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-medium text-[14px] truncate ${isActive ? "text-nova-text" : "text-nova-text"}`}>
                    {conv.otherUser.displayName}
                  </span>
                  {lm && <span className="text-[11px] text-nova-textFaint shrink-0">{formatRelativeShort(lm.createdAt)}</span>}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className={`text-[13px] truncate ${conv.unreadCount > 0 ? "text-nova-textSoft font-medium" : "text-nova-textMuted"}`}>
                    {preview}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-nova-primary text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
