"use client";

import { ConfigPage } from "@/components/config/config-page";
import { RISK_CONFIG_COLUMNS } from "@/lib/constants";

export default function RiskPage() {
  return (
    <ConfigPage
      title="Risk Profiles"
      description="risk_config — Risk management configuration"
      table="risk_config"
      columns={RISK_CONFIG_COLUMNS}
      labelField="profile_name"
    />
  );
}
