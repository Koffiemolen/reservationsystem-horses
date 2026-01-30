'use client'

import { format } from 'date-fns'
import { Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarBlock } from '@/types'

interface BlockIndicatorProps {
  block: CalendarBlock
  showTime?: boolean
  className?: string
}

export function BlockIndicator({ block, showTime = false, className }: BlockIndicatorProps) {
  const startTime = new Date(block.startTime)
  const endTime = new Date(block.endTime)

  return (
    <div
      className={cn(
        'h-full rounded-lg bg-destructive/20 border-2 border-destructive border-dashed p-2 overflow-hidden',
        className
      )}
    >
      <div className="flex items-center gap-1 text-destructive font-semibold">
        <Ban className="h-4 w-4" />
        <span>Geblokkeerd</span>
      </div>

      {showTime && (
        <div className="text-sm text-destructive/80 mt-1">
          {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
        </div>
      )}

      <div className="text-sm text-destructive/80 mt-1 truncate">
        {block.reason}
      </div>
    </div>
  )
}
