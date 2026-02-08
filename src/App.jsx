import React, { useState, useEffect } from 'react';
import { HubProvider, useHub } from './context/HubContext';
import { LayoutDashboard, BarChart3, Settings, Wifi, WifiOff, RefreshCw, Pause, Play, XCircle } from 'lucide-react';

// Components
import MetricsHeader from './components/MetricsHeader';
import SymbolGrid from './components/SymbolGrid';
import AnalyticsView from './components/AnalyticsView';
import ConfigView from './components/ConfigView';

function DashboardContent() {
    const { isConnected, isAuthenticated, systemState, wsUrl, pause, resume, closeAll } = useHub();
    const [activeTab, setActiveTab] = useState('dashboard');

    const status = systemState?.status || 'OFFLINE';
    const isRunning = status === 'RUNNING';

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-xl font-bold">O</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gradient-blue">Oracle Trader</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wider">AI POWERED TRADING SYSTEM</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Tab Nav */}
                    <div className="tab-nav">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        >
                            <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                        >
                            <BarChart3 size={16} /> Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
                        >
                            <Settings size={16} /> Config
                        </button>
                    </div>

                    {/* Connection Status */}
                    <div className={`badge ${isConnected && isAuthenticated ? 'badge-running' : 'badge-offline'}`}>
                        {isConnected && isAuthenticated ? <Wifi size={12} /> : <WifiOff size={12} />}
                        {isConnected && isAuthenticated ? 'Online' : 'Offline'}
                    </div>
                </div>
            </div>

            {/* Metrics Header */}
            <MetricsHeader />

            {/* Control Buttons (Dashboard tab only) */}
            {activeTab === 'dashboard' && (
                <div className="flex items-center gap-3 mt-4 mb-6">
                    {isRunning ? (
                        <button onClick={pause} className="btn btn-ghost">
                            <Pause size={16} /> Pause
                        </button>
                    ) : (
                        <button onClick={resume} className="btn btn-primary">
                            <Play size={16} /> Resume
                        </button>
                    )}
                    <button onClick={closeAll} className="btn btn-danger">
                        <XCircle size={16} /> Close All
                    </button>
                </div>
            )}

            {/* Tab Content */}
            <div className="mt-4">
                {activeTab === 'dashboard' && <SymbolGrid />}
                {activeTab === 'analytics' && <AnalyticsView />}
                {activeTab === 'config' && <ConfigView />}
            </div>

            {/* Footer - Connection Info */}
            <div className="fixed bottom-4 left-4 text-xs text-slate-600">
                {wsUrl && <span>WS: {wsUrl}</span>}
            </div>
        </div>
    );
}

function App() {
    return (
        <HubProvider>
            <DashboardContent />
        </HubProvider>
    );
}

export default App;
