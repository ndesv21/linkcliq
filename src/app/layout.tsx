import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { appUrl } from "@/lib/env"
import { fontVariables } from "./fonts"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: "LinkCliq: open source link in bio with click tracking",
    template: "%s · LinkCliq",
  },
  description:
    "A free, self-hostable link in bio page with real click analytics and an in-app browser escape that sends TikTok and Instagram visitors to Safari or Chrome.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fontVariables} antialiased`}>
      <body className="min-h-svh">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster richColors position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
