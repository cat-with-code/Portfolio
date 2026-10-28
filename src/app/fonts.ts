import { Inter, Noto_Sans_Khmer } from "next/font/google";
import localFont from "next/font/local";

// Shared by the site's root layout ([lang]) and the dashboard's.
const inter = Inter({ variable: "--font-latin", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
// Inter's arrows (← → ↗ …) are outside Google's "latin" subset; this tiny Inter subset covers them.
const interArrows = localFont({ src: "../fonts/inter-arrows.woff2", variable: "--font-arrows", weight: "400 700", display: "swap", adjustFontFallback: false });
const notoKhmer = Noto_Sans_Khmer({ variable: "--font-khmer", subsets: ["khmer"], weight: ["400", "500", "600"] });

export const fontVariables = `${interArrows.variable} ${inter.variable} ${notoKhmer.variable}`;

// Runs before paint so the saved theme and sidebar state never flash.
// Default is Light, matching the prototype; System follows the device.
export const bootScript = `(function(){var r=document.documentElement;try{var m=localStorage.getItem("theme")||"light";r.dataset.themeMode=m;if(m==="system"){delete r.dataset.theme}else{r.dataset.theme=m}if(localStorage.getItem("sidebar")==="collapsed")r.dataset.sidebar="collapsed"}catch(e){}})()`;
