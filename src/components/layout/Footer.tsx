import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#3a3019] text-[#caa981]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Manege de Raam</h3>
            <p className="text-sm">
              Stichting Manege de Raam beheert Manege D'n Perdenbak in Lieshout.
              Een plek voor training, wedstrijden en evenementen sinds 1983.
            </p>
            <p className="text-sm mt-3">
              Provinciale weg 26<br />
              5737 GH Lieshout
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://www.facebook.com/stichtingmanegederaam"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#8d974e] text-sm transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/stichtingmanegederaam"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#8d974e] text-sm transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Snelle links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#8d974e] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/over-ons" className="hover:text-[#8d974e] transition-colors">
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/verhuur" className="hover:text-[#8d974e] transition-colors">
                  Verhuur
                </Link>
              </li>
              <li>
                <Link href="/evenementen" className="hover:text-[#8d974e] transition-colors">
                  Evenementen
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#8d974e] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Inloggen</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-[#8d974e] transition-colors">
                  Inloggen
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#8d974e] transition-colors">
                  Registreren
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#4a4228] text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Stichting Manege de Raam. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  )
}
