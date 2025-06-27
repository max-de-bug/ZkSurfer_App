// // utils/transak-utils.ts

// // Transak SDK Configuration Types
// export interface CustomTransakConfig {
//     apiKey: string;
//     environment: 'STAGING' | 'PRODUCTION';
//     fiatCurrency?: string;
//     fiatAmount?: number;
//     cryptoCurrency?: string;
//     cryptoAmount?: number;
//     isBuyOrSell?: 'BUY' | 'SELL';
//     walletAddress?: string;
//     receivingMethod?: 'bank_transfer' | 'crypto_wallet';
//     bankDetails?: {
//         accountNumber: string;
//         accountName: string;
//         routingNumber: string;
//         bankCode?: string;
//         swiftCode?: string;
//         accountType: string;
//         currency: string;
//     };
//     partnerOrderId?: string;
//     partnerCustomerId?: string;
//     themeColor?: string;
//     hideMenu?: boolean;
//     disableWalletAddressForm?: boolean;
//     webhookUrl?: string;
//     product?: {
//         name: string;
//         description: string;
//         amount?: number;
//         currency?: string;
//         expectedUsdAmount?: number;
//     };
//     metadata?: Record<string, any>;
//     settlementPreferences?: {
//         method: string;
//         currency: string;
//         schedule: string;
//     };
//     userData?: {
//         email?: string;
//         firstName?: string;
//         lastName?: string;
//     };
// }

// // Transak SDK Event Types
// export type TransakEventType =
//     | 'TRANSAK_ORDER_SUCCESSFUL'
//     | 'TRANSAK_ORDER_FAILED'
//     | 'TRANSAK_ORDER_CREATED'
//     | 'TRANSAK_ORDER_PROCESSING'
//     | 'TRANSAK_WIDGET_CLOSE';

// // Transak SDK Class Interface
// export interface TransakSDK {
//     init(): void;
//     on(event: TransakEventType, callback: (data: any) => void): void;
//     close(): void;
// }

// // Global Window Interface for Transak
// declare module globalThis {
//     var TransakSDK: new (config: CustomTransakConfig) => TransakSDK;
// }

// // Transak SDK Loader
// export class TransakSDKLoader {
//     private static instance: TransakSDKLoader;
//     private isLoaded = false;
//     private isLoading = false;

//     static getInstance(): TransakSDKLoader {
//         if (!TransakSDKLoader.instance) {
//             TransakSDKLoader.instance = new TransakSDKLoader();
//         }
//         return TransakSDKLoader.instance;
//     }

//     async loadSDK(): Promise<void> {
//         if (this.isLoaded) return;

//         if (this.isLoading) {
//             // Wait for the current loading to complete
//             return new Promise((resolve) => {
//                 const checkLoaded = () => {
//                     if (this.isLoaded) {
//                         resolve();
//                     } else {
//                         setTimeout(checkLoaded, 100);
//                     }
//                 };
//                 checkLoaded();
//             });
//         }

//         this.isLoading = true;

//         try {
//             // Check if SDK is already loaded
//             if (window.TransakSDK) {
//                 this.isLoaded = true;
//                 this.isLoading = false;
//                 return;
//             }

//             // Load SDK script
//             const script = document.createElement('script');
//             script.src = 'https://global.transak.com/sdk/v1.2/widget.js';
//             script.async = true;

//             await new Promise<void>((resolve, reject) => {
//                 script.onload = () => {
//                     this.isLoaded = true;
//                     this.isLoading = false;
//                     resolve();
//                 };
//                 script.onerror = () => {
//                     this.isLoading = false;
//                     reject(new Error('Failed to load Transak SDK'));
//                 };
//                 document.head.appendChild(script);
//             });

//             // Verify SDK is available
//             if (!window.TransakSDK) {
//                 throw new Error('Transak SDK not available after loading');
//             }

//         } catch (error) {
//             this.isLoading = false;
//             throw error;
//         }
//     }

