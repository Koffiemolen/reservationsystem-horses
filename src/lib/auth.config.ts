import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/agenda') ||
                           nextUrl.pathname.startsWith('/reserveringen') ||
                           nextUrl.pathname.startsWith('/profiel')
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnAuth = nextUrl.pathname.startsWith('/login') ||
                       nextUrl.pathname.startsWith('/register') ||
                       nextUrl.pathname.startsWith('/wachtwoord')

      if (isOnAdmin) {
        if (isLoggedIn && auth.user.role === 'ADMIN') return true
        return false
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL('/agenda', nextUrl))
      }

      return true
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig
