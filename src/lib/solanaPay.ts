import BigNumber from 'bignumber.js';
import { encodeURL, findReference, validateTransfer } from '@solana/pay';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT
    ?? 'https://solana-api.projectserum.com';

const connection = new Connection(RPC_ENDPOINT, 'confirmed');
// const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
const MERCHANT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS!);
const USDC_MINT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_USDC_MINT_ADDRESS!);

// build the URL exactly as before
export function buildSolanaPayURL(
    amount: number,
    reference: PublicKey,
    splToken = USDC_MINT_ADDRESS
) {
    return encodeURL({
        recipient: MERCHANT_ADDRESS,
        amount: new BigNumber(amount),
        splToken,
        reference,
        label: 'ZkTerminal Newsroom Subscription',
        message: `Subscribe for $${amount}`,
        memo: `sub-${amount}-${reference.toBase58()}`,
    });
}

// now accept the expected USD amount
export async function waitForSolanaPay(
    reference: PublicKey,
    expectedAmount: number
) {
    // 1) wait until the tx shows up on‐chain
    const refInfo = await findReference(connection, reference, { finality: 'confirmed' });
    const signature = typeof refInfo === 'string' ? refInfo : refInfo.signature;
    console.log(`✅ SIGNATURE FOUND: ${signature}`);

    const info = await connection.getTransaction(signature);
    console.dir(info, { depth: null, colors: true });

    try {
        const transaction = await connection.getTransaction(signature, {
            commitment: 'confirmed'
        });

        if (!transaction) {
            throw new Error('Transaction details not found');
        }

        // The first account is usually the payer (fee payer)
        const payerWallet = transaction.transaction.message.accountKeys[0].toBase58();

        console.log(`💰 PAYER WALLET: ${payerWallet}`);
        console.log(`🔗 View on Solscan: https://solscan.io/tx/${signature}`);

        return {
            signature,
            payerWallet,
            amount: expectedAmount,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Failed to get payer address:', error);
        // Return signature anyway, but without payer info
        return {
            signature,
            payerWallet: null,
            amount: expectedAmount,
            timestamp: new Date().toISOString()
        };
    }

    //  return { signature, info };

}
