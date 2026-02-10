export const ROLE_COLORS: Record<string, string> = {
  hub: "#f59e0b",
  preditor: "#8b5cf6",
  executor: "#10b981",
  connector: "#ef4444",
  dashboard: "#ec4899",
};

export const ROLE_BG_CLASSES: Record<string, string> = {
  hub: "bg-hub/10 text-hub",
  preditor: "bg-preditor/10 text-preditor",
  executor: "bg-executor/10 text-executor",
  connector: "bg-connector/10 text-connector",
  dashboard: "bg-dashboard/10 text-dashboard",
};

export type ColumnType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "array"
  | "time"
  | "password"
  | "textarea"
  | "readonly";

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
  required?: boolean;
  defaultValue?: unknown;
  options?: { value: string; label: string }[];
  hideInTable?: boolean;
  hideInForm?: boolean;
  width?: string;
}

// ots_config columns
export const OTS_CONFIG_COLUMNS: ColumnDef[] = [
  { key: "key", label: "Key", type: "text", required: true },
  { key: "value", label: "Value", type: "text", required: true },
  { key: "description", label: "Description", type: "text" },
];

// trading_symbols columns
export const TRADING_SYMBOLS_COLUMNS: ColumnDef[] = [
  { key: "symbol", label: "Symbol", type: "text", required: true },
  { key: "enabled", label: "Enabled", type: "boolean", defaultValue: true },
  { key: "lot_weak", label: "Lot Weak", type: "number", defaultValue: 0.01 },
  { key: "lot_moderate", label: "Lot Moderate", type: "number", defaultValue: 0.03 },
  { key: "lot_strong", label: "Lot Strong", type: "number", defaultValue: 0.05 },
  { key: "sl_usd", label: "SL (USD)", type: "number", defaultValue: 10.0 },
  { key: "tp_usd", label: "TP (USD)", type: "number", defaultValue: 0.0 },
  { key: "max_spread_pips", label: "Max Spread", type: "number", defaultValue: 2.0 },
  {
    key: "category",
    label: "Category",
    type: "select",
    defaultValue: "forex",
    options: [
      { value: "forex", label: "Forex" },
      { value: "indices", label: "Indices" },
      { value: "commodities", label: "Commodities" },
      { value: "crypto", label: "Crypto" },
    ],
  },
  { key: "description", label: "Description", type: "textarea", hideInTable: true },
];

// trading_models columns
export const TRADING_MODELS_COLUMNS: ColumnDef[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "symbol", label: "Symbol", type: "text", required: true },
  {
    key: "timeframe",
    label: "Timeframe",
    type: "select",
    required: true,
    options: [
      { value: "M1", label: "M1" },
      { value: "M5", label: "M5" },
      { value: "M15", label: "M15" },
      { value: "M30", label: "M30" },
      { value: "H1", label: "H1" },
      { value: "H4", label: "H4" },
      { value: "D1", label: "D1" },
    ],
  },
  { key: "version", label: "Version", type: "text", defaultValue: "1.0" },
  { key: "format_version", label: "Format Ver.", type: "text", defaultValue: "2.0" },
  { key: "storage_bucket", label: "Bucket", type: "text", defaultValue: "oracle_models", hideInTable: true },
  { key: "storage_path", label: "Storage Path", type: "text", required: true, hideInTable: true },
  { key: "model_path", label: "Model Path", type: "text", hideInTable: true },
  { key: "min_bars", label: "Min Bars", type: "number", defaultValue: 350 },
  { key: "warmup_bars", label: "Warmup Bars", type: "number", defaultValue: 1000 },
  { key: "accuracy", label: "Accuracy %", type: "number" },
  { key: "sharpe_ratio", label: "Sharpe", type: "number" },
  { key: "active", label: "Active", type: "boolean", defaultValue: true },
  { key: "description", label: "Description", type: "textarea", hideInTable: true },
];

