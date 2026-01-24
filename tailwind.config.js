/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Premium Design System v2.0
        premium: {
          // Gradient stops
          black: "#000000",
          "gray-dark": "#1a1a1a",
          "gray-medium": "#2a2a2a",

          // Accent colors
          gold: "#D4AF37",
          "gold-dark": "#B8941F",
          emerald: "#10B981",
          ruby: "#DC2626",
          "ruby-dark": "#B91C1C",
          amber: "#F59E0B",
          slate: "#64748B",

          // Text hierarchy
          text: {
            primary: "#FFFFFF",
            secondary: "#A0A0A0",
            tertiary: "#6B6B6B",
            disabled: "#404040",
          },

          // Glass surfaces
          glass: {
            bg: "rgba(255, 255, 255, 0.03)",
            border: "rgba(255, 255, 255, 0.08)",
            hover: "rgba(255, 255, 255, 0.06)",
            active: "rgba(255, 255, 255, 0.10)",
          },
        },
        // Status colors (optimized for accessibility)
        status: {
          safe: "#10B981",
          "safe-bg": "rgba(16, 185, 129, 0.15)",
          "safe-border": "rgba(16, 185, 129, 0.3)",

          unsafe: "#DC2626",
          "unsafe-bg": "rgba(220, 38, 38, 0.15)",
          "unsafe-border": "rgba(220, 38, 38, 0.3)",

          modify: "#F59E0B",
          "modify-bg": "rgba(245, 158, 11, 0.15)",
          "modify-border": "rgba(245, 158, 11, 0.3)",

          unknown: "#64748B",
          "unknown-bg": "rgba(100, 116, 139, 0.15)",
          "unknown-border": "rgba(100, 116, 139, 0.3)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Premium design system
        xs: "4px",
        DEFAULT: "8px",
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        // Glassmorphism shadows
        glass: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "glass-lg": "0 10px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",

        // Glow effects
        "glow-safe": "0 0 20px rgba(16, 185, 129, 0.3)",
        "glow-unsafe": "0 0 20px rgba(220, 38, 38, 0.3)",
        "glow-accent": "0 0 20px rgba(212, 175, 55, 0.3)",

        // Elevation levels
        1: "0 2px 4px rgba(0, 0, 0, 0.1)",
        2: "0 4px 6px rgba(0, 0, 0, 0.15)",
        3: "0 10px 20px rgba(0, 0, 0, 0.2)",
        4: "0 20px 40px rgba(0, 0, 0, 0.3)",
      },
      backdropBlur: {
        glass: "12px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
        "fade-in": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: 0, transform: "scale(0.95)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        glow: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        spotlight: "spotlight 2s ease .75s 1 forwards",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        glow: "glow 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "ease-out-cubic": "cubic-bezier(0.33, 1, 0.68, 1)",
        "ease-in-cubic": "cubic-bezier(0.32, 0, 0.67, 0)",
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}






