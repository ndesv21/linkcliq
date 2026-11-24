"use client"

import { format } from "date-fns"
import { CalendarIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value: Date | null
  onChange: (value: Date | null) => void
  placeholder?: string
}) {
  const time = value ? format(value, "HH:mm") : "09:00"
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-40 flex-1 justify-start font-normal">
            <CalendarIcon />
            {value ? format(value, "EEE d MMM yyyy") : <span className="text-muted-foreground">{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(d) => {
              if (!d) return onChange(null)
              const [h, m] = time.split(":").map(Number)
              const next = new Date(d)
              next.setHours(h, m, 0, 0)
              onChange(next)
            }}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        className="h-7 w-24"
        value={time}
        disabled={!value}
        onChange={(e) => {
          if (!value || !e.target.value) return
          const [h, m] = e.target.value.split(":").map(Number)
          const next = new Date(value)
          next.setHours(h, m, 0, 0)
          onChange(next)
        }}
      />
      {value && (
        <Button variant="ghost" size="icon-sm" onClick={() => onChange(null)} aria-label="Clear">
          <XIcon />
        </Button>
      )}
    </div>
  )
}
