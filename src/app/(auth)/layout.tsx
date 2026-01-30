export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">Manege de Raam</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reserveringssysteem
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
