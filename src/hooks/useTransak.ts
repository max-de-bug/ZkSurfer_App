// 'use client';
// import { useEffect, useRef, useCallback, useState } from 'react';
// import { TransakConfig, Transak } from '@transak/transak-sdk';

// // Define the exact User interface that matches Transak's expectations
// interface TransakUser {
//     firstName: string; // Required, not optional
//     lastName: string;  // Required, not optional
//     email: string;     // Required, not optional
//     mobileNumber: string; // Required, not optional
//     dob: string;       // Required, not optional (YYYY-MM-DD format)
//     address: {         // Required, not optional
//         addressLine1: string;
//         addressLine2: string;
//         city: string;
//         state: string;
//         postCode: string;
//         countryCode: string; // ISO 3166-1 alpha-2 country code
//     };
// }

// interface UseTransakProps {
//     apiKey: string;
//     environment: 'STAGING' | 'PRODUCTION';
//     walletAddress?: string;
//     userData?: TransakUser; // Can be undefined, but if provided, must be complete
//     defaultCryptoCurrency?: string;
//     defaultFiatCurrency?: string;
//     defaultFiatAmount?: number;
//     onOrderCreated?: (orderData: any) => void;
//     onOrderSuccessful?: (orderData: any) => void;
//     onWidgetClose?: () => void;
// }

