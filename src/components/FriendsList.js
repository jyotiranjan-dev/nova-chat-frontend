"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Avatar from "./Avatar";

export default function FriendsList({ friends, presence, onOpenChat, onRemove, onBlock }) {
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuFor(null);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return friends;
    const q = query.toLowerCase();
    return friends.filter((f) => f.displayName.toLowerCase().includes(q) || f.username.toLowerCase().includes(q));
  }, [friends, query]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aOnline = (presence[a.id]?.status || a.status) === "ONLINE";
      const bOnline = (presence[b.id]?.status || b.status) === "ONLINE";
      if (aOnline !== bOnline) return aOnline ? -1 : 1;
      return a.displayName.localeCompare(b.displayName);
    });
  }, [filtered, presence]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display font-semibold text-xl text-nova-text">Friends</h1>
        <p className="text-xs text-nova-textFaint mt-0.5">{friends.length} {friends.length === 1 ? "friend" : "friends"}</p>
        <div className="relative mt-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nova-textFaint">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends"
            className="w-full bg-nova-card border border-nova-border rounded-nova-sm pl-9 pr-3 py-2 text-sm text-nova-text placeholder:text-nova-textFaint outline-none focus:border-nova-primary focus:ring-2 focus:ring-nova-primary/15 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {sorted.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-nova-textMuted">{friends.length === 0 ? "No friends yet." : `No matches for "${query}"`}</p>
            {friends.length === 0 && <p className="text-xs text-nova-textFaint mt-1">Use the Add tab to find people by username or Nova ID.</p>}
          </div>
        )}

        {sorted.map((friend) => {
          const status = presence[friend.id]?.status || friend.status;
          const isOnline = status === "ONLINE";
          return (
            <div
              key={friend.id}
              className="relative group flex items-center gap-3 px-3 py-2.5 rounded-nova-sm hover:bg-nova-card transition-colors mb-0.5"
            >
              <button onClick={() => onOpenChat(friend.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <Avatar user={{ ...friend, status }} size={44} showPresence />
                <div className="min-w-0">
                  <div className="font-medium text-[14px] text-nova-text truncate">{friend.displayName}</div>
                  <div className="text-xs text-nova-textFaint truncate">
                    {isOnline ? <span className="text-nova-success">Online</span> : `@${friend.username}`}
                  </div>
                </div>
              </button>

              <button
                onClick={() => onOpenChat(friend.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full flex items-center justify-center text-nova-textMuted hover:text-nova-primary hover:bg-nova-primaryLight"
                title="Message"
              >
                <ChatIcon />
              </button>

              <div className="relative" ref={menuFor === friend.id ? menuRef : null}>
                <button
                  onClick={() => setMenuFor(menuFor === friend.id ? null : friend.id)}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-nova-textMuted hover:text-nova-text hover:bg-nova-borderLight"
                >
                  <MoreIcon />
                </button>
                {menuFor === friend.id && (
                  <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-nova-elevated border border-nova-border rounded-nova-sm shadow-panel py-1 animate-pop-in">
                    <MenuItem
                      onClick={() => {
                        setMenuFor(null);
                        if (confirm(`Remove ${friend.displayName} from your friends?`)) onRemove(friend.id);
                      }}
                    >
                      Remove friend
                    </MenuItem>
                    <MenuItem
                      danger
                      onClick={() => {
                        setMenuFor(null);
                        if (confirm(`Block ${friend.displayName}? They won't be able to message you.`)) onBlock(friend.id);
                      }}
                    >
                      Block user
                    </MenuItem>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3.5 py-2 text-[13px] font-medium transition-colors ${
        danger ? "text-nova-danger hover:bg-nova-danger/10" : "text-nova-textSoft hover:bg-nova-borderLight hover:text-nova-text"
      }`}
    >
      {children}
    </button>
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
function ChatIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}
