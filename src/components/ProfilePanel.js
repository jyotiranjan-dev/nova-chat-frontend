"use client";

import { useState, useRef } from "react";
import Avatar from "./Avatar";
import NovaIdBadge from "./NovaIdBadge";
import api, { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePanel({ currentUser, onUpdated }) {
  const { logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  async function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be under 8MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await api.patch("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ avatarUrl: data.user.avatarUrl });
      onUpdated?.(data.user);
    } catch (err) {
      alert(extractErrorMessage(err, "Failed to upload avatar"));
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  }

  async function handleSaveProfile() {
    setError("");
    if (!displayName.trim()) {
      setError("Display name can't be empty");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", { displayName: displayName.trim(), bio: bio.trim() });
      updateUser({ displayName: data.user.displayName, bio: data.user.bio });
      onUpdated?.(data.user);
      setEditing(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setPwError("");
    setPwSuccess(false);
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    try {
      await api.patch("/users/me/password", { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setTimeout(() => {
        setChangingPassword(false);
        setPwSuccess(false);
      }, 1500);
    } catch (err) {
      setPwError(extractErrorMessage(err));
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-display font-semibold text-xl text-nova-text mb-6">Profile</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <Avatar user={currentUser} size={88} ring />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-nova-primary text-white flex items-center justify-center border-2 border-nova-panel hover:bg-nova-primaryHover transition-colors"
              title="Change photo"
            >
              {avatarUploading ? <Spinner /> : <CameraIcon />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
          </div>
          {!editing && (
            <>
              <h2 className="mt-3 font-display font-semibold text-lg text-nova-text">{currentUser.displayName}</h2>
              <p className="text-sm text-nova-textFaint">@{currentUser.username}</p>
            </>
          )}
        </div>

        <div className="mb-5">
          <NovaIdBadge novaId={currentUser.novaId} />
        </div>

        {editing ? (
          <div className="space-y-3.5">
            <Field label="Display name">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="nova-input"
                maxLength={40}
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={160}
                className="nova-input resize-none"
                placeholder="Tell people a bit about yourself…"
              />
              <span className="text-[11px] text-nova-textFaint self-end">{bio.length}/160</span>
            </Field>
            {error && <p className="text-sm text-nova-danger">{error}</p>}
            <div className="flex gap-2">
              <button onClick={handleSaveProfile} disabled={saving} className="nova-btn-primary">
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDisplayName(currentUser.displayName);
                  setBio(currentUser.bio || "");
                  setError("");
                }}
                className="nova-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <InfoBlock label="Bio" value={currentUser.bio || "No bio yet"} />
            <InfoBlock label="Joined" value={new Date(currentUser.createdAt).toLocaleDateString([], { month: "long", year: "numeric" })} />
            <button onClick={() => setEditing(true)} className="nova-btn-secondary mt-2">
              Edit profile
            </button>
          </div>
        )}

        {/* Password */}
        <div className="mt-6 pt-5 border-t border-nova-border">
          {!changingPassword ? (
            <button
              onClick={() => setChangingPassword(true)}
              className="w-full flex items-center justify-between text-sm font-medium text-nova-textSoft hover:text-nova-text py-1"
            >
              Change password
              <ChevronIcon />
            </button>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-nova-text">Change password</h3>
              <Field label="Current password">
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="nova-input" />
              </Field>
              <Field label="New password">
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="nova-input" />
              </Field>
              {pwError && <p className="text-sm text-nova-danger">{pwError}</p>}
              {pwSuccess && <p className="text-sm text-nova-success">Password updated!</p>}
              <div className="flex gap-2">
                <button onClick={handleChangePassword} disabled={pwSaving} className="nova-btn-primary">
                  {pwSaving ? "Updating…" : "Update password"}
                </button>
                <button
                  onClick={() => {
                    setChangingPassword(false);
                    setCurrentPw("");
                    setNewPw("");
                    setPwError("");
                  }}
                  className="nova-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (confirm("Log out of Nova?")) logout();
          }}
          className="w-full mt-6 text-sm font-semibold text-nova-danger hover:bg-nova-danger/10 py-2.5 rounded-nova-sm transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-nova-textSoft">{label}</span>
      {children}
    </label>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-nova-textFaint font-semibold mb-1">{label}</div>
      <div className="text-sm text-nova-textSoft">{value}</div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