//     createTransakInstance(config: CustomTransakConfig): TransakSDK {
//         if (!window.TransakSDK) {
//             throw new Error('Transak SDK not loaded. Call loadSDK() first.');
//         }
//         return new window.TransakSDK(config);
//     }
// }

// // Helper function to initialize Transak for fiat payments
// export async function initTransakFiatPayment(config: Omit<CustomTransakConfig, 'isBuyOrSell'>): Promise<TransakSDK> {
//     const loader = TransakSDKLoader.getInstance();
//     await loader.loadSDK();

//     const transakConfig: CustomTransakConfig = {
//         ...config,
//         isBuyOrSell: 'SELL', // For fiat-to-bank transfer
//         receivingMethod: 'bank_transfer',
//     };

//     return loader.createTransakInstance(transakConfig);
// }

// // Helper function to initialize Transak for crypto payments
// export async function initTransakCryptoPayment(config: Omit<CustomTransakConfig, 'isBuyOrSell'>): Promise<TransakSDK> {
//     const loader = TransakSDKLoader.getInstance();
//     await loader.loadSDK();

//     const transakConfig: CustomTransakConfig = {
//         ...config,
//         isBuyOrSell: 'SELL', // For crypto-to-fiat conversion
//         receivingMethod: 'bank_transfer',
//     };

//     return loader.createTransakInstance(transakConfig);
// }

// // Environment configuration
// export function getTransakConfig() {
//     return {
//         apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || '',
//         environment: (process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING') as 'STAGING' | 'PRODUCTION',
//         bankDetails: {
//             accountNumber: process.env.BUSINESS_ACCOUNT_NUMBER || '',
//             accountName: process.env.BUSINESS_ACCOUNT_NAME || '',
//             routingNumber: process.env.BUSINESS_ROUTING_NUMBER || '',
//             bankCode: process.env.BUSINESS_BANK_CODE || '',
//             swiftCode: process.env.BUSINESS_SWIFT_CODE || '',
//             accountType: 'business',
//             currency: 'USD'
//         }
//     };
// }

// utils/transak-utils.ts

// Custom Transak SDK Configuration Types (renamed to avoid conflict)
export interface CustomTransakConfig {
    apiKey: string;
    environment: 'STAGING' | 'PRODUCTION';
    fiatCurrency?: string;
    fiatAmount?: number;
    cryptoCurrency?: string;
    cryptoAmount?: number;
    isBuyOrSell?: 'BUY' | 'SELL';
    walletAddress?: string;
    receivingMethod?: 'bank_transfer' | 'crypto_wallet';
    bankDetails?: {
        accountNumber: string;
        accountName: string;
        routingNumber: string;
        bankCode?: string;
        swiftCode?: string;
        accountType: string;
        currency: string;
    };
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
    settlementPreferences?: {
        method: string;
        currency: string;
        schedule: string;
    };
    userData?: {
        email?: string;
        firstName?: string;
        lastName?: string;
    };
}

// Transak SDK Event Types
export type TransakEventType =
    | 'TRANSAK_ORDER_SUCCESSFUL'
    | 'TRANSAK_ORDER_FAILED'
    | 'TRANSAK_ORDER_CREATED'
    | 'TRANSAK_ORDER_PROCESSING'
    | 'TRANSAK_WIDGET_CLOSE';

// Transak SDK Class Interface
export interface TransakSDK {
    init(): void;
    on(event: TransakEventType, callback: (data: any) => void): void;
    close(): void;
}

// Import the official TransakConfig from types
import { TransakConfig } from '../types/transak';

// Global Window Interface for Transak
declare global {
    interface Window {
        TransakSDK: new (config: TransakConfig) => TransakSDK;
    }
}

// Transak SDK Loader
export class TransakSDKLoader {
    private static instance: TransakSDKLoader;
    private isLoaded = false;
    private isLoading = false;

    static getInstance(): TransakSDKLoader {
        if (!TransakSDKLoader.instance) {
            TransakSDKLoader.instance = new TransakSDKLoader();
        }
        return TransakSDKLoader.instance;
    }

