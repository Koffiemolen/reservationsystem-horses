import { Header } from '@/components/layout/Header'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-6">{children}</main>
        <Toaster />
      </div>
    </Providers>
  )
}
