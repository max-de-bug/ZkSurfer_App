import withSerwist from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_BASE_URL: "https://zynapse.zkagi.ai",
        API_KEY: "zk-123321",
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
