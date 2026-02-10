"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/live", label: "Live" },
  { href: "/config/hub", label: "Hub Config" },
  { href: "/config/symbols", label: "Symbols" },
  { href: "/config/models", label: "Models" },
  { href: "/config/risk", label: "Risk" },
  { href: "/config/connectors", label: "Connectors" },
  { href: "/config/executors", label: "Executors" },
  { href: "/config/preditors", label: "Preditors" },
  { href: "/config/tunnels", label: "Tunnels" },
  { href: "/commands", label: "Commands" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar border-sidebar-border p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-lg font-bold bg-gradient-to-r from-hub to-preditor bg-clip-text text-transparent">
            Oracle Trader v3
          </h1>
        </div>
        <nav className="p-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md text-sm transition-colors",
                pathname === link.href
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
