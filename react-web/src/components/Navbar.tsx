import Logo from "@/assets/logo.svg";
import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronsLeftRightEllipsis,
  Contact,
  House,
  MapPinPen,
  Moon,
  SquareChevronDown,
  SquareEqual,
  Sun,
} from "lucide-react";

const NAV_LINKS = [
  { path: "/", label: "Home", icon: House },
  { path: "/web", label: "Web", icon: MapPinPen },
  { path: "/about", label: "About", icon: Contact },
  { path: "/projects", label: "Projects", icon: ChevronsLeftRightEllipsis },
];
const updateBubble = (
  nav: HTMLElement | null,
  link: HTMLElement | null,
  prefix: "bubble" | "hover"
) => {
  if (!nav || !link) return;
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  nav.style.setProperty(`--${prefix}-x`, `${linkRect.left - navRect.left}px`);
  nav.style.setProperty(`--${prefix}-y`, `${linkRect.top - navRect.top}px`);
  nav.style.setProperty(`--${prefix}-w`, `${linkRect.width}px`);
  nav.style.setProperty(`--${prefix}-h`, `${linkRect.height}px`);
};

// Sets hover bubble to full nav size (default resting state)
const initHoverBubble = (nav: HTMLElement | null) => {
  if (!nav) return;
  nav.style.setProperty("--hover-x", "0px");
  nav.style.setProperty("--hover-y", "0px");
  nav.style.setProperty("--hover-w", `${nav.offsetWidth}px`);
  nav.style.setProperty("--hover-h", `${nav.offsetHeight}px`);
};

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const desktopNav = useRef<HTMLElement>(null);
  const mobileNav = useRef<HTMLElement>(null);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const syncBubbles = useCallback(() => {
    // Desktop
    if (desktopNav.current) {
      const activeDesktop = desktopNav.current.querySelector(".nav-link.active") as HTMLElement;
      updateBubble(desktopNav.current, activeDesktop, "bubble");
      initHoverBubble(desktopNav.current);
    }
    // Mobile
    if (mobileNav.current) {
      const activeMobile = mobileNav.current.querySelector(".mobile-link.active") as HTMLElement;
      updateBubble(mobileNav.current, activeMobile, "bubble");
      initHoverBubble(mobileNav.current);
    }
  }, []);

  useEffect(() => {
    syncBubbles();
    window.addEventListener("resize", syncBubbles);
    return () => window.removeEventListener("resize", syncBubbles);
  }, [location.pathname, syncBubbles, menuOpen]);

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="mx-auto max-w-7xl">
        <div className="hidden sm:flex mx-10 my-4 items-center justify-between py-4 px-3 bg-surface rounded-full">
          <a href="https://geonotes.in" target="_blank" rel="noopener noreferrer">
            <img src={Logo} className="h-10" alt="Geonotes logo" />
          </a>
          <nav
            ref={desktopNav}
            className="bubble-nav absolute left-1/2 -translate-x-1/2 flex py-2 items-center rounded-full border-2 border-surface bg-gradient-to-b from-surface to-surface-2"
            onMouseLeave={() => initHoverBubble(desktopNav.current)}
          >
            <div className="bubble bubble--active" />
            <div className="bubble bubble--hover" />

            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link relative z-10 px-6 py-4 rounded-full transition-colors ${
                  isActive(link.path) ? "active text-light" : "text-text"
                }`}
                onMouseEnter={(e) => updateBubble(desktopNav.current, e.currentTarget, "hover")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="bg-surface fixed top-4 right-5 sm:hidden p-6 rounded-full z-50"
          aria-label="Toggle menu"
        >
          {menuOpen ? <SquareEqual /> : <SquareChevronDown />}
        </button>

        {menuOpen && (
          <nav
            ref={mobileNav}
            className="bubble-nav fixed right-5 top-26 sm:hidden flex flex-col items-center px-1 gap-2 rounded-full  bg-gradient-to-b from-surface to-surface-2"
            onMouseLeave={() => initHoverBubble(mobileNav.current)}
          >
            <div className="bubble bubble--active" />
            <div className="bubble bubble--hover" />

            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-link relative z-10 p-5 rounded-full transition-colors ${
                    isActive(link.path) ? "active" : ""
                  }`}
                  onMouseEnter={(e) => updateBubble(mobileNav.current, e.currentTarget, "hover")}
                >
                  <Icon className={isActive(link.path) ? "text-light" : "text-text"} size={22} />
                </Link>
              );
            })}

            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="relative z-10 mb-6"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="text-yellow-300" size={22} /> : <Moon className="text-blue-300" size={22} />}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
