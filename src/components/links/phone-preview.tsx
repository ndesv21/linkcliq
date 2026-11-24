"use client"

import { BioPage, type BioLink, type BioPageData } from "@/components/bio/bio-page"
import { cn } from "@/lib/utils"

export function PhonePreview({ page, links, className }: { page: BioPageData; links: BioLink[]; className?: string }) {
  return (
    <div className={cn("mx-auto w-[300px]", className)}>
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.6rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl ring-1 ring-black/10 dark:border-neutral-800">
        <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900 dark:bg-neutral-800" />
        <div className="h-full overflow-y-auto rounded-[2rem] [scrollbar-width:none]">
          <div className="flex min-h-[133.34%]" style={{ zoom: 0.75 }}>
            <BioPage page={page} links={links} mode="preview" className="min-h-full flex-1" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Live preview</p>
    </div>
  )
}
