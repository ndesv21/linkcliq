"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function CopyButton({
  value,
  label,
  variant = "outline",
  size = "sm",
  className,
}: {
  value: string
  label?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      aria-label={label ?? "Copy"}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {label}
    </Button>
  )
}
