import React, { useState } from 'react';
import './TransactionResult.css';

export default function TransactionResult({ txResult }) {
    const [copied, setCopied] = useState(false);
    if (!txResult) return null;

    const handleCopyHash = () => {
        navigator.clipboard.writeText(txResult.hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (txResult.success) {
        return (
            <div className="tx-result tx-result--success fade-in" id="tx-success-card">
                <div className="tx-result-icon">✅</div>
                <div className="tx-result-body">
                    <span className="badge badge-success">Transaction Successful</span>
                    <h3 className="tx-result-title">XLM Sent!</h3>
                    <p className="tx-result-desc">Your transaction was submitted to the Stellar Testnet and confirmed.</p>

                    <div className="tx-hash-row">
                        <span className="label" style={{ marginBottom: 4 }}>Transaction Hash</span>
                        <div className="tx-hash-box">
                            <span className="tx-hash font-mono" id="tx-hash-text">{txResult.hash}</span>
                            <button
                                id="copy-hash-btn"
                                className="icon-btn"
                                onClick={handleCopyHash}
                                title="Copy hash"
                            >
                                {copied ? '✓' :
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                    </svg>
                                }
                            </button>
                        </div>
                    </div>

                    <a
                        id="view-tx-link"
                        href={`https://stellar.expert/explorer/testnet/tx/${txResult.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ marginTop: 14, display: 'inline-flex', fontSize: '0.82rem' }}
                    >
                        🔍 View on Stellar Expert
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="tx-result tx-result--error fade-in" id="tx-error-card">
            <div className="tx-result-icon">❌</div>
            <div className="tx-result-body">
                <span className="badge badge-error">Transaction Failed</span>
                <h3 className="tx-result-title">Something went wrong</h3>
                <p className="tx-result-desc">{txResult.error}</p>
                <p className="tx-result-hint">
                    Make sure your wallet has enough XLM (including the 1.5 XLM minimum reserve) and the destination address is valid.
                </p>
            </div>
        </div>
    );
}
