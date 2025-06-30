
// import {
//   FKConfig,
//   ThemeName,
//   SourceConnectorName,
// } from '@aarc-xyz/fundkit-web-sdk';

// /**
//  * Returns a fully-formed FKConfig ready to feed into AarcFundKitModal.
//  */
// export function createFundKitConfig(
//   apiKey: string,
//   amountUsd: number,
//   receivingWallet: string
// ): FKConfig {
//   return {
//     appName: 'Your Dapp Name',               // ← replace with your app’s actual name
//     module: {
//       exchange: {
//         enabled: false,
//       },
//       onRamp: {
//         enabled: true,
//         onRampConfig: {
//           customerId: `user-${Date.now()}`,  // unique per user/session
//           exchangeScreenTitle: `Deposit $${amountUsd}`,
//         },
//       },
//       bridgeAndSwap: {
//         enabled: true,
//         fetchOnlyDestinationBalance: false,
//         routeType: 'Value',
//         connectors: [SourceConnectorName.ETHEREUM],
//       },
//     },
//     destination: {
//       walletAddress: receivingWallet,
//     },
//     appearance: {
//       roundness: 12,
//       theme: ThemeName.DARK,
//     },
//     apiKeys: {
//       aarcSDK: apiKey,
//     },
//     events: {
//       // these are placeholders – you’ll override most of these in your modal
//       onTransactionSuccess: () => { },
//       onTransactionError: () => { },
//       onWidgetClose: () => { },
//       onWidgetOpen: () => { },
//     },
//     origin: typeof window !== 'undefined' ? window.location.origin : '',
//   };
// }

import {
  FKConfig,
  ThemeName,
  SourceConnectorName,
} from '@aarc-xyz/fundkit-web-sdk';


export function createFundKitConfig(
  apiKey: string,
  amountUsd: number,
  receivingWallet: string
): FKConfig {
  return {
    appName: 'Zkterminal',
    module: {
      exchange: {
        enabled: false,
      },
      onRamp: {
        enabled: true,
        onRampConfig: {
          customerId: `user-${Date.now()}`,
          exchangeScreenTitle: `Deposit $${amountUsd}`,
        },
      },
      bridgeAndSwap: {
        enabled: true,
        fetchOnlyDestinationBalance: false,
        routeType: 'Value',
        connectors: [SourceConnectorName.ETHEREUM],
      },
    },
    destination: {
      walletAddress: receivingWallet,
    },
    appearance: {
      roundness: 12,
      theme: ThemeName.DARK,
    },
    apiKeys: {
      aarcSDK: apiKey,
    },
    events: {
      onTransactionSuccess: () => { },
      onTransactionError: () => { },
      onWidgetClose: () => { },
      onWidgetOpen: () => { },
    },
    origin: typeof window !== 'undefined' ? window.location.origin : '',
  };
}
