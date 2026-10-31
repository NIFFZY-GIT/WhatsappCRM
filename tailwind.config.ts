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
          tealDark: "#075E54",
          teal: "#128C7E",
          tealLight: "#25D366",
          green: "#25D366",
          greenDark: "#00A884",
          dark: "#111B21",
          darkPanel: "#202C33",
          darkHover: "#222E35",
          darkBorder: "#2A3942",
          light: "#F0F2F5",
          lightPanel: "#FFFFFF",
          border: "#E9EDEF",
          chatBg: "#EFEAE2",
          bubbleOut: "#D9FDD3",
          bubbleIn: "#FFFFFF",
          text: "#111B21",
          muted: "#667781",
        },
      },
    },
  },
  plugins: [],
};
export default config;
