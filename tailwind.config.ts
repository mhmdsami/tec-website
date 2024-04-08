import type { Config } from "tailwindcss";
import shadcnPreset from "./lib/shadcn-preset";

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
