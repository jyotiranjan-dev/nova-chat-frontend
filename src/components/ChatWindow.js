"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import TypingIndicator from "./TypingIndicator";
import { formatDateDivider, formatLastSeen } from "@/lib/time";

export default function ChatWindow({ conversation, chat, currentUser, onBack, isMobile }) {
  const otherUser = conversation.otherUser;
  const presenceInfo = chat.presence[otherUser.id] || { status: otherUser.status, lastSeen: otherUser.lastSeen };
  const isOnline = presenceInfo.status === "ONLINE";
  const isTyping = (chat.typingByConversation[conversation.id] || new Set()).has(otherUser.id);

  const messages = chat.messagesByConversation[conversation.id] || [];
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const messageRefs = useRef({});

  useEffect(() => {
    chat.loadMessages(conversation.id);
  }, [conversation.id, chat]);

  useEffect(() => {
    chat.markRead(conversation.id);
  }, [conversation.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isNearBottom = useRef(true);
  useEffect(() => {
    if (isNearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
  }

  const handleSend = useCallback(
    (text, replyToId) => {
      chat.sendMessage(conversation.id, text, replyToId);
    },
    [chat, conversation.id]
  );

  const handleSendImage = useCallback(
    async (file, caption, replyToId) => {
      await chat.sendImageMessage(conversation.id, file, caption, replyToId);
    },
    [chat, conversation.id]
  );

  const handleTyping = useCallback(
    (isTypingNow) => chat.setTyping(conversation.id, isTypingNow),
    [chat, conversation.id]
  );

  const handleReact = useCallback((messageId, emoji) => chat.reactToMessage(messageId, emoji), [chat]);
  const handleDelete = useCallback(
    (messageId) => {
      if (confirm("Delete this message? This can't be undone.")) {
        chat.deleteMessage(conversation.id, messageId);
      }
    },
    [chat, conversation.id]
  );
  const handleSubmitEdit = useCallback(
    (messageId, text) => {
      chat.editMessage(conversation.id, messageId, text);
      setEditingMessage(null);
    },
    [chat, conversation.id]
  );

  const scrollToMessage = useCallback((messageId) => {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-nova-primary/60", "rounded-2xl");
      setTimeout(() => el.classList.remove("ring-2", "ring-nova-primary/60", "rounded-2xl"), 1200);
    }
  }, []);

  // Group consecutive messages from the same sender to decide when to show avatar/name
  let lastSenderId = null;
  let lastDateKey = null;

  return (
    <div className="flex flex-col h-full bg-nova-bg min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-nova-border bg-nova-panel/80 glass shrink-0">
        {isMobile && (
          <button onClick={onBack} className="text-nova-textMuted hover:text-nova-text p-1 -ml-1">
            <BackIcon />
          </button>
        )}
        <Avatar user={{ ...otherUser, status: presenceInfo.status }} size={40} showPresence />
        <div className="min-w-0 flex-1">
          <div className="font-display font-semibold text-[15px] text-nova-text truncate">{otherUser.displayName}</div>
          <div className={`text-xs truncate ${isTyping ? "text-nova-success" : isOnline ? "text-nova-success" : "text-nova-textFaint"}`}>
            {isTyping ? "typing…" : isOnline ? "Online" : formatLastSeen(presenceInfo.lastSeen)}
          </div>
        </div>
        <span className="hidden sm:block font-mono text-[11px] text-nova-textFaint tracking-wider">{otherUser.novaId}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <Avatar user={otherUser} size={64} />
            <h3 className="mt-4 font-display font-semibold text-nova-text">{otherUser.displayName}</h3>
            <p className="mt-1 text-sm text-nova-textMuted max-w-[260px]">
              Say hello to start the conversation with @{otherUser.username}.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const dateKey = new Date(msg.createdAt).toDateString();
          const showDateDivider = dateKey !== lastDateKey;
          lastDateKey = dateKey;

          const showSender = msg.senderId !== lastSenderId || showDateDivider;
          lastSenderId = msg.senderId;

          const sender = msg.senderId === currentUser.id ? currentUser : otherUser;

          return (
            <div key={msg.id} ref={(el) => (messageRefs.current[msg.id] = el)}>
              {showDateDivider && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-nova-border" />
                  <span className="text-[11px] font-medium text-nova-textFaint px-1">
                    {formatDateDivider(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-nova-border" />
                </div>
              )}
              <MessageBubble
                message={msg}
                isMine={msg.senderId === currentUser.id}
                sender={sender}
                onReact={handleReact}
                onReply={(m) => setReplyTo(m)}
                onEdit={(m) => setEditingMessage(m)}
                onDelete={handleDelete}
                onScrollToMessage={scrollToMessage}
                currentUserId={currentUser.id}
                showSender={showSender}
              />
            </div>
          );
        })}

        {isTyping && <TypingIndicator user={otherUser} />}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        conversationId={conversation.id}
        onSend={handleSend}
        onSendImage={handleSendImage}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editingMessage={editingMessage}
        onSubmitEdit={handleSubmitEdit}
        onCancelEdit={() => setEditingMessage(null)}
        replySender={replyTo ? (replyTo.senderId === currentUser.id ? currentUser : otherUser) : null}
      />
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
