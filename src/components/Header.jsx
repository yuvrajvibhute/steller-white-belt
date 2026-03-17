import React from 'react';
import './Header.css';

export default function Header({ isConnected, connecting, onConnect, onDisconnect, publicKey, freighterInstalled }) {
    const shortKey = publicKey ? `${publicKey.slice(0, 6)}…${publicKey.slice(-4)}` : null;

    return (
        <header className="header">
            <div className="header-inner">
                {/* Logo */}
                <div className="header-logo">
                    <div className="logo-icon">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="13" stroke="url(#lg)" strokeWidth="1.5" />
                            <path d="M6 14 L22 14 M14 6 C14 6 20 10 20 14 C20 18 14 22 14 22 C14 22 8 18 8 14 C8 10 14 6 14 6Z"
                                stroke="url(#lg2)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6E56FF" />
                                    <stop offset="1" stopColor="#00D4FF" />
                                </linearGradient>
                                <linearGradient id="lg2" x1="6" y1="6" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6E56FF" />
                                    <stop offset="1" stopColor="#00D4FF" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="logo-text">StellarPay</span>
                    <span className="badge badge-cyan hide-mobile">Testnet</span>
                </div>

                {/* Nav Actions */}
                <div className="header-actions">
                    {freighterInstalled === false && (
                        <a
                            href="https://freighter.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            id="install-freighter-btn"
                        >
                            Install Freighter
                        </a>
                    )}

                    {(!isConnected && freighterInstalled !== false) && (
                        <button
                            id="connect-wallet-btn"
                            className="btn btn-primary"
                            onClick={onConnect}
                            disabled={connecting}
                        >
                            {connecting ? <><span className="spinner" />Connecting…</> : '🔗 Connect Wallet'}
                        </button>
                    )}

                    {isConnected && (
                        <div className="wallet-chip">
                            <div className="wallet-chip-dot" />
                            <span className="wallet-chip-key font-mono">{shortKey}</span>
                            <button
                                id="disconnect-wallet-btn"
                                className="btn btn-danger"
                                onClick={onDisconnect}
                                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
