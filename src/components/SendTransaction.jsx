import React, { useState } from 'react';
import './SendTransaction.css';

export default function SendTransaction({ publicKey, sendXLM, sending, txResult, clearTxResult }) {
    const [to, setTo] = useState('');
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearTxResult();
        await sendXLM({ fromPublicKey: publicKey, toPublicKey: to, amount, memo });
    };

    const handleReset = () => {
        clearTxResult();
        setTo('');
        setAmount('');
        setMemo('');
    };

    if (!publicKey) {
        return (
            <div className="card send-tx send-tx--locked slide-up">
                <div className="send-tx-lock-icon">🔒</div>
                <h2 className="section-title" style={{ textAlign: 'center' }}>Send XLM</h2>
                <p className="send-tx-hint">Connect your Freighter wallet to send XLM transactions on Testnet.</p>
            </div>
        );
    }

    return (
        <div className="card send-tx slide-up">
            <h2 className="section-title">🚀 Send XLM</h2>
            <p className="section-subtitle">Send XLM on Stellar Testnet – signed by Freighter</p>

            <form id="send-tx-form" className="send-tx-form" onSubmit={handleSubmit}>
                {/* From */}
                <div className="form-group">
                    <label className="label" htmlFor="from-input">From</label>
                    <input
                        id="from-input"
                        className="input font-mono"
                        value={publicKey ? `${publicKey.slice(0, 14)}…${publicKey.slice(-8)}` : ''}
                        readOnly
                        style={{ opacity: 0.65, cursor: 'default' }}
                    />
                </div>

                {/* To */}
                <div className="form-group">
                    <label className="label" htmlFor="to-input">Destination Address</label>
                    <input
                        id="to-input"
                        className="input font-mono"
                        placeholder="G… (Stellar public key)"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        required
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="none"
                    />
                </div>

                {/* Amount */}
                <div className="form-group">
                    <label className="label" htmlFor="amount-input">Amount (XLM)</label>
                    <div className="amount-input-row">
                        <input
                            id="amount-input"
                            className="input"
                            type="number"
                            min="0.0000001"
                            step="0.0000001"
                            placeholder="e.g. 10"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                        <span className="amount-unit">XLM</span>
                    </div>
                </div>

                {/* Memo (optional) */}
                <div className="form-group">
                    <label className="label" htmlFor="memo-input">
                        Memo <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional, max 28 chars)</span>
                    </label>
                    <input
                        id="memo-input"
                        className="input"
                        placeholder="tx note…"
                        value={memo}
                        maxLength={28}
                        onChange={(e) => setMemo(e.target.value)}
                    />
                </div>

                {/* Submit */}
                <div className="send-tx-actions">
                    <button
                        id="send-tx-btn"
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        disabled={sending || !to || !amount}
                    >
                        {sending
                            ? <><span className="spinner" /> Signing & Sending…</>
                            : '↗ Send XLM'}
                    </button>
                    {txResult && (
                        <button
                            id="reset-tx-btn"
                            type="button"
                            className="btn btn-outline"
                            onClick={handleReset}
                        >
                            New Tx
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
