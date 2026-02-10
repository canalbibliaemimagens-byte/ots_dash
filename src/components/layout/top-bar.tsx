"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

export function TopBar({ title }: { title?: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4">
      <MobileNav />

      {title && (
        <h2 className="text-sm font-medium text-foreground-dim hidden md:block">
          {title}
        </h2>
      )}

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5 mr-2">
          <div className="h-2 w-2 rounded-full bg-foreground-dim" />
          <span className="text-xs font-mono text-foreground-dim hidden sm:inline">
            offline
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
