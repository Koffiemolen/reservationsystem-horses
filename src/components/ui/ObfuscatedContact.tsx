'use client'

import { useEffect, useState } from 'react'

interface ObfuscatedContactProps {
  /** Parts of the value to join at runtime, e.g. ['stichtingderaam', '@', 'live.nl'] */
  parts: string[]
  /** 'email' renders a mailto: link, 'phone' renders a tel: link, 'text' renders plain text */
  type: 'email' | 'phone' | 'text'
  /** Optional display text (if different from the assembled value) */
  display?: string
  className?: string
}

/**
 * Renders contact info (email/phone) that is assembled at runtime via JavaScript.
 * Scrapers that don't execute JS will not see the real values.
 */
export function ObfuscatedContact({ parts, type, display, className }: ObfuscatedContactProps) {
  const [value, setValue] = useState<string | null>(null)

  useEffect(() => {
    setValue(parts.join(''))
  }, [parts])

  if (!value) {
    return <span className={className}>Laden...</span>
  }

  const displayText = display || value

  if (type === 'email') {
    return (
      <a href={`mailto:${value}`} className={className}>
        {displayText}
      </a>
    )
  }

  if (type === 'phone') {
    const telValue = value.replace(/[\s–\-\/]/g, '')
    return (
      <a href={`tel:${telValue}`} className={className}>
        {displayText}
      </a>
    )
  }

  return <span className={className}>{displayText}</span>
}
