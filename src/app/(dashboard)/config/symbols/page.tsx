"use client";

import { ConfigPage } from "@/components/config/config-page";
import { TRADING_SYMBOLS_COLUMNS } from "@/lib/constants";

export default function SymbolsPage() {
  return (
    <ConfigPage
      title="Trading Symbols"
      description="trading_symbols — Per-symbol trading configuration"
      table="trading_symbols"
      columns={TRADING_SYMBOLS_COLUMNS}
      labelField="symbol"
    />
  );
}
