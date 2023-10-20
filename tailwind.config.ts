import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./app/**/*.tsx"],
  theme: {
    fontFamily: {
      sans: ["Inter", ...fontFamily.sans],
    },
  },
  plugins: [],
} satisfies Config;
