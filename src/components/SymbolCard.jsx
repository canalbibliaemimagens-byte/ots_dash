import React, { useState } from 'react';
import { useHub } from '../context/HubContext';
import {
    TrendingUp, TrendingDown, MinusCircle, Settings, X,
    ArrowUpCircle, ArrowDownCircle, Activity
} from 'lucide-react';
import SymbolConfigModal from './SymbolConfigModal';

function SymbolCard({ symbol, data }) {
    const { closePosition } = useHub();
    const [showConfig, setShowConfig] = useState(false);

    const position = data?.position || {};
    const signal = data?.last_signal || {};
    const stats = data?.stats || {};

    const hasPosition = (position.volume > 0) || (position.size > 0);
    const posVolume = position.volume || position.size || 0;
    const direction = position.direction || signal.direction || '';
    const pnl = position.pnl || 0;
    const pnlPips = position.pnl_pips || 0;
    const hmmState = signal.hmm_state ?? data?.hmm_state ?? '-';
    const lastAction = signal.action || data?.action || 'WAIT';
    const winRate = stats.win_rate || 0;
    const trades = stats.trades || 0;

    const isLong = direction === 'LONG' || direction === 1;
    const isShort = direction === 'SHORT' || direction === -1;

    const getDirectionColor = () => {
        if (isLong) return 'text-green-400';
        if (isShort) return 'text-red-400';
        return 'text-slate-400';
    };

    const getDirectionIcon = () => {
        if (isLong) return <ArrowUpCircle size={20} className="text-green-400" />;
        if (isShort) return <ArrowDownCircle size={20} className="text-red-400" />;
        return <MinusCircle size={20} className="text-slate-400" />;
    };

    const getActionBadge = () => {
        const actionColors = {
            'BUY': 'bg-green-500/20 text-green-400 border-green-500/30',
            'SELL': 'bg-red-500/20 text-red-400 border-red-500/30',
            'CLOSE': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'WAIT': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        };
        const colors = actionColors[lastAction] || actionColors['WAIT'];
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colors}`}>
                {lastAction}
            </span>
        );
    };

    return (
        <>
            <div className="card card-hover relative group">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {getDirectionIcon()}
                        <h3 className="font-bold text-lg">{symbol}</h3>
                    </div>
                    <button
                        onClick={() => setShowConfig(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-700/50"
                        title="Symbol Config"
                    >
                        <Settings size={16} className="text-slate-400" />
                    </button>
                </div>

                {/* Position Info */}
                {hasPosition ? (
                    <div className="mb-3 p-2 rounded-lg bg-slate-800/50">
                        <div className="flex items-center justify-between">
                            <span className={`font-semibold ${getDirectionColor()}`}>
                                {isLong ? 'LONG' : 'SHORT'} {posVolume}
                            </span>
                            <span className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                            <span>Entry: {position.open_price?.toFixed(5)}</span>
                            <span>{pnlPips >= 0 ? '+' : ''}{pnlPips.toFixed(1)} pips</span>
                        </div>
                        <button
                            onClick={() => closePosition(symbol)}
                            className="mt-2 w-full btn btn-ghost text-xs py-1"
                        >
                            <X size={12} /> Close Position
                        </button>
                    </div>
                ) : (
                    <div className="mb-3 p-2 rounded-lg bg-slate-800/50 text-center text-slate-500 text-sm">
                        No position
                    </div>
                )}

                {/* Signal Info */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-xs text-slate-500">HMM State</p>
                        <p className="font-mono font-bold text-purple-400">{hmmState}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Last Action</p>
                        {getActionBadge()}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                    <span>WR: {winRate.toFixed(1)}%</span>
                    <span>{trades} trades</span>
                </div>

                {/* Win Rate Progress */}
                <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full gradient-green transition-all duration-500"
                        style={{ width: `${Math.min(winRate, 100)}%` }}
                    />
                </div>
            </div>

            {/* Config Modal */}
            {showConfig && (
                <SymbolConfigModal symbol={symbol} onClose={() => setShowConfig(false)} />
            )}
        </>
    );
}

export default SymbolCard;
