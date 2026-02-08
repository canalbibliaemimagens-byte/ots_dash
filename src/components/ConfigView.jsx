import React, { useState, useEffect } from 'react';
import { useHub } from '../context/HubContext';
import {
    Cpu, RefreshCw, Upload, Trash2, FolderOpen,
    PlayCircle, PauseCircle, XOctagon, Wifi, WifiOff,
    Settings, Save
} from 'lucide-react';

function ConfigView() {
    const {
        isConnected, isAuthenticated, systemState, wsUrl,
        pause, resume, closeAll,
        listModels, getAvailableModels, loadModel, unloadModel,
        getGeneralConfig, setGeneralConfig
    } = useHub();

    const [loadedModels, setLoadedModels] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generalCfg, setGeneralCfg] = useState(null);
    const [savingGeneral, setSavingGeneral] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            refresh();
        }
    }, [isAuthenticated]);

    const refresh = async () => {
        setLoading(true);
        try {
            const [loaded, available] = await Promise.all([
                listModels(),
                getAvailableModels()
            ]);
            setLoadedModels(loaded.models || []);
            setAvailableModels(available.available || []);
        } catch (e) {
            console.error('Failed to load models:', e);
        }
        // Load general config separately (may not be available)
        try {
            const cfg = await getGeneralConfig();
            setGeneralCfg(cfg);
        } catch (e) {
            console.error('Failed to load general config:', e);
        }
        setLoading(false);
    };

    const handleSaveGeneral = async () => {
        if (!generalCfg) return;
        setSavingGeneral(true);
        try {
            await setGeneralConfig({
                close_on_exit: generalCfg.close_on_exit,
                close_on_day_change: generalCfg.close_on_day_change,
                default_sl_usd: parseFloat(generalCfg.default_sl_usd) || 0,
                default_tp_usd: parseFloat(generalCfg.default_tp_usd) || 0,
            });
        } catch (e) {
            console.error('Failed to save general config:', e);
        }
        setSavingGeneral(false);
    };

    const handleLoad = async (modelName) => {
        try {
            await loadModel(`./models/${modelName}`);
            await refresh();
        } catch (e) {
            console.error('Failed to load model:', e);
        }
    };

    const handleUnload = async (symbol) => {
        try {
            await unloadModel(symbol);
            await refresh();
        } catch (e) {
            console.error('Failed to unload model:', e);
        }
    };

    const status = systemState?.status || 'OFFLINE';
    const isRunning = status === 'RUNNING';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Control */}
            <div className="card">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Cpu size={20} className="text-blue-400" />
                    System Control
                </h2>

                {/* Connection Status */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 mb-4">
                    {isConnected && isAuthenticated ? (
                        <Wifi size={20} className="text-green-400" />
                    ) : (
                        <WifiOff size={20} className="text-red-400" />
                    )}
                    <div className="flex-1">
                        <p className="text-sm font-semibold">
                            {isConnected && isAuthenticated ? 'Connected to Hub' : 'Disconnected'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{wsUrl || 'No URL'}</p>
                    </div>
                    <span className={`badge ${status === 'RUNNING' ? 'badge-running' :
                            status === 'PAUSED' ? 'badge-paused' : 'badge-offline'
                        }`}>
                        {status}
                    </span>
                </div>

                {/* Control Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    {isRunning ? (
                        <button onClick={pause} className="btn btn-ghost">
                            <PauseCircle size={18} /> Pause
                        </button>
                    ) : (
                        <button onClick={resume} className="btn btn-primary">
                            <PlayCircle size={18} /> Resume
                        </button>
                    )}
                    <button onClick={closeAll} className="btn btn-danger">
                        <XOctagon size={18} /> Close All
                    </button>
                    <button onClick={refresh} disabled={loading} className="btn btn-ghost">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Loaded Models */}
            <div className="card">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Cpu size={20} className="text-purple-400" />
                    Loaded Models ({loadedModels.length})
                </h2>

                {loadedModels.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No models loaded</p>
                ) : (
                    <div className="space-y-2">
                        {loadedModels.map(symbol => (
                            <div key={symbol} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                                <span className="font-semibold">{symbol}</span>
                                <button
                                    onClick={() => handleUnload(symbol)}
                                    className="btn btn-ghost text-xs py-1"
                                >
                                    <Trash2 size={14} /> Unload
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Models */}
            <div className="card lg:col-span-2">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FolderOpen size={20} className="text-cyan-400" />
                    Available Models ({availableModels.length})
                </h2>

                {availableModels.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No models available</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {availableModels.map(model => {
                            const symbol = model.replace('.zip', '').split('_')[0].toUpperCase();
                            const isLoaded = loadedModels.includes(symbol);

                            return (
                                <div
                                    key={model}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${isLoaded
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-slate-800/50 border-slate-700'
                                        }`}
                                >
                                    <div>
                                        <p className="font-semibold text-sm">{model}</p>
                                        <p className="text-xs text-slate-500">
                                            {isLoaded ? 'Loaded' : 'Available'}
                                        </p>
                                    </div>
                                    {!isLoaded && (
                                        <button
                                            onClick={() => handleLoad(model)}
                                            className="btn btn-primary text-xs py-1"
                                        >
                                            <Upload size={14} /> Load
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* General Configuration */}
            {generalCfg && (
                <div className="card lg:col-span-2">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Settings size={20} className="text-amber-400" />
                        General Configuration
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-slate-800/50">
                            <p className="text-xs text-slate-500">Broker</p>
                            <p className="font-semibold text-sm">{generalCfg.broker_type} ({generalCfg.broker_env})</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-800/50">
                            <p className="text-xs text-slate-500">Timeframe</p>
                            <p className="font-semibold text-sm">{generalCfg.timeframe}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-800/50">
                            <p className="text-xs text-slate-500">Initial Balance</p>
                            <p className="font-semibold text-sm">${generalCfg.initial_balance?.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-800/50">
                            <p className="text-xs text-slate-500">Warmup Bars</p>
                            <p className="font-semibold text-sm">{generalCfg.warmup_bars}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-800/50">
                            <p className="text-xs text-slate-500">Hub</p>
                            <p className={`font-semibold text-sm ${generalCfg.hub_connected ? 'text-green-400' : 'text-red-400'}`}>
                                {generalCfg.hub_connected ? 'Connected' : 'Disconnected'}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-800/50">
                            <p className="text-xs text-slate-500">Persistence</p>
                            <p className={`font-semibold text-sm ${generalCfg.persistence_enabled ? 'text-green-400' : 'text-slate-400'}`}>
                                {generalCfg.persistence_enabled ? 'Enabled' : 'Disabled'}
                            </p>
                        </div>
                    </div>

                    {/* Editable toggles + SL/TP */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Default SL (USD)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={generalCfg.default_sl_usd ?? 0}
                                    onChange={e => setGeneralCfg(prev => ({ ...prev, default_sl_usd: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Default TP (USD)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={generalCfg.default_tp_usd ?? 0}
                                    onChange={e => setGeneralCfg(prev => ({ ...prev, default_tp_usd: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={generalCfg.close_on_exit ?? true}
                                    onChange={e => setGeneralCfg(prev => ({ ...prev, close_on_exit: e.target.checked }))}
                                    className="w-4 h-4 accent-blue-500"
                                />
                                <span className="text-sm">Close on Exit</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={generalCfg.close_on_day_change ?? false}
                                    onChange={e => setGeneralCfg(prev => ({ ...prev, close_on_day_change: e.target.checked }))}
                                    className="w-4 h-4 accent-blue-500"
                                />
                                <span className="text-sm">Close on Day Change</span>
                            </label>
                            <button onClick={handleSaveGeneral} disabled={savingGeneral} className="btn btn-primary text-sm ml-auto">
                                <Save size={16} /> {savingGeneral ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConfigView;