    async loadSDK(): Promise<void> {
        if (this.isLoaded) return;

        if (this.isLoading) {
            // Wait for the current loading to complete
            return new Promise<void>((resolve) => {
                const checkLoaded = () => {
                    if (this.isLoaded) {
                        resolve();
                    } else {
                        setTimeout(checkLoaded, 100);
                    }
                };
                checkLoaded();
            });
        }

        this.isLoading = true;

        try {
            // Check if SDK is already loaded
            if (window.TransakSDK) {
                this.isLoaded = true;
                this.isLoading = false;
                return;
            }

            // Load SDK script
            const script = document.createElement('script');
            script.src = 'https://global.transak.com/sdk/v1.2/widget.js';
            script.async = true;

            await new Promise<void>((resolve, reject) => {
                script.onload = () => {
                    this.isLoaded = true;
                    this.isLoading = false;
                    resolve();
                };
                script.onerror = () => {
                    this.isLoading = false;
                    reject(new Error('Failed to load Transak SDK'));
                };
                document.head.appendChild(script);
            });

            // Verify SDK is available
            if (!window.TransakSDK) {
                throw new Error('Transak SDK not available after loading');
            }

        } catch (error) {
            this.isLoading = false;
            throw error;
        }
    }

    // Helper function to convert CustomTransakConfig to official TransakConfig
    private convertConfig(customConfig: CustomTransakConfig): TransakConfig {
        // Map your custom config to the official TransakConfig structure
        // You'll need to adjust this based on what the official TransakConfig expects
        return {
            ...customConfig,
            // Add the required 's' property - you'll need to determine what this should be
            // Common possibilities: 's' could be 'staging'/'production', 'success', 'sandbox', etc.
            s: customConfig.environment?.toLowerCase() || 'staging', // or whatever 's' represents
            // Add any other missing required properties from the official TransakConfig
        } as TransakConfig;
    }

    createTransakInstance(config: CustomTransakConfig): TransakSDK {
        if (!window.TransakSDK) {
            throw new Error('Transak SDK not loaded. Call loadSDK() first.');
        }

        // Convert your custom config to the official format
        const officialConfig = this.convertConfig(config);
        return new window.TransakSDK(officialConfig);
    }
}

// Helper function to initialize Transak for fiat payments
export async function initTransakFiatPayment(config: Omit<CustomTransakConfig, 'isBuyOrSell'>): Promise<TransakSDK> {
    const loader = TransakSDKLoader.getInstance();
    await loader.loadSDK();

    const transakConfig: CustomTransakConfig = {
        ...config,
        isBuyOrSell: 'SELL', // For fiat-to-bank transfer
        receivingMethod: 'bank_transfer',
    };

    return loader.createTransakInstance(transakConfig);
}

// Helper function to initialize Transak for crypto payments
export async function initTransakCryptoPayment(config: Omit<CustomTransakConfig, 'isBuyOrSell'>): Promise<TransakSDK> {
    const loader = TransakSDKLoader.getInstance();
    await loader.loadSDK();

    const transakConfig: CustomTransakConfig = {
        ...config,
        isBuyOrSell: 'SELL', // For crypto-to-fiat conversion
        receivingMethod: 'bank_transfer',
    };

    return loader.createTransakInstance(transakConfig);
}

// Environment configuration
export function getTransakConfig(): Partial<CustomTransakConfig> {
    return {
        apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || '',
        environment: (process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING') as 'STAGING' | 'PRODUCTION',
        bankDetails: {
            accountNumber: process.env.BUSINESS_ACCOUNT_NUMBER || '',
            accountName: process.env.BUSINESS_ACCOUNT_NAME || '',
            routingNumber: process.env.BUSINESS_ROUTING_NUMBER || '',
            bankCode: process.env.BUSINESS_BANK_CODE || '',
            swiftCode: process.env.BUSINESS_SWIFT_CODE || '',
            accountType: 'business',
            currency: 'USD'
        }
    };
}