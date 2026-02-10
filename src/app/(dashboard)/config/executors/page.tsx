"use client";

import { ConfigPage } from "@/components/config/config-page";
import { EXECUTOR_CONFIG_COLUMNS } from "@/lib/constants";

export default function ExecutorsPage() {
  return (
    <ConfigPage
      title="Executors"
      description="executor_config — Executor instances"
      table="executor_config"
      columns={EXECUTOR_CONFIG_COLUMNS}
      labelField="instance_id"
    />
  );
}
