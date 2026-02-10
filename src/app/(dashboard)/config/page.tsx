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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

const TABLES = [
  { href: "/config/hub", label: "Hub Config", icon: Server, desc: "Key-value settings for OTS Hub", color: "border-t-hub" },
  { href: "/config/symbols", label: "Trading Symbols", icon: TrendingUp, desc: "Symbol configuration (lots, SL/TP, spread)", color: "border-t-hub" },
  { href: "/config/models", label: "Trading Models", icon: Brain, desc: "ML models (path, metrics, versioning)", color: "border-t-preditor" },
  { href: "/config/risk", label: "Risk Profiles", icon: Shield, desc: "Risk management (drawdown, limits, TP)", color: "border-t-executor" },
  { href: "/config/connectors", label: "Connectors", icon: Plug, desc: "Broker connector instances (cTrader, MT5)", color: "border-t-connector" },
  { href: "/config/executors", label: "Executors", icon: Zap, desc: "Executor instances and risk profiles", color: "border-t-executor" },
  { href: "/config/preditors", label: "Preditors", icon: Eye, desc: "Preditor instances linked to models", color: "border-t-preditor" },
  { href: "/config/tunnels", label: "Tunnels", icon: Globe, desc: "Cloudflare tunnel URLs", color: "border-t-dashboard" },
];

export default function ConfigOverviewPage() {
  return (
    <>
      <PageHeader
        title="Configuration"
        description="Manage all system configuration tables"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TABLES.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className={`hover:border-foreground-dim transition-colors cursor-pointer border-t-2 ${t.color}`}>
              <CardHeader className="flex flex-row items-center gap-3">
                <t.icon className="h-5 w-5 text-foreground-dim" />
                <div>
                  <CardTitle className="text-sm">{t.label}</CardTitle>
                  <CardDescription className="text-xs">{t.desc}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-hub font-mono">Open &rarr;</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
