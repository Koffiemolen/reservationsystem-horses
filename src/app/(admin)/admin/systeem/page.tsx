'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  Database,
  Mail,
  Shield,
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchWithCsrf } from '@/lib/utils'

interface SystemData {
  config: {
    environment: string
    emailProvider: string
    emailConfigured: boolean
    databaseType: string
    csrfEnabled: boolean
    rateLimitEnabled: boolean
  }
  info: {
    totalUsers: number
    totalReservations: number
    totalBlocks: number
    totalEvents: number
    totalAuditLogs: number
  }
  health: {
    database: {
      connected: boolean
      latencyMs: number
      error?: string
    }
  }
}

interface EmailTestResult {
  success: boolean
  provider: string
  mode: string
  timestamp: string
  error?: string
}

async function fetchSystemData(): Promise<SystemData> {
  const response = await fetch('/api/admin/system')
  if (!response.ok) throw new Error('Failed to fetch system data')
  return response.json()
}

function StatusIndicator({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {active ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className={active ? 'text-green-700' : 'text-red-600'}>{label}</span>
    </div>
  )
}

export default function SystemSettingsPage() {
  const [testEmail, setTestEmail] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [lastTestResult, setLastTestResult] = useState<EmailTestResult | null>(null)
  const [isTestingDb, setIsTestingDb] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-system'],
    queryFn: fetchSystemData,
  })

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error('Vul een e-mailadres in')
      return
    }

    setIsSendingTest(true)
    try {
      const response = await fetchWithCsrf('/api/admin/system/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      })

      if (response.status === 403) {
        toast.error('Beveiligingstoken verlopen. De pagina wordt herladen...')
        setTimeout(() => window.location.reload(), 2000)
        return
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        toast.error(
          retryAfter
            ? `Te veel verzoeken. Probeer over ${retryAfter} seconden opnieuw.`
            : 'Te veel verzoeken. Probeer het later opnieuw.'
        )
        return
      }

      const result: EmailTestResult = await response.json()
      setLastTestResult(result)

      if (result.success) {
        toast.success(`Test email succesvol verzonden naar ${testEmail}`)
      } else {
        toast.error(result.error || 'Fout bij verzenden test email')
      }
    } catch {
      toast.error('Fout bij verzenden test email')
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleTestDatabase = async () => {
    setIsTestingDb(true)
    try {
      await refetch()
      if (data?.health.database.connected) {
        toast.success(
          `Database verbinding succesvol (${data.health.database.latencyMs}ms)`
        )
      }
    } catch {
      toast.error('Database verbinding mislukt')
    } finally {
      setIsTestingDb(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Er is een fout opgetreden bij het laden van systeeminformatie.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Systeeminstellingen</h1>
        <p className="text-muted-foreground mt-1">
          Beheer systeemconfiguratie en test verbindingen
        </p>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuratiestatus
          </CardTitle>
          <CardDescription>
            Overzicht van systeemconfiguratie en beveiligingsinstellingen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Database Verbinding
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusIndicator
                      active={data?.health.database.connected ?? false}
                      label={data?.health.database.connected ? 'Verbonden' : 'Fout'}
                    />
                  </TableCell>
                  <TableCell>
                    {data?.config.databaseType} - {data?.health.database.latencyMs}ms
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-mail Configuratie
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusIndicator
                      active={data?.config.emailConfigured ?? false}
                      label={data?.config.emailConfigured ? 'Geconfigureerd' : 'Niet geconfigureerd'}
                    />
                  </TableCell>
                  <TableCell>{data?.config.emailProvider}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Omgeving
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={data?.config.environment === 'production' ? 'default' : 'secondary'}>
                      {data?.config.environment === 'production' ? 'Productie' : 'Ontwikkeling'}
                    </Badge>
                  </TableCell>
                  <TableCell>NODE_ENV: {data?.config.environment}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      CSRF Beveiliging
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusIndicator
                      active={data?.config.csrfEnabled ?? false}
                      label={data?.config.csrfEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
                    />
                  </TableCell>
                  <TableCell>Double-submit cookie patroon</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Rate Limiting
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusIndicator
                      active={data?.config.rateLimitEnabled ?? false}
                      label={data?.config.rateLimitEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
                    />
                  </TableCell>
                  <TableCell>Sliding window algoritme</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Connection Tests */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-mail Test
            </CardTitle>
            <CardDescription>
              Verstuur een test e-mail om de e-mailconfiguratie te verifi&euml;ren
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test E-mailadres</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="beheerder@stichtingderaam.nl"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTestEmail()
                }}
              />
            </div>
            <Button
              onClick={handleTestEmail}
              disabled={isSendingTest || !testEmail.trim()}
              className="w-full"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verzenden...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Test Email Versturen
                </>
              )}
            </Button>

            {lastTestResult && (
              <div
                className={`rounded-md p-3 text-sm ${
                  lastTestResult.success
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {lastTestResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {lastTestResult.success ? 'Succesvol verzonden' : 'Verzenden mislukt'}
                  </span>
                </div>
                <p>Provider: {lastTestResult.provider}</p>
                <p>Modus: {lastTestResult.mode}</p>
                <p>
                  Tijdstip:{' '}
                  {format(new Date(lastTestResult.timestamp), "d MMMM yyyy 'om' HH:mm:ss", {
                    locale: nl,
                  })}
                </p>
                {lastTestResult.error && <p className="mt-1">Fout: {lastTestResult.error}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Test
            </CardTitle>
            <CardDescription>
              Test de database verbinding en bekijk statistieken
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleTestDatabase}
              disabled={isTestingDb}
              variant="outline"
              className="w-full"
            >
              {isTestingDb ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testen...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Database Verbinding Testen
                </>
              )}
            </Button>

            {data?.health.database && (
              <div
                className={`rounded-md p-3 text-sm ${
                  data.health.database.connected
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {data.health.database.connected ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {data.health.database.connected ? 'Verbonden' : 'Verbinding mislukt'}
                  </span>
                </div>
                <p>Type: {data.config.databaseType}</p>
                <p>Latency: {data.health.database.latencyMs}ms</p>
                {data.health.database.error && (
                  <p className="mt-1">Fout: {data.health.database.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Systeeminformatie
          </CardTitle>
          <CardDescription>
            Overzicht van database records en systeemstatistieken
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold">{data?.info.totalUsers ?? 0}</div>
              <p className="text-sm text-muted-foreground">Gebruikers</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold">{data?.info.totalReservations ?? 0}</div>
              <p className="text-sm text-muted-foreground">Reserveringen</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold">{data?.info.totalBlocks ?? 0}</div>
              <p className="text-sm text-muted-foreground">Blokkades</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold">{data?.info.totalEvents ?? 0}</div>
              <p className="text-sm text-muted-foreground">Evenementen</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold">{data?.info.totalAuditLogs ?? 0}</div>
              <p className="text-sm text-muted-foreground">Audit Logs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
