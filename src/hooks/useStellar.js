import { useState, useCallback } from 'react';
import {
    Networks,
    Horizon,
    TransactionBuilder,
    Operation,
    Asset,
    Memo,
    BASE_FEE,
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const server = new Horizon.Server(HORIZON_URL);

function xlmBalance(account) {
    const native = account.balances.find((b) => b.asset_type === 'native');
    return native ? parseFloat(native.balance).toFixed(7) : '0.0000000';
}

function isValidPublicKey(key) {
    return typeof key === 'string' && /^G[A-Z2-7]{55}$/.test(key);
}

export function useStellar() {
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [balanceError, setBalanceError] = useState(null);
    const [balanceResult, setBalanceResult] = useState(null);

    const [sending, setSending] = useState(false);
    const [txResult, setTxResult] = useState(null);

    /* ─── Fetch balance for ANY public key ─── */
    const fetchBalance = useCallback(async (publicKey) => {
        setBalanceError(null);
        setBalanceResult(null);

        if (!publicKey || !isValidPublicKey(publicKey.trim())) {
            setBalanceError('Invalid Stellar public key. Must start with G and be 56 characters long.');
            return;
        }

        setBalanceLoading(true);
        try {
            const account = await server.loadAccount(publicKey.trim());
            setBalanceResult({ publicKey: publicKey.trim(), balance: xlmBalance(account) });
        } catch (err) {
            if (err.response?.status === 404) {
                setBalanceError('Account not found on testnet. Fund it via Friendbot first.');
            } else {
                setBalanceError(err.message || 'Failed to fetch balance.');
            }
        } finally {
            setBalanceLoading(false);
        }
    }, []);

    const clearBalance = useCallback(() => {
        setBalanceResult(null);
        setBalanceError(null);
    }, []);

    /* ─── Send XLM ─── */
    const sendXLM = useCallback(async ({ fromPublicKey, toPublicKey, amount, memo }) => {
        setTxResult(null);
        setSending(true);

        try {
            if (!isValidPublicKey(fromPublicKey)) throw new Error('Your wallet address is invalid.');
            if (!isValidPublicKey(toPublicKey.trim())) throw new Error('Destination address is invalid.');
            if (fromPublicKey === toPublicKey.trim()) throw new Error('Cannot send XLM to yourself.');

            const amount_ = parseFloat(amount);
            if (isNaN(amount_) || amount_ <= 0) throw new Error('Amount must be a positive number.');

            const sourceAccount = await server.loadAccount(fromPublicKey);
            const sourceBalance = parseFloat(xlmBalance(sourceAccount));
            const minReserve = 1.5;
            if (amount_ + minReserve > sourceBalance) {
                throw new Error(
                    `Insufficient balance. You have ${sourceBalance} XLM. ` +
                    `Need ${(amount_ + minReserve).toFixed(7)} XLM (including minimum reserve).`
                );
            }

            let txBuilder = new TransactionBuilder(sourceAccount, {
                fee: BASE_FEE,
                networkPassphrase: NETWORK_PASSPHRASE,
            }).addOperation(
                Operation.payment({
                    destination: toPublicKey.trim(),
                    asset: Asset.native(),
                    amount: amount_.toFixed(7),
                })
            ).setTimeout(180);

            if (memo && memo.trim()) {
                txBuilder = txBuilder.addMemo(Memo.text(memo.trim().slice(0, 28)));
            }

            const tx = txBuilder.build();
            const xdr = tx.toEnvelope().toXDR('base64');

            // Sign via Freighter v6 — returns { signedTxXdr, signerAddress, error? }
            const signedRes = await signTransaction(xdr, {
                networkPassphrase: NETWORK_PASSPHRASE,
            });

            if (signedRes?.error) {
                const msg = typeof signedRes.error === 'string'
                    ? signedRes.error
                    : signedRes.error?.message || 'Signing cancelled.';
                throw new Error(msg);
            }

            const signedXdr = signedRes?.signedTxXdr;
            if (!signedXdr) throw new Error('Transaction signing failed or was cancelled in Freighter.');

            // Rebuild and submit
            const { TransactionBuilder: TxB } = await import('@stellar/stellar-sdk');
            const signedTx = TxB.fromXDR(signedXdr, NETWORK_PASSPHRASE);
            const result = await server.submitTransaction(signedTx);

            setTxResult({ success: true, hash: result.hash });
        } catch (err) {
            const msg =
                err?.response?.data?.extras?.result_codes?.transaction ||
                err?.response?.data?.extras?.result_codes?.operations?.[0] ||
                err.message ||
                'Transaction failed.';
            setTxResult({ success: false, error: msg });
        } finally {
            setSending(false);
        }
    }, []);

    const clearTxResult = useCallback(() => setTxResult(null), []);

    return {
        fetchBalance, clearBalance,
        balanceLoading, balanceError, balanceResult,
        sendXLM, clearTxResult,
        sending, txResult,
    };
}
