import { ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CopyButton } from "./copy-button"

export function SiteHeader({ title, pageUrl, actions }: { title: string; pageUrl: string; actions?: React.ReactNode }) {
  const display = pageUrl.replace(/^https?:\/\//, "")
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {actions}
          <div className="hidden items-center rounded-lg border bg-muted/40 pl-3 text-sm md:flex">
            <span className="max-w-56 truncate text-muted-foreground">{display}</span>
            <CopyButton value={pageUrl} variant="ghost" size="icon-sm" className="ml-1" />
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={pageUrl} target="_blank" rel="noreferrer" aria-label="Open page">
                <ExternalLinkIcon />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
