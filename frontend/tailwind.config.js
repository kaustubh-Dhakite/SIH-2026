/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode
        'light-bg-primary': '#ffffff',
        'light-bg-secondary': '#f8fafc',
        'light-bg-tertiary': '#f1f5f9',
        'light-text-primary': '#1e293b',
        'light-text-secondary': '#64748b',
        'light-border': '#e2e8f0',
        
        // Dark mode
        'dark-bg-primary': '#0f172a',
        'dark-bg-secondary': '#1e293b',
        'dark-bg-tertiary': '#334155',
        'dark-text-primary': '#f1f5f9',
        'dark-text-secondary': '#cbd5e1',
        'dark-border': '#475569',
        
        // Accent colors (same in both modes)
        'primary': '#0ea5e9',
        'secondary': '#06b6d4',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'monospace'],
      },
      borderRadius: {
        'card': '8px',
        'modal': '12px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.1)',
        'medium': '0 4px 6px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