// risk_config columns
export const RISK_CONFIG_COLUMNS: ColumnDef[] = [
  { key: "profile_name", label: "Profile", type: "text", required: true },
  { key: "max_drawdown_pct", label: "Max DD %", type: "number", defaultValue: 10.0 },
  { key: "max_daily_loss_usd", label: "Max Daily Loss", type: "number", defaultValue: 100.0 },
  { key: "max_consecutive_losses", label: "Max Consec. Losses", type: "number", defaultValue: 5 },
  { key: "pause_after_losses", label: "Pause After Losses", type: "boolean", defaultValue: true },
  { key: "max_positions", label: "Max Positions", type: "number", defaultValue: 5 },
  { key: "max_exposure_per_symbol_pct", label: "Max Exposure %", type: "number", defaultValue: 20.0 },
  { key: "tp_general_usd", label: "TP General (USD)", type: "number", defaultValue: 0.0 },
  { key: "trading_hours_start", label: "Trading Start", type: "time", hideInTable: true },
  { key: "trading_hours_end", label: "Trading End", type: "time", hideInTable: true },
  { key: "active", label: "Active", type: "boolean", defaultValue: true },
];

// connector_config columns
export const CONNECTOR_CONFIG_COLUMNS: ColumnDef[] = [
  { key: "instance_id", label: "Instance ID", type: "text", required: true },
  {
    key: "connector_type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { value: "ctrader", label: "cTrader" },
      { value: "mt5", label: "MetaTrader 5" },
    ],
  },
  {
    key: "environment",
    label: "Environment",
    type: "select",
    defaultValue: "demo",
    options: [
      { value: "demo", label: "Demo" },
      { value: "live", label: "Live" },
    ],
  },
  { key: "client_id", label: "Client ID", type: "password", hideInTable: true },
  { key: "client_secret", label: "Client Secret", type: "password", hideInTable: true },
  { key: "access_token", label: "Access Token", type: "password", hideInTable: true },
  { key: "account_id", label: "Account ID", type: "text" },
  { key: "symbols", label: "Symbols", type: "array" },
  { key: "timeframe", label: "Timeframe", type: "select", defaultValue: "M15", options: [
    { value: "M1", label: "M1" },
    { value: "M5", label: "M5" },
    { value: "M15", label: "M15" },
    { value: "H1", label: "H1" },
  ]},
  { key: "warmup_bars", label: "Warmup Bars", type: "number", defaultValue: 1000, hideInTable: true },
  { key: "account_update_interval", label: "Update Interval (s)", type: "number", defaultValue: 10, hideInTable: true },
  { key: "enabled", label: "Enabled", type: "boolean", defaultValue: true },
];

// executor_config columns
export const EXECUTOR_CONFIG_COLUMNS: ColumnDef[] = [
  { key: "instance_id", label: "Instance ID", type: "text", required: true },
  { key: "risk_profile", label: "Risk Profile", type: "text", defaultValue: "default" },
  { key: "enabled_symbols", label: "Symbols", type: "array" },
  { key: "max_orders_per_minute", label: "Max Orders/Min", type: "number", defaultValue: 10 },
  { key: "enabled", label: "Enabled", type: "boolean", defaultValue: true },
  { key: "paused", label: "Paused", type: "boolean", defaultValue: false },
];

// preditor_config columns
export const PREDITOR_CONFIG_COLUMNS: ColumnDef[] = [
  { key: "instance_id", label: "Instance ID", type: "text", required: true },
  { key: "model_id", label: "Model", type: "text" },
  { key: "min_bars", label: "Min Bars", type: "number", defaultValue: 350 },
  { key: "warmup_bars", label: "Warmup Bars", type: "number", defaultValue: 1000 },
  { key: "enabled", label: "Enabled", type: "boolean", defaultValue: true },
];

// tunnel_config columns
export const TUNNEL_CONFIG_COLUMNS: ColumnDef[] = [
  { key: "service_name", label: "Service", type: "text", required: true },
  { key: "ws_url", label: "WS URL", type: "text" },
  { key: "wss_url", label: "WSS URL", type: "text" },
];

// Navigation items
export const NAV_ITEMS = [
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
