import React from 'react';
import { useHub } from '../context/HubContext';
import SymbolCard from './SymbolCard';

function SymbolGrid() {
    const { symbolsState } = useHub();

    const symbols = Object.keys(symbolsState);

    if (symbols.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-slate-500 mb-2">No symbols loaded</p>
                <p className="text-xs text-slate-600">
                    Load models in the Config tab or wait for connection
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {symbols.map(symbol => (
                <SymbolCard key={symbol} symbol={symbol} data={symbolsState[symbol]} />
            ))}
        </div>
    );
}

export default SymbolGrid;
