import { DM_Sans, Geist, Geist_Mono, Inter, JetBrains_Mono, Outfit, Playfair_Display, Space_Grotesk } from "next/font/google"

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", preload: false })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", preload: false })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", preload: false })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", preload: false })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", preload: false })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", preload: false })

export const fontVariables = [sans, mono, inter, dmSans, spaceGrotesk, outfit, playfair, jetbrains]
  .map((f) => f.variable)
  .join(" ")
