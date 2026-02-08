import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const HubContext = createContext(null);

// Supabase config for WS URL discovery
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://erinxuykijsydorlgjgy.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';
const HUB_TOKEN = import.meta.env.VITE_HUB_TOKEN || 'dashboard-token';
const FALLBACK_WS_URL = import.meta.env.VITE_HUB_URL || 'ws://127.0.0.1:8000/ws/dashboard';

export const HubProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [systemState, setSystemState] = useState(null);
    const [symbolsState, setSymbolsState] = useState({});
    const [wsUrl, setWsUrl] = useState(null);
    const [connectionError, setConnectionError] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);

    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const pendingCommandsRef = useRef({});

    const RECONNECT_DELAY = 5000;

    // Fetch dynamic WS URL from Supabase tunnel_config
    const fetchWsUrl = async () => {
        if (!SUPABASE_KEY) return null;
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/tunnel_config?service_name=eq.ots-hub&select=ws_url,wss_url`,
                { headers: { 'apikey': SUPABASE_KEY } }
            );
            if (!response.ok) throw new Error('Supabase fetch failed');
            const data = await response.json();
            if (data && data.length > 0) {
                const isSecure = window.location.protocol === 'https:';
                const url = isSecure ? data[0].wss_url : data[0].ws_url;
                console.log(`[Hub] Got URL from Supabase: ${url}`);
                return url;
            }
        } catch (err) {
            console.warn('[Hub] Failed to fetch URL from Supabase:', err.message);
        }
        return null;
    };

    // Connect to Hub
    const connect = useCallback(async () => {
        let url = await fetchWsUrl();
        if (!url) {
            url = FALLBACK_WS_URL;
            console.log(`[Hub] Using fallback URL: ${url}`);
        }
        setWsUrl(url);
        setConnectionError(null);

        if (socketRef.current) {
            socketRef.current.close();
        }

        console.log(`[Hub] Connecting to ${url}...`);
        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('[Hub] Connected');
            setIsConnected(true);
            setConnectionError(null);

            // Auth handshake
            ws.send(JSON.stringify({
                type: 'auth',
                id: 'auth-dashboard',
                payload: {
                    token: HUB_TOKEN,
                    role: 'dashboard',
                    instance_id: 'dashboard-v2'
                }
            }));
        };

        ws.onclose = (event) => {
            console.log(`[Hub] Disconnected: ${event.code}`);
            setIsConnected(false);
            setIsAuthenticated(false);
            socketRef.current = null;

            // Auto reconnect
            reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
        };

        ws.onerror = (err) => {
            console.error('[Hub] Error:', err);
            setConnectionError('Connection failed');
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                handleMessage(msg);
            } catch (e) {
                console.error('[Hub] Parse error:', e);
            }
        };
    }, []);

    // Handle incoming messages
    const handleMessage = (msg) => {
        const { type, payload } = msg;

        // Auth response
        if (type === 'ack' && payload?.status === 'authenticated') {
            console.log('[Hub] Authenticated');
            setIsAuthenticated(true);
            // Request initial state and update context
            sendCommand('get_state')
                .then(state => {
                    console.log('[Hub] Initial state received:', state);
                    if (state) {
                        setSystemState(prev => ({
                            ...prev,
                            balance: state.balance || 0,
                            equity: state.equity || 0,
                            floating_pnl: state.floating_pnl || 0,
                            status: state.running ? 'RUNNING' : 'STOPPED',
                            // Analytics from paper trader
                            net_profit: state.net_profit || state.paper?.total_pnl || 0,
                            win_rate: state.win_rate || state.paper?.win_rate || 0,
                            total_trades: state.total_trades || state.paper?.total_trades || 0,
                            max_drawdown: state.max_drawdown || 0,
                            profit_factor: state.profit_factor || 0,
                            sharpe_ratio: state.sharpe_ratio || 0,
                            expectancy: state.expectancy || 0,
                            avg_win: state.avg_win || 0,
                            avg_loss: state.avg_loss || 0,
                            equity_curve: state.equity_curve || [],
                        }));

                        // Initialize symbolsState from preditor models
                        if (state.preditor?.models) {
                            setSymbolsState(prev => {
                                const next = { ...prev };
                                for (const symbol of state.preditor.models) {
                                    if (!next[symbol]) {
                                        next[symbol] = {
                                            position: null,
                                            last_signal: null,
                                            stats: {},
                                            hmm_state: null,
                                            action: 'WAIT',
                                        };
                                    }
                                    // Inject virtual position data if available
                                    if (state.preditor?.positions?.[symbol]) {
                                        const vp = state.preditor.positions[symbol];
                                        next[symbol] = {
                                            ...next[symbol],
                                            hmm_state: vp.hmm_state,
                                            last_signal: {
                                                direction: vp.direction,
                                                action: vp.direction_name === 'FLAT' ? 'WAIT' : vp.direction_name,
                                                virtual_pnl: vp.pnl,
                                            },
                                        };
                                    }
                                }
                                // Inject real positions
                                if (state.open_positions) {
                                    for (const pos of state.open_positions) {
                                        if (next[pos.symbol]) {
                                            next[pos.symbol] = {
                                                ...next[pos.symbol],
                                                position: pos,
                                            };
                                        }
                                    }
                                }
                                return next;
                            });
                        }
                    }
                })
                .catch(err => console.error('[Hub] Failed to get initial state:', err));
            return;
        }

        // Command response
        if (type === 'ack' && payload?.ref_id) {
            const { resolve } = pendingCommandsRef.current[payload.ref_id] || {};
            if (resolve) {
                resolve(payload.result || payload);
                delete pendingCommandsRef.current[payload.ref_id];
            }
            return;
        }

        // Error response
        if (type === 'error') {
            const errorMsg = payload?.message || 'Unknown error';
            console.error('[Hub] Received error:', errorMsg);

            if (payload?.ref_id) {
                // If it's a response to a command, reject the promise
                const { resolve, reject } = pendingCommandsRef.current[payload.ref_id] || {};
                if (reject) {
                    reject(new Error(errorMsg));
                    delete pendingCommandsRef.current[payload.ref_id];
                }
            }
            return;
        }

        // Telemetry broadcast (from bot via hub)
        if (type === 'telemetry') {
            setSystemState(prev => ({
                ...prev,
                balance: payload.balance,
                equity: payload.equity,
                floating_pnl: payload.floating_pnl,
                status: payload.status,
                open_positions: payload.open_positions || [],
                // Analytics metrics from paper trader
                net_profit: payload.net_profit ?? prev?.net_profit ?? 0,
                win_rate: payload.win_rate ?? prev?.win_rate ?? 0,
                total_trades: payload.total_trades ?? prev?.total_trades ?? 0,
                max_drawdown: payload.max_drawdown ?? prev?.max_drawdown ?? 0,
                profit_factor: payload.profit_factor ?? prev?.profit_factor ?? 0,
                sharpe_ratio: payload.sharpe_ratio ?? prev?.sharpe_ratio ?? 0,
                expectancy: payload.expectancy ?? prev?.expectancy ?? 0,
                avg_win: payload.avg_win ?? prev?.avg_win ?? 0,
                avg_loss: payload.avg_loss ?? prev?.avg_loss ?? 0,
                equity_curve: payload.equity_curve ?? prev?.equity_curve ?? [],
            }));

            // Update symbol states if positions included
            if (payload.open_positions) {
                setSymbolsState(prev => {
                    const next = { ...prev };
                    // Clear existing positions
                    for (const sym of Object.keys(next)) {
                        if (next[sym].position) {
                            next[sym] = { ...next[sym], position: null };
                        }
                    }
                    // Set current positions
                    for (const pos of payload.open_positions) {
                        if (!next[pos.symbol]) {
                            next[pos.symbol] = { position: null, last_signal: null, stats: {} };
                        }
                        next[pos.symbol] = {
                            ...next[pos.symbol],
                            position: pos
                        };
                    }
                    return next;
                });
            }
            return;
        }

        // Signal broadcast
        if (type === 'signal') {
            const sigPayload = msg.payload || payload;
            const { symbol, action, direction, hmm_state, intensity, virtual_pnl } = sigPayload;
            setSymbolsState(prev => {
                const existing = prev[symbol] || { position: null, last_signal: null, stats: {} };
                return {
                    ...prev,
                    [symbol]: {
                        ...existing,
                        last_signal: { action, direction, hmm_state, intensity, virtual_pnl, time: Date.now() }
                    }
                };
            });
            return;
        }
    };

    // Send command to Hub → Bot
    const sendCommand = useCallback((action, params = {}) => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
                reject(new Error('Not connected'));
                return;
            }

            const cmdId = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            pendingCommandsRef.current[cmdId] = { resolve, reject };

            // Timeout after 10s
            setTimeout(() => {
                if (pendingCommandsRef.current[cmdId]) {
                    delete pendingCommandsRef.current[cmdId];
                    reject(new Error('Command timeout'));
                }
            }, 10000);

            socketRef.current.send(JSON.stringify({
                type: 'command',
                id: cmdId,
                payload: { action, params }
            }));
        });
    }, []);

    // Convenience methods
    const pause = () => sendCommand('pause');
    const resume = () => sendCommand('resume');
    const closeAll = () => sendCommand('close_all');
    const closePosition = (symbol) => sendCommand('close_position', { symbol });
    const getState = () => sendCommand('get_state');
    const listModels = () => sendCommand('list_models');
    const getAvailableModels = () => sendCommand('get_available_models');
    const loadModel = (path) => sendCommand('load_model', { path });
    const unloadModel = (symbol) => sendCommand('unload_model', { symbol });
    const getSymbolConfig = (symbol) => sendCommand('get_symbol_config', { symbol });
    const setSymbolConfig = (symbol, config) => sendCommand('set_symbol_config', { symbol, config });
    const getGeneralConfig = () => sendCommand('get_general_config');
    const setGeneralConfig = (params) => sendCommand('set_general_config', params);

    // Connect on mount
    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connect]);

    return (
        <HubContext.Provider value={{
            isConnected,
            isAuthenticated,
            systemState,
            symbolsState,
            setSymbolsState,
            wsUrl,
            connectionError,
            availableModels,
            sendCommand,
            pause,
            resume,
            closeAll,
            closePosition,
            getState,
            listModels,
            getAvailableModels,
            loadModel,
            unloadModel,
            getSymbolConfig,
            setSymbolConfig,
            getGeneralConfig,
            setGeneralConfig,
        }}>
            {children}
        </HubContext.Provider>
    );
};

export const useHub = () => {
    const context = useContext(HubContext);
    if (!context) {
        throw new Error('useHub must be used within HubProvider');
    }
    return context;
};

export default HubContext;
