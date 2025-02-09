// import { create } from 'zustand';

// interface WhitelistState {
//   isWhitelisted: boolean | null;
//   setWhitelist: (value: boolean) => void;
//   checkWhitelist: (walletAddress: string) => Promise<void>;
// }

// export const useWhitelistStore = create<WhitelistState>((set) => ({
//   isWhitelisted: null,
//   setWhitelist: (value: boolean) => set({ isWhitelisted: value }),
//   checkWhitelist: async (walletAddress: string) => {
//     try {
//       const response = await fetch('http://47.80.4.197:30195/checkwhitelist', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ wallet: walletAddress }),
//       });
//       const data = await response.json();
//       // Account for both boolean and string responses
//       const whitelisted = data.whitelisted === true || data.whitelisted === 'true';
//       set({ isWhitelisted: whitelisted });
//     } catch (error) {
//       console.error('Error checking whitelist:', error);
//       set({ isWhitelisted: false });
//     }
//   },
// }));

import { create } from 'zustand';

interface WhitelistState {
  isWhitelisted: boolean | null;
  setWhitelist: (value: boolean) => void;
  checkWhitelist: (walletAddress: string) => Promise<void>;
}

export const useWhitelistStore = create<WhitelistState>((set) => ({
  isWhitelisted: null,
  setWhitelist: (value: boolean) => set({ isWhitelisted: value }),
  checkWhitelist: async (walletAddress: string) => {
    try {
      // Call the internal API route instead of the external endpoint.
      const response = await fetch('/api/checkwhitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress }),
      });
      const data = await response.json();
      // Account for both boolean and string responses.
      const whitelisted = data.whitelisted === true || data.whitelisted === 'true';
      set({ isWhitelisted: whitelisted });
    } catch (error) {
      console.error('Error checking whitelist:', error);
      set({ isWhitelisted: false });
    }
  },
}));

