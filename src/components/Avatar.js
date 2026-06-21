"use client";

const PALETTE = ["#4F9CF9", "#34D399", "#FFB454", "#F87171", "#A78BFA", "#F472B6", "#22D3EE"];

function colorFor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

const SIZE_CLASSES = {
  28: "w-7 h-7 text-[10px]",
  32: "w-8 h-8 text-[11px]",
  36: "w-9 h-9 text-xs",
  40: "w-10 h-10 text-xs",
  44: "w-11 h-11 text-sm",
  48: "w-12 h-12 text-sm",
  64: "w-16 h-16 text-lg",
  88: "w-[88px] h-[88px] text-2xl",
};

export default function Avatar({ user, size = 40, showPresence = false, ring = false }) {
  if (!user) return null;
  const initials = (user.displayName || user.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES[40];
  const isOnline = user.status === "ONLINE" || user.status === "online";

  return (
    <div className={`relative shrink-0 ${ring ? "p-[2px] rounded-full bg-gradient-to-tr from-nova-primary to-nova-amber" : ""}`}>
      <div className={`relative rounded-full overflow-hidden flex items-center justify-center font-display font-semibold text-white ${sizeClass} ${ring ? "ring-2 ring-nova-bg" : ""}`}
        style={{ background: user.avatarUrl ? undefined : colorFor(user.username || user.id || "?") }}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {showPresence && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-nova-panel ${
            size >= 44 ? "w-3 h-3" : "w-2.5 h-2.5"
          }`}
          style={{ background: isOnline ? "#34D399" : "#5B6478" }}
        />
      )}
    </div>
  );
}
