import React, { useState } from 'react';
import './BalanceChecker.css';

export default function BalanceChecker({ fetchBalance, balanceLoading, balanceError, balanceResult, clearBalance }) {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        await fetchBalance(input.trim());
    };

    // Add to history when we get a result
    React.useEffect(() => {
        if (balanceResult) {
            setHistory((prev) => {
                const exists = prev.find((h) => h.publicKey === balanceResult.publicKey);
                const updated = exists
                    ? prev.map((h) => h.publicKey === balanceResult.publicKey ? balanceResult : h)
                    : [balanceResult, ...prev].slice(0, 8);
                return updated;
            });
        }
    }, [balanceResult]);

    const handleHistoryClick = (pk) => {
        setInput(pk);
        fetchBalance(pk);
    };

    const handleClear = () => {
        setInput('');
        clearBalance();
    };

    const shortKey = (pk) => `${pk.slice(0, 8)}…${pk.slice(-6)}`;

    return (
        <div className="card balance-checker slide-up">
            <div className="bc-header">
                <div>
                    <h2 className="section-title">⚖️ Balance Checker</h2>
                    <p className="section-subtitle">Enter any Stellar public key to view its XLM balance</p>
                </div>
                {history.length > 0 && (
                    <span className="badge badge-primary">{history.length} checked</span>
                )}
            </div>

            {/* Search form */}
            <form className="bc-form" onSubmit={handleSubmit} id="balance-checker-form">
                <label className="label" htmlFor="pk-input">Stellar Public Key</label>
                <div className="bc-input-row">
                    <input
                        id="pk-input"
                        className="input font-mono"
                        placeholder="GABC…XYZ (starts with G)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="none"
                    />
                    <button
                        id="check-balance-btn"
                        type="submit"
                        className="btn btn-cyan"
                        disabled={balanceLoading || !input.trim()}
                    >
                        {balanceLoading
                            ? <><span className="spinner" style={{ borderTopColor: '#000' }} /> Checking</>
                            : 'Check'}
                    </button>
                    {(balanceResult || balanceError) && (
                        <button
                            id="clear-balance-btn"
                            type="button"
                            className="btn btn-outline"
                            onClick={handleClear}
                        >✕</button>
                    )}
                </div>
            </form>

            {/* Error */}
            {balanceError && (
                <div className="bc-result bc-error fade-in" id="balance-error-card">
                    <span className="badge badge-error">Error</span>
                    <p className="bc-error-msg">{balanceError}</p>
                </div>
            )}

            {/* Result */}
            {balanceResult && !balanceError && (
                <div className="bc-result bc-success fade-in" id="balance-result-card">
                    <span className="badge badge-success">✓ Found</span>
                    <div className="bc-result-main">
                        <div className="bc-address font-mono">{balanceResult.publicKey}</div>
                        <div className="bc-balance-display">
                            <span className="bc-balance-number">{balanceResult.balance}</span>
                            <span className="bc-balance-label">XLM</span>
                        </div>
                    </div>
                    <a
                        href={`https://stellar.expert/explorer/testnet/account/${balanceResult.publicKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bc-explorer-link"
                    >
                        View on Stellar Expert ↗
                    </a>
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <div className="bc-history">
                    <p className="label">Recent Queries</p>
                    <div className="bc-history-list">
                        {history.map((h) => (
                            <button
                                key={h.publicKey}
                                className="bc-history-item"
                                onClick={() => handleHistoryClick(h.publicKey)}
                                title={h.publicKey}
                            >
                                <span className="font-mono bc-history-key">{shortKey(h.publicKey)}</span>
                                <span className="bc-history-balance">{h.balance} XLM</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
