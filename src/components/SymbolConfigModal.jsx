import React, { useState, useEffect } from 'react';
import { useHub } from '../context/HubContext';
import { X, Save } from 'lucide-react';

function SymbolConfigModal({ symbol, onClose }) {
    const { getSymbolConfig, setSymbolConfig } = useHub();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, [symbol]);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const result = await getSymbolConfig(symbol);
            if (result.config) {
                setConfig(result.config);
            }
        } catch (e) {
            console.error('Failed to load config:', e);
        }
        setLoading(false);
    };

    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setSymbolConfig(symbol, config);
            onClose();
        } catch (e) {
            console.error('Failed to save config:', e);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">{symbol} Config</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="py-8 text-center text-slate-500">Loading...</div>
                ) : !config ? (
                    <div className="py-8 text-center text-slate-500">No config found</div>
                ) : (
                    <>
                        {/* Form */}
                        <div className="space-y-4">
                            {/* Enabled */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-slate-400">Enabled</label>
                                <button
                                    onClick={() => handleChange('enabled', !config.enabled)}
                                    className={`w-12 h-6 rounded-full transition-colors ${config.enabled ? 'bg-green-500' : 'bg-slate-600'
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>

                            {/* Lot Sizes */}
                            <div>
                                <label className="text-sm text-slate-400 block mb-2">Lot Sizes</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <span className="text-xs text-slate-500">Weak</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={config.lot_weak}
                                            onChange={(e) => handleChange('lot_weak', parseFloat(e.target.value))}
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">Moderate</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={config.lot_moderate}
                                            onChange={(e) => handleChange('lot_moderate', parseFloat(e.target.value))}
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">Strong</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={config.lot_strong}
                                            onChange={(e) => handleChange('lot_strong', parseFloat(e.target.value))}
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SL/TP */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">SL (USD)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={config.sl_usd}
                                        onChange={(e) => handleChange('sl_usd', parseFloat(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">TP (USD)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={config.tp_usd}
                                        onChange={(e) => handleChange('tp_usd', parseFloat(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5"
                                    />
                                </div>
                            </div>

                            {/* Max Spread */}
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Max Spread (pips)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={config.max_spread_pips}
                                    onChange={(e) => handleChange('max_spread_pips', parseFloat(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-700">
                            <button onClick={onClose} className="btn btn-ghost flex-1">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
                                <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SymbolConfigModal;
