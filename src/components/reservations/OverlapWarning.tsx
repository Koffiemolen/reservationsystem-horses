'use client'

import { AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { PURPOSE_LABELS } from '@/lib/utils'

interface OverlapInfo {
  startTime: string
  endTime: string
  purpose: string
}

interface OverlapWarningProps {
  overlaps: OverlapInfo[]
  acknowledged: boolean
  onAcknowledgeChange: (checked: boolean) => void
}

export function OverlapWarning({
  overlaps,
  acknowledged,
  onAcknowledgeChange,
}: OverlapWarningProps) {
  return (
    <Alert variant="default" className="border-orange-500 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertTitle className="text-orange-700">
        Er zijn al {overlaps.length} reservering{overlaps.length > 1 ? 'en' : ''} in
        deze periode
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p className="text-sm text-orange-700">
            De volgende tijdsloten overlappen met jouw reservering:
          </p>
          <ul className="text-sm space-y-1">
            {overlaps.map((overlap, index) => (
              <li key={index} className="text-orange-600">
                {format(new Date(overlap.startTime), 'HH:mm')} -{' '}
                {format(new Date(overlap.endTime), 'HH:mm')}{' '}
                ({PURPOSE_LABELS[overlap.purpose] || overlap.purpose})
              </li>
            ))}
          </ul>
          <div className="flex items-start space-x-2 mt-4 pt-2 border-t border-orange-200">
            <input
              type="checkbox"
              id="acknowledge-overlap"
              checked={acknowledged}
              onChange={(e) => onAcknowledgeChange(e.target.checked)}
              className="mt-1"
            />
            <Label
              htmlFor="acknowledge-overlap"
              className="text-sm font-normal text-orange-700 cursor-pointer"
            >
              Ik begrijp dat er al reserveringen zijn in deze periode en wil toch
              doorgaan met mijn reservering
            </Label>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
