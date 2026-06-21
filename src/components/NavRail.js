"use client";

import Avatar from "./Avatar";

const NAV_ITEMS = [
  { id: "chats", label: "Chats", icon: ChatsIcon },
  { id: "friends", label: "Friends", icon: FriendsIcon },
  { id: "add", label: "Add friend", icon: AddIcon },
  { id: "requests", label: "Requests", icon: BellIcon },
];

export default function NavRail({ active, onChange, currentUser, requestCount }) {
  return (
    <div className="w-[68px] shrink-0 bg-nova-panel border-r border-nova-border flex flex-col items-center py-4 gap-1">
      <div className="w-9 h-9 rounded-xl bg-nova-primary flex items-center justify-center mb-4 shadow-glow">
        <span className="text-white font-display font-bold text-sm">N</span>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            title={item.label}
            className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              isActive ? "bg-nova-primaryLight text-nova-primary" : "text-nova-textMuted hover:text-nova-text hover:bg-nova-card"
            }`}
          >
            <Icon active={isActive} />
            {item.id === "requests" && requestCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-nova-danger text-white text-[9px] font-bold flex items-center justify-center border-2 border-nova-panel">
                {requestCount > 9 ? "9+" : requestCount}
              </span>
            )}
          </button>
        );
      })}

      <div className="mt-auto">
        <button onClick={() => onChange("profile")} className="block rounded-full" title="Profile">
          <Avatar user={currentUser} size={36} showPresence ring={active === "profile"} />
        </button>
      </div>
    </div>
  );
}

function ChatsIcon({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FriendsIcon({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AddIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
