import withSerwist from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_BASE_URL: "https://zynapse.zkagi.ai",
        API_KEY: "zk-123321",
        NEXT_PUBLIC_LIP_SYNC: process.env.NEXT_PUBLIC_LIP_SYNC ,
        // NEXT_PUBLIC_OPENAI_BASE_URL:NEXT_PUBLIC_OPENAI_BASE_URL,
        // NEXT_PUBLIC_OPENAI_API_KEY:NEXT_PUBLIC_OPENAI_API_KEY,
    },
};

const serwistConfig = withSerwist({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
});

export default {
    ...nextConfig,
    ...serwistConfig,
};
