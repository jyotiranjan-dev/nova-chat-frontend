"use client";

import { useState, useRef, useEffect } from "react";
import Avatar from "./Avatar";
import { formatMessageTime } from "@/lib/time";

const QUICK_REACTIONS = ["❤️", "😂", "🔥", "👍", "👀", "😢"];

export default function MessageBubble({
  message,
  isMine,
  sender,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onScrollToMessage,
  currentUserId,
  showSender,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (message.deleted) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1 group`}>
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-nova-card/60 border border-nova-border/60 text-nova-textFaint text-[13px] italic">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="opacity-70">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Message deleted
        </div>
      </div>
    );
  }

  const reactionEntries = Object.entries(message.reactions || {}).filter(([, users]) => users.length > 0);

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-0.5 gap-2 items-end animate-slide-up group`}
    >
      {!isMine && (
        <div className="w-7 shrink-0">{showSender && <Avatar user={sender} size={28} />}</div>
      )}

      <div className={`max-w-[70%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        {!isMine && showSender && (
          <span className="text-[11px] text-nova-textMuted mb-1 ml-1 font-medium">{sender?.displayName}</span>
        )}

        <div className="relative flex items-center gap-1.5" ref={menuRef}>
          {/* Hover action bar */}
          <div
            className={`order-${isMine ? "first" : "last"} opacity-0 group-hover:opacity-100 ${
              menuOpen || pickerOpen ? "opacity-100" : ""
            } transition-opacity flex items-center gap-0.5 bg-nova-elevated border border-nova-border rounded-full px-1 py-1 shadow-panel`}
            style={{ opacity: menuOpen || pickerOpen ? 1 : undefined }}
          >
            <ActionBtn label="React" onClick={() => setPickerOpen((p) => !p)}>
              <SmileIcon />
            </ActionBtn>
            <ActionBtn label="Reply" onClick={() => onReply(message)}>
              <ReplyIcon />
            </ActionBtn>
            {isMine && message.type === "TEXT" && (
              <ActionBtn label="Edit" onClick={() => onEdit(message)}>
                <EditIcon />
              </ActionBtn>
            )}
            {isMine && (
              <ActionBtn label="Delete" onClick={() => onDelete(message.id)} danger>
                <TrashIcon />
              </ActionBtn>
            )}

            {pickerOpen && (
              <div
                className={`absolute top-full mt-2 ${isMine ? "right-0" : "left-0"} z-20 flex gap-1 bg-nova-elevated border border-nova-border rounded-full px-2 py-1.5 shadow-panel animate-pop-in`}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(message.id, emoji);
                      setPickerOpen(false);
                    }}
                    className="text-lg leading-none hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bubble */}
          <div
            className={`group relative rounded-2xl px-3.5 py-2.5 shadow-bubble ${
              isMine
                ? "bg-nova-primary text-white rounded-br-md"
                : "bg-nova-card text-nova-text border border-nova-border rounded-bl-md"
            } ${message.pending ? "opacity-60" : ""} ${message.failed ? "ring-1 ring-nova-danger" : ""}`}
          >
            {message.replyTo && (
              <button
                onClick={() => onScrollToMessage?.(message.replyTo.id)}
                className={`block w-full text-left mb-1.5 px-2.5 py-1.5 rounded-lg border-l-2 ${
                  isMine ? "bg-white/10 border-white/40" : "bg-nova-elevated border-nova-primary"
                }`}
              >
                <div className={`text-[11px] font-semibold ${isMine ? "text-white/80" : "text-nova-primary"}`}>
                  {message.replyTo.senderId === currentUserId ? "You" : sender?.displayName || "Nova user"}
                </div>
                <div className={`text-xs truncate ${isMine ? "text-white/70" : "text-nova-textMuted"}`}>
                  {message.replyTo.deleted ? "Message deleted" : message.replyTo.text || "Photo"}
                </div>
              </button>
            )}

            {message.type === "IMAGE" && message.imageUrl && (
              <div className="mb-1.5 -mx-0.5 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.imageUrl}
                  alt="Shared"
                  className="max-w-[260px] max-h-[320px] object-cover rounded-xl cursor-pointer"
                  onClick={() => window.open(message.imageUrl, "_blank")}
                />
              </div>
            )}

            {message.text && <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</div>}

            <div className={`flex items-center justify-end gap-1.5 mt-1 ${isMine ? "text-white/65" : "text-nova-textFaint"}`}>
              {message.edited && <span className="text-[10px] italic">edited</span>}
              <span className="text-[10px]">{formatMessageTime(message.createdAt)}</span>
              {isMine && !message.pending && <ReadTicks read={!!message.readAt} />}
              {message.pending && <span className="text-[10px]">sending…</span>}
              {message.failed && <span className="text-[10px] text-nova-danger">failed</span>}
            </div>
          </div>
        </div>

        {reactionEntries.length > 0 && (
          <div className={`flex gap-1 mt-1 flex-wrap ${isMine ? "justify-end" : "justify-start"}`}>
            {reactionEntries.map(([emoji, users]) => {
              const mine = users.includes(currentUserId);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                    mine
                      ? "bg-nova-primaryLight border-nova-primary/50 text-nova-primary"
                      : "bg-nova-elevated border-nova-border text-nova-textMuted hover:border-nova-borderLight"
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="font-medium">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ReadTicks({ read }) {
  return (
    <svg width="15" height="10" viewBox="0 0 18 10" fill="none">
      <path d="M1 5l3 3 4-7" stroke={read ? "#FFB454" : "currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5l3 3 7-7" stroke={read ? "#FFB454" : "currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionBtn({ children, onClick, label, danger }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
        danger ? "text-nova-textMuted hover:text-nova-danger hover:bg-nova-danger/10" : "text-nova-textMuted hover:text-nova-text hover:bg-nova-borderLight"
      }`}
    >
      {children}
    </button>
  );
}

function SmileIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ReplyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 17l-5-5 5-5M4 12h10a5 5 0 015 5v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
