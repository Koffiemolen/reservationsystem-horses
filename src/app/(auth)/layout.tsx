import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        :root {
          --earth-cream: #f5f1e8;
          --earth-sand: #e8dcc4;
          --earth-moss: #8b9d83;
          --earth-forest: #4a5d4a;
          --earth-bark: #5c4a3a;
          --earth-clay: #c9a88e;
        }

        .auth-layout {
          font-family: 'Lora', serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: var(--earth-cream);
        }

        .auth-layout::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(139, 157, 131, 0.15), transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(201, 168, 142, 0.12), transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(139, 157, 131, 0.1), transparent 50%);
          pointer-events: none;
        }

        .auth-organic-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: 0.02em;
        }

        .auth-card-wrapper :global(.border) {
          border-color: var(--earth-sand) !important;
        }

        .auth-home-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--earth-forest);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          border: 1.5px solid var(--earth-sand);
          background: white;
        }

        .auth-home-link:hover {
          background: var(--earth-forest);
          color: var(--earth-cream);
          border-color: var(--earth-forest);
          transform: translateX(-4px);
        }

        .auth-fade-in {
          animation: authFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes authFadeIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md px-4 py-8 auth-fade-in">
        {/* Home link */}
        <div className="mb-6">
          <Link href="/" className="auth-home-link">
            <ArrowLeft size={16} />
            Terug naar home
          </Link>
        </div>

        {/* Logo and branding */}
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-4">
            <div
              className="absolute inset-0 rounded-full blur-xl scale-150"
              style={{ background: 'rgba(139, 157, 131, 0.2)' }}
            />
            <Image
              src="/logo.svg"
              alt="Manege de Raam logo"
              width={80}
              height={80}
              className="relative rounded-full shadow-lg"
              style={{
                boxShadow: '0 0 0 2px var(--earth-sand), 0 4px 24px rgba(74, 93, 74, 0.12)',
              }}
            />
          </div>
          <h1
            className="auth-organic-title text-3xl mb-1"
            style={{ color: 'var(--earth-forest)' }}
          >
            Manege de Raam
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--earth-bark)', opacity: 0.7 }}
          >
            Reserveringssysteem
          </p>
        </div>

        {/* Card content */}
        <div className="auth-card-wrapper">
          {children}
        </div>
      </div>
    </div>
  )
}
