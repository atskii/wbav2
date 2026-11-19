import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface NavLinkItem {
  id: string
  href: string
  label: string
}

const navigationLinks: NavLinkItem[] = [
  { id: "home", href: "#home", label: "Home" },
  { id: "produkt", href: "#produkt", label: "Produkt" },
  { id: "wypalenie", href: "#wypalenie", label: "Wypalenie" },
  { id: "o-nas", href: "#o-nas", label: "O nas" },
  { id: "kontakt", href: "#kontakt", label: "Kontakt" },
]

export interface NavigationMenu4Props {
  onCTA?: (mode: "login" | "register") => void
  activeSection?: string
  onNavigate?: (sectionId: string) => void
}

export default function NavigationMenu4({
  onCTA,
  activeSection = "home",
  onNavigate,
}: NavigationMenu4Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleLinkClick = (
    e: React.MouseEvent<HTMLElement>,
    sectionId: string
  ) => {
    e.preventDefault()
    setMobileOpen(false)
    if (onNavigate) {
      onNavigate(sectionId)
    } else {
      const target = document.getElementById(sectionId)
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 72
        window.scrollTo({ top: y, behavior: "smooth" })
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FCFCFD]/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 md:px-8 transition-shadow shadow-xs">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-3 md:gap-8">
          {/* Mobile menu trigger */}
          <Popover open={mobileOpen} onOpenChange={setMobileOpen}>
            <PopoverTrigger asChild>
              <Button
                className="group size-9 md:hidden text-[#03421C] hover:bg-[#E8F5EC]"
                variant="ghost"
                size="icon"
                aria-label="Otwórz menu"
              >
                <svg
                  className="pointer-events-none"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-64 p-3 md:hidden bg-white border-[#E5E7EB] shadow-xl rounded-xl"
            >
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-1 space-x-0">
                  {navigationLinks.map((link) => {
                    const isActive = activeSection === link.id
                    return (
                      <NavigationMenuItem key={link.id} className="w-full">
                        <NavigationMenuLink
                          href={link.href}
                          onClick={(e) => handleLinkClick(e, link.id)}
                          className={cn(
                            "block w-full rounded-md px-3 py-2 text-sm border-l-2 transition-colors",
                            isActive
                              ? "text-[#0E6630] font-bold bg-[#E8F5EC]/70 border-[#0E6630]"
                              : "text-[#151515] font-medium hover:bg-[#E8F5EC]/50 hover:text-[#0E6630] border-transparent"
                          )}
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                  })}
                </NavigationMenuList>
              </NavigationMenu>

              <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    onCTA?.("login")
                  }}
                  className="w-full bg-[#D0EBDA] text-[#0E6630] hover:bg-[#bce0ca] font-medium"
                >
                  Zaloguj się
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    onCTA?.("register")
                  }}
                  className="w-full bg-[#0E6630] text-white hover:bg-[#0b5025] font-medium"
                >
                  Zarejestruj się
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Main nav */}
          <div className="flex items-center gap-8 lg:gap-10">
            <a
              href="#home"
              onClick={(e) => handleLinkClick(e, "home")}
              className="flex items-center hover:opacity-90 transition-opacity shrink-0"
            >
              <img
                src="/logo WBA.svg"
                alt="Wellbeing app"
                width="387"
                height="50"
                className="h-7 md:h-8 w-auto object-contain"
              />
            </a>

            {/* Desktop Navigation menu */}
            <div className="max-md:hidden">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {navigationLinks.map((link) => {
                    const isActive = activeSection === link.id
                    return (
                      <NavigationMenuItem key={link.id}>
                        <NavigationMenuLink asChild>
                          <a
                            href={link.href}
                            onClick={(e) => handleLinkClick(e, link.id)}
                            className={cn(
                              "inline-flex h-10 items-center rounded-t-md rounded-b-none px-3.5 py-2 text-base border-b-2 transition-colors duration-200",
                              isActive
                                ? "text-[#0E6630] font-bold border-[#0E6630] bg-[#E8F5EC]/60"
                                : "text-[#5A5A5A] font-medium hover:text-[#0E6630] hover:bg-[#E8F5EC]/40 border-transparent hover:border-[#0E6630]/40"
                            )}
                          >
                            <span className="inline-grid place-items-center">
                              <span
                                className="col-start-1 row-start-1 invisible font-bold"
                                aria-hidden="true"
                              >
                                {link.label}
                              </span>
                              <span className="col-start-1 row-start-1">
                                {link.label}
                              </span>
                            </span>
                          </a>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Button
            type="button"
            onClick={() => onCTA?.("login")}
            className="px-5 py-2.5 h-auto bg-[#D0EBDA] text-[#0E6630] font-medium rounded-lg hover:bg-[#bce0ca] transition-colors cursor-pointer"
          >
            Zaloguj się
          </Button>
          <Button
            type="button"
            onClick={() => onCTA?.("register")}
            className="px-5 py-2.5 h-auto bg-[#0E6630] text-white font-medium rounded-lg hover:bg-[#0b5025] transition-colors cursor-pointer"
          >
            Zarejestruj się
          </Button>
        </div>
      </div>
    </header>
  )
}
