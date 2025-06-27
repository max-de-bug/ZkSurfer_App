// types/transak.d.ts or transak.d.ts in your project root

interface TransakConfig {
    apiKey: string;
    environment: 'STAGING' | 'PRODUCTION';
    isBuyOrSell?: 'BUY' | 'SELL';
    fiatCurrency?: string;
    fiatAmount?: number;
    cryptoCurrency?: string;
    cryptoAmount?: number;
    walletAddress?: string;s
    receivingMethod?: 'bank_transfer' | 'crypto_wallet';
    partnerOrderId?: string;
    partnerCustomerId?: string;
    themeColor?: string;
    hideMenu?: boolean;
    disableWalletAddressForm?: boolean;
    webhookUrl?: string;
    product?: {
        name: string;
        description: string;
        amount?: number;
        currency?: string;
        expectedUsdAmount?: number;
    };
    metadata?: Record<string, any>;
    userData?: {
        email?: string;
        firstName?: string;
        lastName?: string;
    };
    bankDetails?: {
        accountNumber: string;
        accountName: string;
        routingNumber: string;
        bankCode?: string;
        swiftCode?: string;
        accountType: string;
        currency: string;
    };
    settlementPreferences?: {
        method: string;
        currency: string;
        schedule: string;
    };
}

interface TransakSDK {
    init(): void;
    on(event: TransakEventType, callback: (data: any) => void): void;
    close(): void;
}

type TransakEventType =
    | 'TRANSAK_ORDER_SUCCESSFUL'
    | 'TRANSAK_ORDER_FAILED'
    | 'TRANSAK_ORDER_CREATED'
    | 'TRANSAK_ORDER_PROCESSING'
    | 'TRANSAK_WIDGET_CLOSE';

interface TransakOrderData {
    status: {
        id: string;
        status: string;
    };
    userData?: {
        id?: string;
        email?: string;
    };
    fiatAmount?: number;
    cryptoAmount?: number;
    partnerOrderId?: string;
}

declare global {
    interface Window {
        TransakSDK: new (config: TransakConfig) => TransakSDK;
    }
}

export {
    TransakConfig,
    TransakSDK,
    TransakEventType,
    TransakOrderData
};