// Using local fonts from npm packages
import localFont from "next/font/local";

// Default Fonts
export const outfit = localFont({
    src: [
        {
            path: "../node_modules/@fontsource/outfit/files/outfit-latin-300-normal.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/outfit/files/outfit-latin-400-normal.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/outfit/files/outfit-latin-500-normal.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/outfit/files/outfit-latin-600-normal.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/outfit/files/outfit-latin-700-normal.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/outfit/files/outfit-latin-800-normal.woff2",
            weight: "800",
            style: "normal",
        },
    ],
    display: "swap",
    adjustFontFallback: false,
});

// Signature fonts
export const dancingScript = localFont({
    src: "../node_modules/@fontsource/dancing-script/files/dancing-script-latin-400-normal.woff2",
    weight: "400",
    variable: "--font-dancing-script",
    display: "swap",
});

export const parisienne = localFont({
    src: "../node_modules/@fontsource/parisienne/files/parisienne-latin-400-normal.woff2",
    weight: "400",
    variable: "--font-parisienne",
    display: "swap",
});

export const greatVibes = localFont({
    src: "../node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff2",
    weight: "400",
    variable: "--font-great-vibes",
    display: "swap",
});

export const alexBrush = localFont({
    src: "../node_modules/@fontsource/alex-brush/files/alex-brush-latin-400-normal.woff2",
    weight: "400",
    variable: "--font-alex-brush",
    display: "swap",
});
