"use client";

import { ConfigPage } from "@/components/config/config-page";
import { TRADING_MODELS_COLUMNS } from "@/lib/constants";

export default function ModelsPage() {
  return (
    <ConfigPage
      title="Trading Models"
      description="trading_models — ML models for prediction"
      table="trading_models"
      columns={TRADING_MODELS_COLUMNS}
      labelField="name"
    />
  );
}
