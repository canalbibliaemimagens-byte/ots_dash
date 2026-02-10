"use client";

import { ConfigPage } from "@/components/config/config-page";
import { TUNNEL_CONFIG_COLUMNS } from "@/lib/constants";

export default function TunnelsPage() {
  return (
    <ConfigPage
      title="Tunnels"
      description="tunnel_config — Cloudflare tunnel URLs"
      table="tunnel_config"
      columns={TUNNEL_CONFIG_COLUMNS}
      labelField="service_name"
    />
  );
}
