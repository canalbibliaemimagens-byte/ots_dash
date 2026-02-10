"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Settings,
  Server,
  TrendingUp,
  Brain,
  Shield,
  Plug,
  Zap,
  Eye,
  Globe,
  Terminal,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Radio,
  Settings,
  Server,
  TrendingUp,
  Brain,
  Shield,
  Plug,
  Zap,
  Eye,
  Globe,
  Terminal,
};

interface NavItem {
  href?: string;
  label: string;
  icon: string;
  children?: { href: string; label: string; icon: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: "LayoutDashboard" },
  { href: "/live", label: "Live", icon: "Radio" },
  {
    label: "Configuration",
    icon: "Settings",
    children: [
      { href: "/config/hub", label: "Hub Config", icon: "Server" },
      { href: "/config/symbols", label: "Symbols", icon: "TrendingUp" },
      { href: "/config/models", label: "Models", icon: "Brain" },
      { href: "/config/risk", label: "Risk", icon: "Shield" },
      { href: "/config/connectors", label: "Connectors", icon: "Plug" },
      { href: "/config/executors", label: "Executors", icon: "Zap" },
      { href: "/config/preditors", label: "Preditors", icon: "Eye" },
      { href: "/config/tunnels", label: "Tunnels", icon: "Globe" },
    ],
  },
  { href: "/commands", label: "Commands", icon: "Terminal" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [configOpen, setConfigOpen] = useState(
    pathname.startsWith("/config")
  );

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-bold bg-gradient-to-r from-hub to-preditor bg-clip-text text-transparent">
          Oracle Trader v3
        </h1>
        <p className="text-xs font-mono text-foreground-dim">Dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setConfigOpen(!configOpen)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm",
                    "hover:bg-sidebar-accent transition-colors",
                    pathname.startsWith("/config")
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <NavIcon name={item.icon} className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      configOpen && "rotate-180"
                    )}
                  />
                </button>
                {configOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        href={child.href}
                        icon={child.icon}
                        label={child.label}
                        active={pathname === child.href}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.href}
              href={item.href!}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          );
        })}
      </nav>
    </aside>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-primary font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <NavIcon name={icon} className="h-4 w-4" />
      {label}
    </Link>
  );
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
