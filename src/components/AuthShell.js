"use client";

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-nova-bg flex">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden flex-col justify-between p-12 border-r border-nova-border">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(79,156,249,0.16), transparent 50%), radial-gradient(circle at 80% 75%, rgba(255,180,84,0.10), transparent 45%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-nova-primary flex items-center justify-center shadow-glow">
            <span className="text-white font-display font-bold text-base">N</span>
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Nova</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display font-semibold text-[2.6rem] leading-[1.08] tracking-tight text-nova-text">
            Connect beyond
            <br />
            <span className="text-nova-primary">numbers.</span>
          </h1>
          <p className="mt-5 text-nova-textMuted text-[15px] leading-relaxed">
            Every Nova account gets a unique 10-digit ID — no phone number required.
            Find friends, message instantly, and keep your number to yourself.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 px-4 py-3 rounded-nova-sm glass border border-nova-border">
            <span className="text-[11px] uppercase tracking-wider text-nova-textFaint font-medium">
              Nova ID
            </span>
            <span className="font-mono text-sm text-nova-amber tracking-[0.15em]">
              4 8 2 1 0 9 3 5 6 7
            </span>
          </div>
        </div>

        <p className="relative text-xs text-nova-textFaint">
          Real-time messaging, friend requests, reactions, and replies — built for speed.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  );
}
