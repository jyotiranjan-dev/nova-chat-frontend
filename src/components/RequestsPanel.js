"use client";

import { useState } from "react";
import Avatar from "./Avatar";

export default function RequestsPanel({ incoming, outgoing, onAccept, onDecline, onCancel }) {
  const [busyId, setBusyId] = useState(null);

  async function handleAccept(req) {
    setBusyId(req.requestId);
    try {
      await onAccept(req.requestId);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(req) {
    setBusyId(req.requestId);
    try {
      await onDecline(req.requestId);
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(req) {
    setBusyId(req.requestId);
    try {
      await onCancel(req.requestId);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display font-semibold text-xl text-nova-text">Requests</h1>
        <p className="text-xs text-nova-textFaint mt-0.5">
          {incoming.length} incoming · {outgoing.length} sent
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <Section title="Incoming">
          {incoming.length === 0 && <EmptyNote text="No pending requests right now." />}
          {incoming.map((req) => (
            <div key={req.requestId} className="flex items-center gap-3 p-3 rounded-nova-sm bg-nova-card border border-nova-border mb-2 animate-slide-up">
              <Avatar user={req.user} size={44} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[14px] text-nova-text truncate">{req.user.displayName}</div>
                <div className="text-xs text-nova-textFaint truncate">@{req.user.username}</div>
              </div>
              <button
                onClick={() => handleAccept(req)}
                disabled={busyId === req.requestId}
                className="shrink-0 w-8 h-8 rounded-full bg-nova-success/15 text-nova-success hover:bg-nova-success/25 transition-colors flex items-center justify-center disabled:opacity-50"
                title="Accept"
              >
                <CheckIcon />
              </button>
              <button
                onClick={() => handleDecline(req)}
                disabled={busyId === req.requestId}
                className="shrink-0 w-8 h-8 rounded-full bg-nova-danger/15 text-nova-danger hover:bg-nova-danger/25 transition-colors flex items-center justify-center disabled:opacity-50"
                title="Decline"
              >
                <XIcon />
              </button>
            </div>
          ))}
        </Section>

        <Section title="Sent">
          {outgoing.length === 0 && <EmptyNote text="No outgoing requests." />}
          {outgoing.map((req) => (
            <div key={req.requestId} className="flex items-center gap-3 p-3 rounded-nova-sm bg-nova-card border border-nova-border mb-2">
              {req.user ? (
                <>
                  <Avatar user={req.user} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[14px] text-nova-text truncate">{req.user.displayName}</div>
                    <div className="text-xs text-nova-textFaint">Waiting for response…</div>
                  </div>
                </>
              ) : (
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[14px] text-nova-text truncate">{req.pendingQuery}</div>
                  <div className="text-xs text-nova-textFaint">Waiting for response…</div>
                </div>
              )}
              <button
                onClick={() => handleCancel(req)}
                disabled={busyId === req.requestId}
                className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-nova-elevated text-nova-textMuted hover:text-nova-danger hover:bg-nova-danger/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-[11px] uppercase tracking-wider text-nova-textFaint font-semibold mb-2.5">{title}</h3>
      {children}
    </div>
  );
}

function EmptyNote({ text }) {
  return <p className="text-sm text-nova-textMuted py-3">{text}</p>;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
