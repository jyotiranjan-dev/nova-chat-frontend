"use client";

import { useState } from "react";

export default function NovaIdBadge({ novaId, size = "md" }) {
  const [copied, setCopied] = useState(false);
  const grouped = novaId.match(/.{1,2}/g)?.join(" ") || novaId;

  async function copy() {
    try {
      await navigator.clipboard.writeText(novaId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable, ignore */
    }
  }

  const padding = size === "sm" ? "px-3 py-2" : "px-4 py-3";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <button
      onClick={copy}
      className={`group relative w-full rounded-nova-sm overflow-hidden text-left ${padding} transition-transform active:scale-[0.99]`}
      title="Copy Nova ID"
    >
      <div className="absolute inset-0 nova-id-pill opacity-25" />
      <div className="absolute inset-[1px] rounded-[11px] bg-nova-card" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-nova-textFaint font-medium mb-0.5">
            Nova ID
          </div>
          <div className={`font-mono ${textSize} text-nova-amber tracking-[0.12em] truncate`}>{grouped}</div>
        </div>
        <span
          className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
            copied ? "bg-nova-success/15 text-nova-success" : "bg-nova-elevated text-nova-textMuted group-hover:text-nova-text"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </span>
      </div>
    </button>
  );
}
