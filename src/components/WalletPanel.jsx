import React from 'react';
import './WalletPanel.css';

export default function WalletPanel({ publicKey, balance, balanceLoading, onDisconnect, onFetchOwnBalance }) {
    const shortKey = publicKey
        ? `${publicKey.slice(0, 8)}…${publicKey.slice(-8)}`
        : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(publicKey);
    };

    return (
        <div className="wallet-panel card card--accent fade-in">
            <div className="wallet-panel-grid">
                {/* Left – address */}
                <div className="wallet-info">
                    <span className="label">Connected Wallet</span>
                    <div className="wallet-address-row">
                        <span className="wallet-address font-mono">{shortKey}</span>
                        <button
                            id="copy-address-btn"
                            className="icon-btn"
                            onClick={handleCopy}
                            title="Copy full address"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                        </button>
                    </div>

                    <a
                        href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="explorer-link"
                        id="view-explorer-link"
                    >
                        View on Stellar Expert ↗
                    </a>
                </div>

                {/* Right – balance */}
                <div className="balance-box">
                    <span className="label">XLM Balance</span>
                    {balanceLoading ? (
                        <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                            <span className="spinner" style={{ borderTopColor: 'var(--cyan)' }} />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading…</span>
                        </div>
                    ) : (
                        <div className="balance-amount">
                            {balance ?? '—'}
                            <span className="balance-unit">XLM</span>
                        </div>
                    )}
                    <button
                        id="refresh-balance-btn"
                        className="btn btn-outline"
                        onClick={onFetchOwnBalance}
                        disabled={balanceLoading}
                        style={{ marginTop: 12, padding: '7px 16px', fontSize: '0.78rem' }}
                    >
                        ↺ Refresh
                    </button>
                </div>
            </div>

            {/* Friendbot hint */}
            <div className="friendbot-hint">
                <span>🚰</span>
                <span>Need testnet XLM? </span>
                <a
                    href={`https://friendbot.stellar.org/?addr=${publicKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="friendbot-link"
                >
                    Fund via Friendbot
                </a>
                <span> then refresh your balance.</span>
            </div>
        </div>
    );
}
