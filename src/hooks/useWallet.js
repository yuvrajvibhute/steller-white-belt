import { useState, useEffect, useCallback } from 'react';
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
} from '@stellar/freighter-api';

/**
 * useWallet — Freighter API v6 compatible
 *
 * v6 return shapes:
 *   isConnected()   → { isConnected: boolean, error? }
 *   isAllowed()     → { isAllowed: boolean, error? }
 *   requestAccess() → { address: string, error? }
 *   getAddress()    → { address: string, error? }
 */
export function useWallet() {
  const [publicKey, setPublicKey] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [freighterInstalled, setFreighterInstalled] = useState(null);

  /* ── On mount: detect extension & auto-restore session ── */
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const connRes = await isConnected();
        if (cancelled) return;

        const installed = connRes?.isConnected === true || connRes?.isConnected === false;
        setFreighterInstalled(installed);

        if (!installed) return;

        // Check if this origin already has permission
        const allowedRes = await isAllowed();
        if (cancelled) return;

        if (allowedRes?.isAllowed === true) {
          const addrRes = await getAddress();
          if (cancelled) return;
          if (addrRes?.address && !addrRes?.error) {
            setPublicKey(addrRes.address);
          }
        }
      } catch {
        if (!cancelled) setFreighterInstalled(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  /* ── Connect ── */
  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);

    try {
      // 1. Confirm extension is present
      const connRes = await isConnected();
      if (!connRes || connRes.isConnected === undefined) {
        throw new Error(
          'Freighter extension not found. Install it from freighter.app then refresh this page.'
        );
      }

      // 2. Request access — opens the Freighter popup
      const accessRes = await requestAccess();

      // Error on deny / locked wallet
      if (accessRes?.error) {
        const msg = typeof accessRes.error === 'string'
          ? accessRes.error
          : accessRes.error?.message || 'Access denied.';

        if (/denied|rejected|cancel|user did not/i.test(msg)) {
          throw new Error(
            'Connection rejected. Please:\n' +
            '1. Click the Freighter icon in your toolbar and unlock it\n' +
            '2. Finish wallet setup if prompted\n' +
            '3. Click Connect Wallet again and approve the popup'
          );
        }
        throw new Error(msg);
      }

      // v6: address is in accessRes.address
      const address = accessRes?.address;
      if (!address || typeof address !== 'string' || address.trim() === '') {
        throw new Error(
          'Could not read wallet address. Make sure Freighter is:\n' +
          '• Fully set up (mnemonic confirmed)\n' +
          '• Unlocked\n' +
          '• Set to Testnet network'
        );
      }

      setPublicKey(address);
    } catch (err) {
      setError(err.message || 'Failed to connect. Please try again.');
    } finally {
      setConnecting(false);
    }
  }, []);

  /* ── Disconnect ── */
  const disconnect = useCallback(() => {
    setPublicKey(null);
    setError(null);
  }, []);

  return {
    publicKey,
    connecting,
    error,
    freighterInstalled,
    isConnectedWallet: !!publicKey,
    connect,
    disconnect,
  };
}
