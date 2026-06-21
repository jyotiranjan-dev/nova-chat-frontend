"use client";

import Avatar from "./Avatar";

export default function TypingIndicator({ user }) {
  return (
    <div className="flex items-end gap-2 mb-1 animate-fade-in">
      <Avatar user={user} size={28} />
      <div className="bg-nova-card border border-nova-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-nova-textMuted animate-bounce-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
