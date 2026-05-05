import type { Config } from "tailwindcss";

/**
 * Tokens repris à l'identique du site Olympe Production
 * (cf. styles.css, bloc :root). Pour modifier la charte plus tard,
 * il suffit de changer les valeurs ici ET dans app/globals.css.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        op: {
          accent: "#F15A24",
          bg: "#05051A",
          "bg-2": "#080A25",
          fg: "#FFFFFF",
          mute: "rgba(255,255,255,0.58)",
          line: "rgba(255,255,255,0.10)",
          "line-2": "rgba(255,255,255,0.18)",
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Times New Roman"', "serif"],
        sans: ['"Inter Tight"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        op: "4px",
        pill: "999px",
      },
      boxShadow: {
        "op-glow": "0 8px 24px -8px rgba(241,90,36,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset",
        "op-glow-hover":
          "0 14px 36px -8px rgba(241,90,36,0.7), 0 0 0 1px rgba(255,255,255,0.10) inset, 0 0 28px -4px rgba(241,90,36,0.5)",
        "op-modal": "0 30px 80px -10px rgba(0,0,0,0.7)",
      },
      letterSpacing: {
        eyebrow: "0.18em",
        eyebrowWide: "0.22em",
        title: "-0.018em",
        titleTight: "-0.025em",
      },
      animation: {
        "op-fadein": "op-fadein .6s both",
        "op-modal-in": "op-modal-in .45s cubic-bezier(.2,.7,.2,1)",
        "op-pop": "op-pop .5s cubic-bezier(.2,.7,.2,1.4)",
      },
      keyframes: {
        "op-fadein": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
        "op-modal-in": {
          from: { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
        "op-pop": {
          from: { transform: "scale(0.4)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
