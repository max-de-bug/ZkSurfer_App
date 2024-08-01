import type { Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";
import plugin from "tailwindcss/plugin";

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

function addVariablesForColors({ addBase, theme }: PluginAPI) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val as string])
  );

  addBase({
    ":root": newVars,
  });
}

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "animated-bg": "linear-gradient(45deg, #643ADE , #A4C8FF75)",
      },
      fontFamily: {
        ttfirs: ["TT Firs Neue", "sans-serif"],
        sourceCode: ["Source Code Pro", "sans-serif"],
      },
      colors: {
        zkIndigo: "#A4C8FF",
        zkIndigo60: "#A4C8FF75",
        zkLightPurple: "#A992ED",
        zkLightPurple120: "#8160E4CC",
        zkPurple: "#643ADE",
        zkLightRed: "#793698", ///#010921
        zkLightBlue: "#70A9FF",
        zkDarkBlue: "#040b27",
        zkDarkerBlue: "#272A4480",
        zkBlue: "#70A9FF4D",
        zkDarkPurple: "#7E83A9",
        zkBackground: "#010921",
        zkDarkBackground: "#12152B",
        zkDarkBackground50: "#12152B80",
        zkDarkerBackground: "#010921",
        zkNeonGreen: "#2AF698",
        zkLavender: "#5A49AC",
      },
      animation: {
        scroll:
          "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
        rotateBg: "rotateGradient 3s ease-in infinite",
      },
      keyframes: {
        scroll: {
          to: {
            transform: "translate(calc(-50% - 0.5rem))",
          },
        },
        rotateGradient: {
          "0%": {
            "background-image": "linear-gradient(0deg,#643ADE , #A4C8FF75)",
          },
          "100%": {
            "background-image": "linear-gradient(360deg,#643ADE , #A4C8FF75 )",
          },
        },
      },
      screens: {
        "3xl": "1792px",
        "4xl": "2048px",
      },
    },
  },
  plugins: [
    addVariablesForColors,
    plugin(function ({ matchUtilities, theme }: PluginAPI) {
      matchUtilities(
        {
          "bg-gradient": (angle: string) => ({
            "background-image": `linear-gradient(${angle}, var(--tw-gradient-stops))`,
          }),
        },
        {
          values: Object.assign(
            theme("bgGradientDeg", {}),
            {
              10: "10deg",
              15: "15deg",
              20: "20deg",
              25: "25deg",
              30: "30deg",
              45: "45deg",
              60: "60deg",
              90: "90deg",
              120: "120deg",
              135: "135deg",
            }
          ),
        }
      );
    }),
  ],
};

export default config;
