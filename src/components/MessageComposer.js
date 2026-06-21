"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Avatar from "./Avatar";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function MessageComposer({
  conversationId,
  onSend,
  onSendImage,
  onTyping,
  replyTo,
  onCancelReply,
  editingMessage,
  onSubmitEdit,
  onCancelEdit,
  replySender,
}) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPanelRef = useRef(null);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  useEffect(() => {
    function onClickOutside(e) {
      if (emojiPanelRef.current && !emojiPanelRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleTextChange = useCallback(
    (val) => {
      setText(val);
      onTyping?.(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping?.(false), 1500);
    },
    [onTyping]
  );

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("Image must be under 50MB");
      return;
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    if (editingMessage) {
      if (!text.trim()) return;
      onSubmitEdit(editingMessage.id, text.trim());
      setText("");
      return;
    }

    if (imageFile) {
      setUploading(true);
      try {
        await onSendImage(imageFile, text.trim(), replyTo?.id);
        setImageFile(null);
        setImagePreviewUrl(null);
        setText("");
        onCancelReply?.();
      } catch (err) {
        alert(err?.response?.data?.error || "Failed to send image");
      } finally {
        setUploading(false);
      }
      return;
    }

    if (!text.trim()) return;
    onSend(text.trim(), replyTo?.id);
    setText("");
    onTyping?.(false);
    onCancelReply?.();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && editingMessage) {
      onCancelEdit();
      setText("");
    }
  }

  return (
    <div className="border-t border-nova-border bg-nova-panel">
      {replyTo && !editingMessage && (
        <div className="flex items-center justify-between px-4 py-2 bg-nova-primaryLight border-b border-nova-border/60 animate-slide-up">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar user={replySender} size={28} />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-nova-primary">Replying to {replySender?.displayName}</div>
              <div className="text-xs text-nova-textMuted truncate max-w-[280px]">
                {replyTo.deleted ? "Message deleted" : replyTo.text || "Photo"}
              </div>
            </div>
          </div>
          <button onClick={onCancelReply} className="text-nova-textFaint hover:text-nova-text p-1">
            <CloseIcon />
          </button>
        </div>
      )}

      {editingMessage && (
        <div className="flex items-center justify-between px-4 py-2 bg-nova-amberDim/20 border-b border-nova-border/60 animate-slide-up">
          <div className="flex items-center gap-2 text-[12px] font-medium text-nova-amber">
            <EditIcon /> Editing message
          </div>
          <button onClick={() => { onCancelEdit(); setText(""); }} className="text-nova-textFaint hover:text-nova-text p-1">
            <CloseIcon />
          </button>
        </div>
      )}

      {imagePreviewUrl && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-nova-card border-b border-nova-border/60 animate-slide-up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreviewUrl} alt="Selected" className="w-14 h-14 rounded-lg object-cover" />
          <span className="text-xs text-nova-textMuted flex-1 truncate">{imageFile?.name}</span>
          <button
            onClick={() => { setImageFile(null); setImagePreviewUrl(null); }}
            className="text-nova-textFaint hover:text-nova-danger p-1"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 px-3.5 py-3">
        {!editingMessage && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-nova-textMuted hover:text-nova-primary hover:bg-nova-primaryLight transition-colors"
              title="Attach a photo"
            >
              <AttachIcon />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? "Edit your message…" : "Message…"}
            rows={1}
            className="w-full resize-none bg-nova-card border border-nova-border rounded-2xl px-4 py-2.5 pr-10 text-[14px] text-nova-text placeholder:text-nova-textFaint outline-none focus:border-nova-primary focus:ring-2 focus:ring-nova-primary/15 max-h-32 leading-relaxed transition-colors"
            style={{ minHeight: 42 }}
          />
          <div className="relative" ref={emojiPanelRef}>
            <button
              type="button"
              onClick={() => setEmojiOpen((p) => !p)}
              className="absolute right-2.5 bottom-2 text-nova-textFaint hover:text-nova-amber transition-colors"
              title="Emoji"
            >
              <EmojiIcon />
            </button>
            {emojiOpen && (
              <div className="absolute bottom-12 right-0 z-30 animate-pop-in shadow-panel rounded-nova overflow-hidden">
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={(emojiData) => {
                    handleTextChange(text + emojiData.emoji);
                  }}
                  searchDisabled={false}
                  skinTonesDisabled
                  width={300}
                  height={360}
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || (!text.trim() && !imageFile)}
          className="shrink-0 w-10 h-10 rounded-full bg-nova-primary disabled:bg-nova-elevated disabled:text-nova-textFaint text-white flex items-center justify-center transition-colors hover:bg-nova-primaryHover active:scale-95"
        >
          {uploading ? <Spinner /> : editingMessage ? <CheckIcon /> : <SendIcon />}
        </button>
      </form>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AttachIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EmojiIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
