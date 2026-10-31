import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          light: "#25D366",
          DEFAULT: "#128C7E",
          dark: "#075E54",
          teal: "#00a884",
          bg: "#EFEAE2",
          bubbleUser: "#E7FFDB",
          bubbleBot: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
