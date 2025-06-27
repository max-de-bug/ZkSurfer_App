// src/lib/aarcConfig.ts
import { FKConfig, ThemeName, SourceConnectorName } from "@aarc-xyz/fundkit-web-sdk";

// now we only strip out 'destination'—we keep 'module'
const _base: Omit<FKConfig, "destination"> = {
  appName: "ZkTerminal",
  apiKeys: { aarcSDK: process.env.NEXT_PUBLIC_AARC_API_KEY! },
  origin: typeof window !== "undefined" ? window.location.origin : "",
  module: {
    exchange: { enabled: false },
    onRamp: {
      enabled: true,
      onRampConfig: {
        exchangeScreenTitle: "Deposit funds in your wallet",
      },
    },
    bridgeAndSwap: { enabled: false },
  },
  appearance: { roundness: 8, theme: ThemeName.DARK },
  events: {
    onTransactionSuccess: (d) => console.log("Success:", d),
    onTransactionError: (e) => console.error("Error:", e),
    onWidgetOpen: () => console.log("Widget opened"),
    onWidgetClose: () => console.log("Widget closed"),
  },
};

// factory that injects both 'module' overrides and 'destination'
export function makeAarcConfig(customerId: string): FKConfig {
  return {
    ..._base,
    module: {
      ..._base.module!,
      onRamp: {
        ..._base.module!.onRamp!,
        onRampConfig: {
          ..._base.module!.onRamp!.onRampConfig,
          customerId,
        },
      },
    },
    destination: {
      walletAddress: customerId,
    },
  };
}

