"use client";

import { ConfigPage } from "@/components/config/config-page";
import { CONNECTOR_CONFIG_COLUMNS } from "@/lib/constants";

export default function ConnectorsPage() {
  return (
    <ConfigPage
      title="Connectors"
      description="connector_config — Broker connector instances"
      table="connector_config"
      columns={CONNECTOR_CONFIG_COLUMNS}
      labelField="instance_id"
    />
  );
}
