// src/lib/fundkit.ts
import type {
    FKConfig,
    ThemeName
} from '@aarc-xyz/fundkit-web-sdk';

export function createFundKitConfig(
    apiKey: string,
    usdAmount: number,
    planName: string,
    receivingWallet: string
): FKConfig {
    return {
        appName: planName,
        apiKeys: { aarcSDK: apiKey },
        module: {
            onRamp: {
                enabled: true,
                onRampConfig: {
                    customerId: `user-${Date.now()}`,
                    exchangeScreenTitle: `Buy ${usdAmount} USDC`
                }
            },
            exchange: { enabled: false },
            bridgeAndSwap: { enabled: false }
        },
        destination: {
            walletAddress: receivingWallet
        },
        // appearance: {
        //     theme: ThemeName.DARK,
        //     roundness: 8
        // },
        events: {
            onTransactionSuccess: () => { },
            onTransactionError: () => { },
            onWidgetOpen: () => { },
            onWidgetClose: () => { }
        },
        origin: window.location.origin
    };
}
