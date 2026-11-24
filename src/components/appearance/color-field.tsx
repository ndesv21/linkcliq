"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <label className="relative block size-5 cursor-pointer overflow-hidden rounded-sm border shadow-xs" style={{ background: value }}>
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`${label} picker`} />
          </label>
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          value={value}
          maxLength={7}
          className="font-mono text-xs uppercase"
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`
            onChange(v)
          }}
        />
      </InputGroup>
    </Field>
  )
}
