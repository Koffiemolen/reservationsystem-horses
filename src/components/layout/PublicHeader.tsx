'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/over-ons', label: 'Over ons' },
  { href: '/verhuur', label: 'Verhuur' },
  { href: '/evenementen', label: 'Evenementen' },
  { href: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-[#3a3019] shadow-md">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Manege de Raam logo"
            width={36}
            height={36}
            className="rounded-full ring-2 ring-[#8d974e]/30"
          />
          <span className="text-xl font-bold text-[#8d974e]">Manege de Raam</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-[#8d974e]',
                pathname === item.href
                  ? 'text-[#8d974e]'
                  : 'text-[#caa981]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Login Button */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:inline-flex">
            <Button className="bg-[#8d974e] hover:bg-[#7a8544] text-white">Inloggen</Button>
          </Link>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-[#caa981] hover:text-white hover:bg-[#4a4228]">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#3a3019] border-[#4a4228]">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-[#8d974e] p-2 rounded-md',
                      pathname === item.href
                        ? 'bg-[#8d974e]/10 text-[#8d974e]'
                        : 'text-[#caa981]'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-[#4a4228] my-2" />
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#8d974e] hover:bg-[#7a8544] text-white">Inloggen</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
