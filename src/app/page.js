"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/chat" : "/login");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-nova-bg flex items-center justify-center">
      <div className="w-9 h-9 rounded-xl bg-nova-primary/20 border border-nova-primary/30 flex items-center justify-center animate-pulse">
        <span className="text-nova-primary font-display font-bold text-sm">N</span>
      </div>
    </div>
  );
}
