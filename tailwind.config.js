/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                blue: {
                    DEFAULT: '#3b82f6',
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    600: '#2563eb',
                    foreground: '#ffffff'
                },
                teal: {
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                },
                purple: {
                    50: '#faf5ff',
                    600: '#9333ea',
                    700: '#7e22ce',
                },
                pink: {
                    100: '#fce7f3',
                    200: '#fbcfe8',
                    400: '#f472b6',
                    600: '#db2777',
                },
                yellow: {
                    100: '#fef3c7',
                    200: '#fde68a',
                },
                orange: {
                    200: '#fed7aa',
                    400: '#fb923c',
                    600: '#ea580c',
                },
                cyan: {
                    200: '#a5f3fc',
                },
                green: {
                    100: '#d1fae5',
                    700: '#047857',
                },
                emerald: {
                    200: '#a7f3d0',
                },
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                },
            }
        },
    },
    plugins: [],
}