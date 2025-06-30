'use client';

import { useRef } from 'react';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
import { AarcEthWalletConnector } from '@aarc-xyz/eth-connector';
import { createFundKitConfig } from '@/lib/aarcConfig';
import '@aarc-xyz/eth-connector/styles.css';

export default function AarcProvider({ children }: { children: React.ReactNode }) {
  // build a base Aarc config with a default amount (0) and your receiving wallet
  const aarcConfig = createFundKitConfig(
    process.env.NEXT_PUBLIC_AARC_API_KEY as string,
    0,
    process.env.NEXT_PUBLIC_RECEIVING_WALLET as string
  );

  // instantiate modal once
  const modalRef = useRef<AarcFundKitModal>(new AarcFundKitModal(aarcConfig));

  return (
    <AarcEthWalletConnector aarcWebClient={modalRef.current}>
      {children}
    </AarcEthWalletConnector>
  );
}
