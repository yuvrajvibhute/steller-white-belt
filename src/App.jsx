import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './index.css';

import { useWallet } from './hooks/useWallet';
import { useStellar } from './hooks/useStellar';

import Header from './components/Header';
import WalletPanel from './components/WalletPanel';
import BalanceChecker from './components/BalanceChecker';
import SendTransaction from './components/SendTransaction';
import TransactionResult from './components/TransactionResult';
import './App.css';

export default function App() {
  const {
    publicKey, connecting, error: walletError,
    freighterInstalled, isConnectedWallet,
    connect, disconnect,
  } = useWallet();

  const {
    fetchBalance, clearBalance,
    balanceLoading, balanceError, balanceResult,
    sendXLM, clearTxResult,
    sending, txResult,
  } = useStellar();

  /* ── Auto-fetch own balance on connect ── */
  useEffect(() => {
    if (publicKey) fetchBalance(publicKey);
  }, [publicKey]);

  /* ── Toast notifications ── */
  useEffect(() => {
    if (walletError) toast.error(walletError, { id: 'wallet-err' });
  }, [walletError]);

  useEffect(() => {
    if (txResult?.success) {
      toast.success('Transaction confirmed!', { id: 'tx-ok', duration: 5000 });
    } else if (txResult?.error) {
      toast.error(txResult.error, { id: 'tx-err', duration: 6000 });
    }
  }, [txResult]);

  return (
    <div className="app">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(15,20,40,0.95)',
            color: '#F0F4FF',
            border: '1px solid rgba(110,86,255,0.3)',
            borderRadius: '12px',
            fontSize: '0.85rem',
          },
        }}
      />

      <Header
        isConnected={isConnectedWallet}
        connecting={connecting}
        publicKey={publicKey}
        freighterInstalled={freighterInstalled}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <main className="app-main">
        {/* Page header */}
        <section className="hero">
          <h1 className="hero-title">
            Stellar <span className="hero-title-accent">Wallet</span> Balance Checker
          </h1>
          <p className="hero-sub">
            Connect your Freighter wallet · check XLM balances · send transactions on Testnet
          </p>
        </section>

        {/* Wallet connection error banner */}
        {walletError && (
          <div className="wallet-error-banner" id="wallet-error-banner">
            <div className="web-error-icon">⚠️</div>
            <div className="web-error-body">
              <strong>Connection Failed</strong>
              <p>{walletError}</p>
              <div className="web-error-steps">
                <span>To fix:</span>
                <ol>
                  <li>Click the <strong>Freighter</strong> icon in your browser toolbar and unlock it</li>
                  <li>Make sure your wallet is fully set up (mnemonic saved)</li>
                  <li>Switch network to <strong>Testnet</strong> in Freighter settings</li>
                  <li>Click <strong>Connect Wallet</strong> again → click <strong>"Connect"</strong> in the popup</li>
                </ol>
              </div>
            </div>
          </div>
        )}


        {/* Wallet Panel – only when connected */}
        {isConnectedWallet && (
          <WalletPanel
            publicKey={publicKey}
            balance={balanceResult?.publicKey === publicKey ? balanceResult.balance : null}
            balanceLoading={balanceLoading}
            onDisconnect={disconnect}
            onFetchOwnBalance={() => fetchBalance(publicKey)}
          />
        )}

        {/* Main grid */}
        <div className="app-grid">
          {/* Balance Checker (full width / left) */}
          <BalanceChecker
            fetchBalance={fetchBalance}
            clearBalance={clearBalance}
            balanceLoading={balanceLoading}
            balanceError={balanceError}
            balanceResult={balanceResult?.publicKey !== publicKey ? balanceResult : null}
          />

          {/* Send Transaction (right) */}
          <div className="send-col">
            <SendTransaction
              publicKey={publicKey}
              sendXLM={sendXLM}
              sending={sending}
              txResult={txResult}
              clearTxResult={clearTxResult}
            />
            {txResult && <TransactionResult txResult={txResult} />}
          </div>
        </div>

        {/* Info bar */}
        <section className="info-bar">
          <InfoCard icon="🌐" title="Stellar Testnet" desc="All transactions use Testnet funds. No real XLM is spent." />
          <InfoCard icon="🔐" title="Freighter Wallet" desc="Your keys never leave your browser. Freighter signs locally." />
          <InfoCard icon="🚰" title="Friendbot Faucet" desc="Get free testnet XLM via Stellar Friendbot to start testing." />
          <InfoCard icon="🔍" title="Stellar Expert" desc="Every TX hash links to the public Stellar Explorer." />
        </section>
      </main>

      <footer className="app-footer">
        <p>Built on <strong>Stellar Testnet</strong> · Powered by <strong>Freighter</strong> &amp; <strong>Stellar SDK</strong> · Level 1 White Belt</p>
      </footer>
    </div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="info-card card">
      <div className="info-card-icon">{icon}</div>
      <div>
        <div className="info-card-title">{title}</div>
        <div className="info-card-desc">{desc}</div>
      </div>
    </div>
  );
}
