"use client";

import Link from "next/link";
import {
  Server,
  TrendingUp,
  Brain,
  Shield,
  Plug,
  Zap,
  Eye,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";

const CONFIG_CARDS = [
  { href: "/config/hub", label: "Hub Config", icon: Server, table: "ots_config", color: "text-hub" },
  { href: "/config/symbols", label: "Symbols", icon: TrendingUp, table: "trading_symbols", color: "text-hub" },
  { href: "/config/models", label: "Models", icon: Brain, table: "trading_models", color: "text-preditor" },
  { href: "/config/risk", label: "Risk Profiles", icon: Shield, table: "risk_config", color: "text-executor" },
  { href: "/config/connectors", label: "Connectors", icon: Plug, table: "connector_config", color: "text-connector" },
  { href: "/config/executors", label: "Executors", icon: Zap, table: "executor_config", color: "text-executor" },
  { href: "/config/preditors", label: "Preditors", icon: Eye, table: "preditor_config", color: "text-preditor" },
  { href: "/config/tunnels", label: "Tunnels", icon: Globe, table: "tunnel_config", color: "text-dashboard" },
];

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Oracle Trader v3 — System Dashboard"
      />

      {/* Hub Status placeholder */}
      <Card className="mb-6 border-hub/30">
        <CardContent className="py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-3 w-3 rounded-full bg-foreground-dim" />
            <span className="font-mono text-sm text-foreground-dim">
              Hub Status — Connect in Live tab
            </span>
          </div>
          <Link
            href="/live"
            className="text-sm text-hub hover:underline"
          >
            Go to Live Monitoring
          </Link>
        </CardContent>
      </Card>

      {/* Config Cards */}
      <h2 className="text-lg font-semibold mb-4">Configuration Tables</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONFIG_CARDS.map((card) => (
          <ConfigCard key={card.href} {...card} />
        ))}
      </div>
    </>
  );
}

function ConfigCard({
  href,
  label,
  icon: Icon,
  table,
  color,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  table: string;
  color: string;
}) {
  const { data, loading } = useSupabaseQuery<{ id: string }>(table);

  return (
    <Link href={href}>
      <Card className="hover:border-foreground-dim transition-colors cursor-pointer group">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className={`${color} opacity-80 group-hover:opacity-100 transition-opacity`}>
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold font-mono">
            {loading ? "..." : data.length}
          </span>
          <span className="text-xs text-foreground-dim ml-2">records</span>
        </CardContent>
      </Card>
    </Link>
  );
}
