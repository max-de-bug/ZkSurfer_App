// import withSerwist from "@serwist/next";

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   env: {
//     NEXT_PUBLIC_BASE_URL: "https://zynapse.zkagi.ai",
//     API_KEY: "zk-123321",
//     NEXT_PUBLIC_LIP_SYNC: process.env.NEXT_PUBLIC_LIP_SYNC,
//     NEXT_PUBLIC_LANDWOLF: process.env.NEXT_PUBLIC_LANDWOLF,
//     NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
//     NEXT_PUBLIC_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_IMG_TO_VIDEO,
//     NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
//     NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
//     NEXT_PUBLIC_PINATA_API_SECRET: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
//     NEXT_PUBLIC_PMP_PROGRAM_ID: process.env.NEXT_PUBLIC_PMP_PROGRAM_ID,
//     NEXT_PUBLIC_MISTRAL_MODEL: process.env.NEXT_PUBLIC_MISTRAL_MODEL,
//     NEXT_PUBLIC_DEEPSEEK_BASE_URL: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL,
//     NEXT_PUBLIC_DEEPSEEK_MODEL: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL,
//     NEXT_PUBLIC_OPENAI_BASE_URL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
//     NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//     NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT:
//       process.env.NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT,
//     NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT:
//       process.env.NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT,
//     NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT:
//       process.env.NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT,
//     NEXT_PUBLIC_SOL_PRICE_ENDPOINT: process.env.NEXT_PUBLIC_SOL_PRICE_ENDPOINT,
//     NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT:
//       process.env.NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT,
//     NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT:
//       process.env.NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT,
//     NEXT_PUBLIC_TREASURY: process.env.NEXT_PUBLIC_TREASURY,
//     NEXT_PUBLIC_CENTRAL_WALLET_SECRET: process.env.NEXT_PUBLIC_CENTRAL_WALLET_SECRET,
//   },
//   experimental: {
//     // Loosen ESM externals handling
//     esmExternals: "loose",
//   },
//   // Force Next.js to compile these packages as part of your code
//   transpilePackages: [
//     "@3land/listings-sdk",
//     "node-fetch",
//     "solana-agent-kit",
//   ],
// };

// const serwistConfig = withSerwist({
//   swSrc: "app/sw.ts",
//   swDest: "public/sw.js",
// });

// // Merge both configs
// export default {
//   ...nextConfig,
//   ...serwistConfig,
// };

import withSerwist from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // i18n: {
  //   locales: ["en", "ko"],
  //   defaultLocale: "en",
  //   localeDetection: true,
  // },
  env: {
    NEXT_PUBLIC_BASE_URL: "https://zynapse.zkagi.ai",
    API_KEY: "zk-123321",
    NEXT_PUBLIC_LIP_SYNC: process.env.NEXT_PUBLIC_LIP_SYNC,
    NEXT_PUBLIC_LANDWOLF: process.env.NEXT_PUBLIC_LANDWOLF,
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_IMG_TO_VIDEO,
    NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
    NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
    NEXT_PUBLIC_PINATA_API_SECRET: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
    NEXT_PUBLIC_PMP_PROGRAM_ID: process.env.NEXT_PUBLIC_PMP_PROGRAM_ID,
    NEXT_PUBLIC_MISTRAL_MODEL: process.env.NEXT_PUBLIC_MISTRAL_MODEL,
    NEXT_PUBLIC_DEEPSEEK_BASE_URL: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL,
    NEXT_PUBLIC_DEEPSEEK_MODEL: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL,
    NEXT_PUBLIC_OPENAI_BASE_URL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT:
      process.env.NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT,
    NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT:
      process.env.NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT,
    NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT:
      process.env.NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT,
    NEXT_PUBLIC_SOL_PRICE_ENDPOINT: process.env.NEXT_PUBLIC_SOL_PRICE_ENDPOINT,
    NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT:
      process.env.NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT,
    NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT:
      process.env.NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT,
    NEXT_PUBLIC_TREASURY: process.env.NEXT_PUBLIC_TREASURY,
    NEXT_PUBLIC_CENTRAL_WALLET_SECRET:
      process.env.NEXT_PUBLIC_CENTRAL_WALLET_SECRET,
    NEXT_PUBLIC_VIDEO_LIPSYNC: process.env.NEXT_PUBLIC_VIDEO_LIPSYNC,
    NEXT_PUBLIC_VOICE_CLONE: process.env.NEXT_PUBLIC_VOICE_CLONE,
    NEXT_PUBLIC_SWAP_AUTOMATE:process.env.NEXT_PUBLIC_SWAP_AUTOMATE,
    NEXT_PUBLIC_SWAP_AUTHENTICATE:process.env.NEXT_PUBLIC_SWAP_AUTHENTICATE
  },
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: ["@3land/listings-sdk", "node-fetch", "solana-agent-kit"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from bundling native .node files. These should be loaded by Node.js at runtime.
      config.externals.push(({ request }, callback) => {
        if (request && request.endsWith(".node")) {
          return callback(null, "commonjs " + request);
        }
        callback();
      });
    }
    return config;
  },
};

const serwistConfig = withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

// Merge both configurations and export
const config = {
  ...nextConfig,
  ...serwistConfig,
};

export default config;
