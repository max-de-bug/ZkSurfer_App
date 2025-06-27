"use client";

import React, { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AarcFundKitModal } from "@aarc-xyz/fundkit-web-sdk";
import { AarcEthWalletConnector } from "@aarc-xyz/eth-connector";
import { makeAarcConfig } from "@/lib/aarcConfig";

export function AarcConnector({ children }: { children: React.ReactNode }) {
    // ① get the Solana address
    const { publicKey } = useWallet();
    const customerId = publicKey?.toString() ?? "";

    // ② only build the modal once per address
    const aarcModal = useMemo(() => {
        if (!customerId) return null;
        return new AarcFundKitModal(makeAarcConfig(customerId));
    }, [customerId]);

    // ③ if no address yet, just render children unwrapped
    if (!aarcModal) {
        return <>{children}</>;
    }

    // ④ once we have an address, wrap in the Eth‐connector
    return (
        <AarcEthWalletConnector aarcWebClient={aarcModal}>
            {children}
        </AarcEthWalletConnector>
    );
}
