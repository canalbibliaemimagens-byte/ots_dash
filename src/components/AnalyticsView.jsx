import React, { useState } from 'react';
import { useHub } from '../context/HubContext';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, CartesianGrid, ReferenceLine
} from 'recharts';
import {
    TrendingUp, Activity, Award, Clock, BarChart2,
    Layers, ArrowUpCircle, ArrowDownCircle, AlertTriangle
} from 'lucide-react';

function AnalyticsView() {
    const { systemState, symbolsState } = useHub();
    const [activeSubTab, setActiveSubTab] = useState('overview');

    const symbols = Object.keys(symbolsState);

    // Real data from systemState (fed by telemetry stream)
    const stats = {
        netProfit: systemState?.net_profit || 0,
        winRate: systemState?.win_rate || 0,
        totalTrades: systemState?.total_trades || 0,
        expectancy: systemState?.expectancy || 0,
        profitFactor: systemState?.profit_factor || 0,
        maxDrawdown: systemState?.max_drawdown || 0,
        avgWin: systemState?.avg_win || 0,
        avgLoss: systemState?.avg_loss || 0,
        sharpeRatio: systemState?.sharpe_ratio || 0,
    };

    // Real equity curve from telemetry
    const equityCurve = systemState?.equity_curve || [];

    // Derive drawdown from equity curve
    const drawdownData = deriveDrawdown(equityCurve);

    // Derive P/L per trade from equity curve
    const pnlByTrade = equityCurve.map(p => ({
        trade: p.trade,
        pnl: p.pnl || 0,
    }));

    const hasData = stats.totalTrades > 0;

    return (
        <div>
            {/* Sub-tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {['overview', 'performance', 'models', 'time'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap ${activeSubTab === tab
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeSubTab === 'overview' && (
                <div className="space-y-6">
                    {/* No data warning */}
                    {!hasData && (
                        <div className="card border border-amber-500/30 bg-amber-500/5 flex items-center gap-3 p-4">
                            <AlertTriangle size={20} className="text-amber-400 flex-shrink-0" />
                            <p className="text-sm text-amber-300">
                                Aguardando dados do bot. As métricas serão atualizadas em tempo real conforme trades são executados.
                            </p>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        <KpiCard
                            label="Net Profit"
                            value={`${stats.netProfit >= 0 ? '+' : ''}$${stats.netProfit.toFixed(2)}`}
                            color={stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}
                            icon={<TrendingUp size={18} />}
                        />
                        <KpiCard
                            label="Win Rate"
                            value={`${stats.winRate.toFixed(1)}%`}
                            color="text-blue-400"
                            icon={<Award size={18} />}
                        />
                        <KpiCard
                            label="Trades"
                            value={stats.totalTrades}
                            color="text-purple-400"
                            icon={<Activity size={18} />}
                        />
                        <KpiCard
                            label="Expectancy"
                            value={`$${stats.expectancy.toFixed(2)}`}
                            color="text-cyan-400"
                            icon={<BarChart2 size={18} />}
                        />
                        <KpiCard
                            label="Max DD"
                            value={`${stats.maxDrawdown.toFixed(2)}%`}
                            color="text-red-400"
                            icon={<Layers size={18} />}
                        />
                    </div>

                    {/* Secondary KPIs */}
                    {hasData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <KpiCard
                                label="Profit Factor"
                                value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
                                color="text-emerald-400"
                                icon={<TrendingUp size={18} />}
                            />
                            <KpiCard
                                label="Sharpe Ratio"
                                value={stats.sharpeRatio.toFixed(2)}
                                color="text-indigo-400"
                                icon={<BarChart2 size={18} />}
                            />
                            <KpiCard
                                label="Avg Win"
                                value={`+$${stats.avgWin.toFixed(2)}`}
                                color="text-green-400"
                                icon={<ArrowUpCircle size={18} />}
                            />
                            <KpiCard
                                label="Avg Loss"
                                value={`$${stats.avgLoss.toFixed(2)}`}
                                color="text-red-400"
                                icon={<ArrowDownCircle size={18} />}
                            />
                        </div>
                    )}

                    {/* Equity Curve */}
                    <div className="card">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-green-400" />
                            Capital Growth
                        </h3>
                        <div className="h-64" style={{ minHeight: '250px' }}>
                            {equityCurve.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                    <AreaChart data={equityCurve}>
                                        <defs>
                                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="trade" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#94a3b8' }}
                                            formatter={(value) => [`$${value.toFixed(2)}`, 'Equity']}
                                            labelFormatter={(label) => `Trade #${label}`}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="equity"
                                            stroke="#22c55e"
                                            fill="url(#colorEquity)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                    Equity curve will appear after first trades
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drawdown & P/L Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Drawdown */}
                        <div className="card">
                            <h3 className="font-bold mb-4 text-red-400">Drawdown</h3>
                            <div className="h-48" style={{ minHeight: '200px' }}>
                                {drawdownData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                        <AreaChart data={drawdownData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="trade" stroke="#64748b" fontSize={10} />
                                            <YAxis stroke="#64748b" fontSize={10} domain={['auto', 0]} />
                                            <Tooltip
                                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                formatter={(value) => [`${value.toFixed(2)}%`, 'Drawdown']}
                                            />
                                            <ReferenceLine y={0} stroke="#64748b" />
                                            <Area
                                                type="monotone"
                                                dataKey="dd"
                                                stroke="#ef4444"
                                                fill="rgba(239, 68, 68, 0.2)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                        No drawdown data yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* P/L per Trade */}
                        <div className="card">
                            <h3 className="font-bold mb-4">P/L per Trade</h3>
                            <div className="h-48" style={{ minHeight: '200px' }}>
                                {pnlByTrade.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                        <BarChart data={pnlByTrade}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="trade" stroke="#64748b" fontSize={10} />
                                            <YAxis stroke="#64748b" fontSize={10} />
                                            <Tooltip
                                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                formatter={(value) => [`$${value.toFixed(2)}`, 'P/L']}
                                            />
                                            <ReferenceLine y={0} stroke="#64748b" />
                                            <Bar
                                                dataKey="pnl"
                                                radius={[2, 2, 0, 0]}
                                                shape={(props) => {
                                                    const { x, y, width, height, payload } = props;
                                                    const fill = payload.pnl >= 0 ? '#22c55e' : '#ef4444';
                                                    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} />;
                                                }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                        No trade data yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Per-Symbol Stats */}
                    {symbols.length > 0 && (
                        <div className="card">
                            <h3 className="font-bold mb-4">Symbol Performance</h3>
                            <div className="space-y-3">
                                {symbols.map(symbol => {
                                    const sData = symbolsState[symbol] || {};
                                    const sStats = sData.stats || {};
                                    const sTrades = sStats.trades || 0;
                                    const sWinRate = sStats.win_rate || 0;
                                    const sPnl = sStats.total_pnl || 0;
                                    const isLong = sData.last_signal?.direction === 'LONG' || sData.last_signal?.direction === 1;
                                    return (
                                        <DirectionRow
                                            key={symbol}
                                            direction={symbol}
                                            trades={sTrades}
                                            winRate={sWinRate}
                                            pnl={sPnl}
                                            icon={isLong
                                                ? <ArrowUpCircle className="text-green-400" size={20} />
                                                : <ArrowDownCircle className="text-red-400" size={20} />
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeSubTab === 'performance' && (
                <div className="card text-center py-12 text-slate-500">
                    Performance metrics coming soon...
                </div>
            )}

            {activeSubTab === 'models' && (
                <div className="card text-center py-12 text-slate-500">
                    Model analytics coming soon...
                </div>
            )}

            {activeSubTab === 'time' && (
                <div className="card text-center py-12 text-slate-500">
                    Time-based analytics coming soon...
                </div>
            )}
        </div>
    );
}

function KpiCard({ label, value, color, icon }) {
    return (
        <div className="card card-hover">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
                {icon}
                <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function DirectionRow({ direction, trades, winRate, pnl, icon }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-semibold">{direction}</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-400">{trades} trades</span>
                <span className="text-blue-400">{typeof winRate === 'number' ? winRate.toFixed(1) : winRate}% WR</span>
                <span className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {pnl >= 0 ? '+' : ''}${typeof pnl === 'number' ? pnl.toFixed(2) : pnl}
                </span>
            </div>
        </div>
    );
}

/**
 * Derive drawdown % from equity curve data
 */
function deriveDrawdown(equityCurve) {
    if (!equityCurve || equityCurve.length === 0) return [];

    let peak = equityCurve[0]?.equity || 0;
    return equityCurve.map(point => {
        if (point.equity > peak) peak = point.equity;
        const dd = peak > 0 ? ((point.equity - peak) / peak) * 100 : 0;
        return {
            trade: point.trade,
            dd: Math.round(dd * 100) / 100,
        };
    });
}

export default AnalyticsView;