// export const useTransak = ({
//     apiKey,
//     environment,
//     walletAddress,
//     userData,
//     defaultCryptoCurrency = 'SOL',
//     defaultFiatCurrency = 'USD',
//     defaultFiatAmount = 100,
//     onOrderCreated,
//     onOrderSuccessful,
//     onWidgetClose,
// }: UseTransakProps) => {
//     const transakRef = useRef<Transak | null>(null);
//     const [isLoaded, setIsLoaded] = useState(true); // SDK is loaded when imported
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const initTransak = useCallback(() => {
//         try {
//             setError(null);
//             setIsLoading(true);

//             if (transakRef.current) {
//                 transakRef.current.close();
//             }

//             const transakConfig: TransakConfig = {
//                 apiKey,
//                 environment: environment === 'PRODUCTION' ? Transak.ENVIRONMENTS.PRODUCTION : Transak.ENVIRONMENTS.STAGING,
//                 walletAddress,
//                 userData, // This should now work correctly
//                 defaultCryptoCurrency,
//                 defaultFiatCurrency,
//                 defaultFiatAmount,
//                 hideMenu: true,
//                 themeColor: '6366f1',
//                 widgetHeight: '550px',
//                 widgetWidth: '400px',
//                 isAutoFillUserData: !!userData,
//                 disableWalletAddressForm: !!walletAddress,
//             };

//             console.log('Creating Transak with config:', {
//                 ...transakConfig,
//                 apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT_SET'
//             });

//             const transak = new Transak(transakConfig);
//             transakRef.current = transak;

//             // Set up event listeners
//             Transak.on('*', (data) => {
//                 console.log('Transak Event:', data);
//             });

//             Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
//                 console.log('Transak widget closed');
//                 setIsLoading(false);
//                 onWidgetClose?.();
//             });

//             Transak.on(Transak.EVENTS.TRANSAK_ORDER_CREATED, (orderData) => {
//                 console.log('Transak order created:', orderData);
//                 setIsLoading(false);
//                 onOrderCreated?.(orderData);
//             });

//             Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
//                 console.log('Transak order successful:', orderData);
//                 setIsLoading(false);
//                 onOrderSuccessful?.(orderData);
//             });

//             return transak;
//         } catch (err) {
//             console.error('Error initializing Transak:', err);
//             setError(err instanceof Error ? err.message : 'Failed to initialize Transak');
//             setIsLoading(false);
//             return null;
//         }
//     }, [
//         apiKey,
//         environment,
//         walletAddress,
//         userData,
//         defaultCryptoCurrency,
//         defaultFiatCurrency,
//         defaultFiatAmount,
//         onOrderCreated,
//         onOrderSuccessful,
//         onWidgetClose,
//     ]);

//     const openTransak = useCallback(() => {
//         try {
//             setIsLoading(true);
//             const transak = initTransak();
//             if (transak) {
//                 transak.init();
//             }
//         } catch (err) {
//             console.error('Error opening Transak:', err);
//             setError(err instanceof Error ? err.message : 'Failed to open Transak');
//             setIsLoading(false);
//         }
//     }, [initTransak]);

//     const closeTransak = useCallback(() => {
//         try {
//             if (transakRef.current) {
//                 transakRef.current.close();
//                 transakRef.current = null;
//             }
//             setIsLoading(false);
//         } catch (err) {
//             console.error('Error closing Transak:', err);
//         }
//     }, []);

//     // Cleanup on unmount
//     useEffect(() => {
//         return () => {
//             closeTransak();
//         };
//     }, [closeTransak]);

//     return {
//         isLoaded,
//         isLoading,
//         error,
//         openTransak,
//         closeTransak,
//         transak: transakRef.current,
//     };
// };

// // Export the TransakUser type for use in other components
// export type { TransakUser };

'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { TransakConfig, Transak } from '@transak/transak-sdk';

interface TransakUser {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    dob: string;
    address: {
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        postCode: string;
        countryCode: string;
    };
}

interface UseTransakProps {
    apiKey: string;
    environment: 'STAGING' | 'PRODUCTION';
    walletAddress?: string;
    userData?: TransakUser;
    defaultCryptoCurrency?: string;
    defaultFiatCurrency?: string;
    defaultFiatAmount?: number;
    onOrderCreated?: (orderData: any) => void;
    onOrderSuccessful?: (orderData: any) => void;
    onWidgetClose?: () => void;
}

export const useTransak = ({
    apiKey,
    environment,
    walletAddress,
    userData,
    defaultCryptoCurrency = 'SOL',
    defaultFiatCurrency = 'USD',
    defaultFiatAmount = 100,
    onOrderCreated,
    onOrderSuccessful,
    onWidgetClose,
}: UseTransakProps) => {
    const transakRef = useRef<Transak | null>(null);
    const [isLoaded, setIsLoaded] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initTransak = useCallback(() => {
        try {
            setError(null);
            setIsLoading(true);

            if (transakRef.current) {
                transakRef.current.close();
            }

            const transakConfig: TransakConfig = {
                apiKey,
                environment: environment === 'PRODUCTION' ? Transak.ENVIRONMENTS.PRODUCTION : Transak.ENVIRONMENTS.STAGING,
                walletAddress,
                userData,
                defaultCryptoCurrency,
                defaultFiatCurrency,
                defaultFiatAmount,
                hideMenu: true,
                themeColor: '6366f1',
                widgetHeight: '550px',
                widgetWidth: '400px',
                isAutoFillUserData: !!userData,
                disableWalletAddressForm: !!walletAddress,
            };

            console.log('Creating Transak with config:', {
                ...transakConfig,
                apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT_SET'
            });

            const transak = new Transak(transakConfig);
            transakRef.current = transak;

            // Set up event listeners
            Transak.on('*', (data) => {
                console.log('Transak Event:', data);
            });

            Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
                console.log('Transak widget closed');
                setIsLoading(false);
                onWidgetClose?.();
            });

            Transak.on(Transak.EVENTS.TRANSAK_ORDER_CREATED, (orderData) => {
                console.log('Transak order created:', orderData);
                setIsLoading(false);
                onOrderCreated?.(orderData);
            });

            Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
                console.log('Transak order successful:', orderData);
                setIsLoading(false);
                onOrderSuccessful?.(orderData);
            });

            return transak;
        } catch (err) {
            console.error('Error initializing Transak:', err);
            setError(err instanceof Error ? err.message : 'Failed to initialize Transak');
            setIsLoading(false);
            return null;
        }
    }, [
        apiKey,
        environment,
        walletAddress,
        userData,
        defaultCryptoCurrency,
        defaultFiatCurrency,
        defaultFiatAmount,
        onOrderCreated,
        onOrderSuccessful,
        onWidgetClose,
    ]);

    const openTransak = useCallback(() => {
        try {
            setIsLoading(true);
            const transak = initTransak();
            if (transak) {
                transak.init();
            }
        } catch (err) {
            console.error('Error opening Transak:', err);
            setError(err instanceof Error ? err.message : 'Failed to open Transak');
            setIsLoading(false);
        }
    }, [initTransak]);

    const closeTransak = useCallback(() => {
        try {
            if (transakRef.current) {
                transakRef.current.close();
                transakRef.current = null;
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Error closing Transak:', err);
        }
    }, []);

    useEffect(() => {
        return () => {
            closeTransak();
        };
    }, [closeTransak]);

    return {
        isLoaded,
        isLoading,
        error,
        openTransak,
        closeTransak,
        transak: transakRef.current,
    };
};

export type { TransakUser };