import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Manege de Raam</h3>
            <p className="text-sm text-muted-foreground">
              Stichting Manege de Raam beheert Manege D'n Perdenbak in Lieshout.
              Een plek voor training, wedstrijden en evenementen sinds 1983.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Provinciale weg 26<br />
              5737 GH Lieshout
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://www.facebook.com/stichtingmanegederaam"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/stichtingmanegederaam"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Instagram
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Snelle links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/over-ons" className="text-muted-foreground hover:text-primary">
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/verhuur" className="text-muted-foreground hover:text-primary">
                  Verhuur
                </Link>
              </li>
              <li>
                <Link href="/evenementen" className="text-muted-foreground hover:text-primary">
                  Evenementen
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Inloggen</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary">
                  Inloggen
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-primary">
                  Registreren
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Stichting Manege de Raam. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  )
}
