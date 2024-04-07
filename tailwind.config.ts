import shadcnPreset from "./lib/shadcn-preset";
import type { Config } from "tailwindcss";

export default {
  presets: [shadcnPreset],
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Geist", "sans-serif"],
      },
    },
  },
} satisfies Config;
