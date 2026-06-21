"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import NovaIdBadge from "./NovaIdBadge";
import api, { extractErrorMessage } from "@/lib/api";

export default function AddFriendPanel({ currentUser, onSendRequest, outgoingRequests }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const outgoingIds = new Set(outgoingRequests.map((r) => r.user?.id).filter(Boolean));

  async function handleSearch(e) {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    setSearched(true);
    setFeedback(null);
    try {
      const { data } = await api.get("/users/search", { params: { q } });
      setResults(data.users);
    } catch (err) {
      setFeedback({ type: "error", text: extractErrorMessage(err) });
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(user) {
    setSendingId(user.id);
    setFeedback(null);
    try {
      const res = await onSendRequest(user.username);
      if (res.status === "ACCEPTED") {
        setFeedback({ type: "success", text: `You and ${user.displayName} are now friends!` });
      } else {
        setFeedback({ type: "success", text: `Friend request sent to ${user.displayName}.` });
      }
    } catch (err) {
      setFeedback({ type: "error", text: extractErrorMessage(err) });
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-4">
        <h1 className="font-display font-semibold text-xl text-nova-text">Add a friend</h1>
        <p className="text-xs text-nova-textFaint mt-0.5">Search by username or 10-digit Nova ID</p>

        <form onSubmit={handleSearch} className="mt-3 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="username or 10-digit ID"
            className="flex-1 bg-nova-card border border-nova-border rounded-nova-sm px-3.5 py-2.5 text-sm text-nova-text placeholder:text-nova-textFaint outline-none focus:border-nova-primary focus:ring-2 focus:ring-nova-primary/15 transition-colors"
          />
          <button
            type="submit"
            disabled={query.trim().length < 2}
            className="px-4 rounded-nova-sm bg-nova-primary text-white font-semibold text-sm disabled:opacity-50 hover:bg-nova-primaryHover transition-colors"
          >
            Search
          </button>
        </form>

        {feedback && (
          <p
            className={`mt-3 text-sm px-3 py-2 rounded-nova-sm border animate-slide-up ${
              feedback.type === "success"
                ? "text-nova-success bg-nova-success/10 border-nova-success/20"
                : "text-nova-danger bg-nova-danger/10 border-nova-danger/20"
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {searching && (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton h-16 rounded-nova-sm" />
            ))}
          </div>
        )}

        {!searching && searched && results.length === 0 && (
          <p className="text-sm text-nova-textMuted text-center py-8">No one found matching &quot;{query}&quot;</p>
        )}

        {!searching &&
          results.map((user) => {
            const isPending = outgoingIds.has(user.id);
            return (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-nova-sm bg-nova-card border border-nova-border mb-2">
                <Avatar user={user} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[14px] text-nova-text truncate">{user.displayName}</div>
                  <div className="text-xs text-nova-textFaint truncate">@{user.username}</div>
                </div>
                <button
                  onClick={() => handleAdd(user)}
                  disabled={isPending || sendingId === user.id}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-nova-primary text-white hover:bg-nova-primaryHover disabled:opacity-50 disabled:bg-nova-elevated disabled:text-nova-textMuted transition-colors"
                >
                  {isPending ? "Pending" : sendingId === user.id ? "Sending…" : "Add"}
                </button>
              </div>
            );
          })}

        {!searched && (
          <div className="mt-2">
            <h3 className="text-[11px] uppercase tracking-wider text-nova-textFaint font-semibold mb-2.5">
              Your Nova ID
            </h3>
            <NovaIdBadge novaId={currentUser.novaId} />
            <p className="text-xs text-nova-textFaint mt-3 leading-relaxed">
              Share this ID with people you want to connect with — they can use it instead of your
              username to send a friend request.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
