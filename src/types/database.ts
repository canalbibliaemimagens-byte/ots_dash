export interface OtsConfig {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
  created_at: string;
}

export interface TradingSymbol {
  id: string;
  symbol: string;
  enabled: boolean;
  lot_weak: number;
  lot_moderate: number;
  lot_strong: number;
  sl_usd: number;
  tp_usd: number;
  max_spread_pips: number;
  category: string;
  description: string | null;
  updated_at: string;
  created_at: string;
}

export interface TradingModel {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  version: string;
  storage_bucket: string;
  storage_path: string;
  model_path?: string;
  format_version?: string;
  min_bars: number;
  warmup_bars: number;
  training_date: string | null;
  accuracy: number | null;
  sharpe_ratio: number | null;
  description: string | null;
  active: boolean;
  updated_at: string;
  created_at: string;
}

export interface RiskConfig {
  id: string;
  profile_name: string;
  max_drawdown_pct: number;
  max_daily_loss_usd: number;
  max_consecutive_losses: number;
  pause_after_losses: boolean;
  max_positions: number;
  max_exposure_per_symbol_pct: number;
  tp_general_usd: number;
  trading_hours_start: string | null;
  trading_hours_end: string | null;
  active: boolean;
  updated_at: string;
  created_at: string;
}

export interface ConnectorConfig {
  id: string;
  connector_type: string;
  instance_id: string;
  client_id: string | null;
  client_secret: string | null;
  access_token: string | null;
  account_id: string | null;
  environment: string;
  symbols: string[];
  timeframe: string;
  warmup_bars: number;
  account_update_interval: number;
  enabled: boolean;
  updated_at: string;
  created_at: string;
}

export interface ExecutorConfig {
  id: string;
  instance_id: string;
  risk_profile: string;
  enabled_symbols: string[];
  max_orders_per_minute: number;
  enabled: boolean;
  paused: boolean;
  updated_at: string;
  created_at: string;
}

export interface PreditorConfig {
  id: string;
  instance_id: string;
  model_id: string | null;
  min_bars: number;
  warmup_bars: number;
  enabled: boolean;
  updated_at: string;
  created_at: string;
  // JOIN data
  trading_models?: TradingModel | null;
}

export interface TunnelConfig {
  id: number;
  service_name: string;
  ws_url: string | null;
  wss_url: string | null;
  updated_at: string;
}

// Table name to type mapping
export type TableName =
  | "ots_config"
  | "trading_symbols"
  | "trading_models"
  | "risk_config"
  | "connector_config"
  | "executor_config"
  | "preditor_config"
  | "tunnel_config";
