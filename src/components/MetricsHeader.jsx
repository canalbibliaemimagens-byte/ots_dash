import React from 'react';
import { useHub } from '../context/HubContext';
import { DollarSign, TrendingUp, TrendingDown, Activity, Percent, Award, AlertTriangle } from 'lucide-react';

function MetricsHeader() {
    const { systemState, symbolsState } = useHub();

    const balance = systemState?.balance || 0;
    const equity = systemState?.equity || 0;
    const floatingPnl = systemState?.floating_pnl || (equity - balance);
    const status = systemState?.status || 'OFFLINE';

    // Calculate metrics from positions
    const positions = Object.values(symbolsState).filter(s => s?.position?.size > 0);
    const openPositions = positions.length;

    // Mock data for now (real data will come from analytics)
    const netProfit = systemState?.net_profit || 0;
    const winRate = systemState?.win_rate || 0;
    const trades = systemState?.total_trades || 0;

    const getStatusBadge = () => {
        switch (status) {
            case 'RUNNING':
                return <span className="badge badge-running pulse-glow">RUNNING</span>;
            case 'PAUSED':
                return <span className="badge badge-paused">PAUSED</span>;
            case 'ERROR':
                return <span className="badge badge-error">ERROR</span>;
            default:
                return <span className="badge badge-offline">OFFLINE</span>;
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Equity */}
            <MetricCard
                label="EQUITY"
                value={`$${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                subValue={`Bal: $${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                icon={<DollarSign size={18} />}
                color="text-blue-400"
                bg="bg-blue-500/10"
            />

            {/* Floating P/L */}
            <MetricCard
                label="FLOATING P/L"
                value={`${floatingPnl >= 0 ? '+' : ''}$${floatingPnl.toFixed(2)}`}
                subValue={`${openPositions} position${openPositions !== 1 ? 's' : ''}`}
                icon={floatingPnl >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                color={floatingPnl >= 0 ? 'text-green-400' : 'text-red-400'}
                bg={floatingPnl >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}
            />

            {/* Net Profit */}
            <MetricCard
                label="NET PROFIT"
                value={`${netProfit >= 0 ? '+' : ''}$${netProfit.toFixed(2)}`}
                subValue={`${trades} trades`}
                icon={<Award size={18} />}
                color={netProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}
                bg="bg-cyan-500/10"
            />

            {/* Win Rate */}
            <MetricCard
                label="WIN RATE"
                value={`${winRate.toFixed(1)}%`}
                subValue="All time"
                icon={<Percent size={18} />}
                color="text-purple-400"
                bg="bg-purple-500/10"
            />

            {/* Status */}
            <div className="card card-hover col-span-2 md:col-span-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <Activity size={18} className="text-slate-400" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                    {getStatusBadge()}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, subValue, icon, color, bg }) {
    return (
        <div className="card card-hover flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wider truncate">{label}</p>
                <p className={`text-lg font-bold ${color} truncate`}>{value}</p>
                {subValue && <p className="text-xs text-slate-500 truncate">{subValue}</p>}
            </div>
        </div>
    );
}

export default MetricsHeader;
