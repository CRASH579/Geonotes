import Logo from "@/assets/logo.svg";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
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

// =============================================================================
// CONFIGURATION - Easy to customize
// =============================================================================
const NAV_LINKS = [
  { path: "/", label: "Home", icon: House },
  { path: "/web", label: "Web", icon: MapPinPen },
  { path: "/about", label: "About", icon: Contact },
  { path: "/projects", label: "Projects", icon: ChevronsLeftRightEllipsis },
] as const;

const STYLES = {
  // Bubble styles
  activeBubble: "bg-gradient-to-b from-text to-brand",
  hoverBubble: "bg-gradient-to-b from-surface-2 to-surface",
  // Nav wrapper styles
  navWrapper:
    "border-2 border-surface bg-gradient-to-b from-surface to-surface-2",
  // Text colors
  activeText: "text-black",
  inactiveText: "text-white",
  // Transition
  transition: "transition-all duration-200 ease-out",
} as const;

// Debug mode - set to true to see bubble positions
const DEBUG_MODE = false;

// =============================================================================
// TYPES
// =============================================================================
interface BubbleStyle {
  width: string;
  height: string;
  left: string;
  top: string;
  opacity?: number;
}

interface NavLinkItem {
  path: string;
  label: string;
  icon: typeof House;
}

// =============================================================================
// CUSTOM HOOK - Reusable bubble navigation logic
// =============================================================================
const useBubbleNav = (
  navRef: React.RefObject<HTMLElement | null>,
  pathname: string,
  linkSelector: string,
) => {
  const [activeBubble, setActiveBubble] = useState<BubbleStyle>({
    width: "0",
    height: "0",
    left: "0",
    top: "0",
    opacity: 0,
  });
  const [hoverBubble, setHoverBubble] = useState<BubbleStyle>({
    width: "0",
    height: "0",
    left: "0",
    top: "0",
    opacity: 0,
  });

  const calculateBubbleStyle = useCallback(
    (element: HTMLElement | null): BubbleStyle | null => {
      if (!element || !navRef.current) return null;

      const rect = element.getBoundingClientRect();
      const parentRect = navRef.current.getBoundingClientRect();

      return {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        left: `${rect.left - parentRect.left}px`,
        top: `${rect.top - parentRect.top}px`,
        opacity: 1,
      };
    },
    [navRef],
  );

  // Update active bubble on route change
  useEffect(() => {
    const activeLink = navRef.current?.querySelector(
      `${linkSelector}.active`,
    ) as HTMLElement | null;
    if (activeLink) {
      const style = calculateBubbleStyle(activeLink);
      if (style) setActiveBubble(style);
    }
  }, [pathname, navRef, linkSelector, calculateBubbleStyle]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const style = calculateBubbleStyle(e.currentTarget);
      if (style) setHoverBubble(style);
    },
    [calculateBubbleStyle],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverBubble((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return { activeBubble, hoverBubble, handleMouseEnter, handleMouseLeave };
};

// =============================================================================
// BUBBLE COMPONENT - Reusable animated bubble
// =============================================================================
interface BubbleProps {
  style: BubbleStyle;
  variant: "active" | "hover";
  debug?: boolean;
}

const Bubble = ({ style, variant, debug = false }: BubbleProps) => {
  const variantStyles =
    variant === "active" ? STYLES.activeBubble : STYLES.hoverBubble;
  const zIndex = variant === "active" ? "z-[2]" : "z-[1]";

  return (
    <div
      className={`absolute rounded-full ${variantStyles} ${STYLES.transition} ${zIndex} ${debug ? "border-2 border-red-500" : ""}`}
      style={style}
      data-bubble={variant}
    />
  );
};

// =============================================================================
// NAV LINK COMPONENTS
// =============================================================================
interface DesktopNavLinkProps {
  link: NavLinkItem;
  isActive: boolean;
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave: () => void;
}

const DesktopNavLink = ({
  link,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: DesktopNavLinkProps) => (
  <Link
    to={link.path}
    className={`nav-link relative z-10 px-6 py-5 rounded-full ${STYLES.transition} ${
      isActive ? `active ${STYLES.activeText}` : STYLES.inactiveText
    }`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {link.label}
  </Link>
);

interface MobileNavLinkProps {
  link: NavLinkItem;
  isActive: boolean;
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave: () => void;
}

const MobileNavLink = ({
  link,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: MobileNavLinkProps) => {
  const Icon = link.icon;
  return (
    <Link
      to={link.path}
      className={`mobile-nav-link relative z-10 p-6 rounded-full ${STYLES.transition} ${isActive ? "active" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Icon
        className={isActive ? STYLES.activeText : STYLES.inactiveText}
        size={22}
      />
    </Link>
  );
};

// =============================================================================
// MAIN NAVBAR COMPONENT
// =============================================================================
export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const location = useLocation();

  const isActivePath = (path: string) => location.pathname === path;

  // Desktop bubble navigation
  const {
    activeBubble: desktopActiveBubble,
    hoverBubble: desktopHoverBubble,
    handleMouseEnter: handleDesktopMouseEnter,
    handleMouseLeave: handleDesktopMouseLeave,
  } = useBubbleNav(desktopNavRef, location.pathname, ".nav-link");

  // Mobile bubble navigation
  const {
    activeBubble: mobileActiveBubble,
    hoverBubble: mobileHoverBubble,
    handleMouseEnter: handleMobileMouseEnter,
    handleMouseLeave: handleMobileMouseLeave,
  } = useBubbleNav(mobileNavRef, location.pathname, ".mobile-nav-link");

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="mx-auto max-w-7xl">
        {/* ==================== DESKTOP NAVBAR ==================== */}
        <div className="hidden sm:flex mx-10 my-4 items-center justify-between py-4 px-3 bg-surface rounded-full">
          <a
            href="https://geonotes.in"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={Logo} className="h-10" alt="Geonotes logo" />
          </a>

          <div
            className={`absolute left-1/2 -translate-x-1/2 rounded-full ${STYLES.navWrapper}`}
          >
            <nav
              ref={desktopNavRef}
              className="relative flex items-center"
              onMouseLeave={handleDesktopMouseLeave}
            >
              {/* Active Bubble */}
              <Bubble
                style={desktopActiveBubble}
                variant="active"
                debug={DEBUG_MODE}
              />
              {/* Hover Bubble */}
              <Bubble
                style={desktopHoverBubble}
                variant="hover"
                debug={DEBUG_MODE}
              />

              {NAV_LINKS.map((link) => (
                <DesktopNavLink
                  key={link.path}
                  link={link}
                  isActive={isActivePath(link.path)}
                  onMouseEnter={handleDesktopMouseEnter}
                  onMouseLeave={() => {}} // Handled by nav onMouseLeave
                />
              ))}
            </nav>
          </div>
        </div>

        {/* ==================== MOBILE MENU TOGGLE ==================== */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="bg-surface fixed top-4 right-5 sm:hidden p-6 rounded-full z-50"
          aria-label="Toggle menu"
        >
          {menuOpen ? <SquareEqual /> : <SquareChevronDown />}
        </button>

        {/* ==================== MOBILE NAVBAR ==================== */}
        {menuOpen && (
          <div
            className={`fixed right-5 top-26 sm:hidden transition-transform rounded-full ${STYLES.navWrapper}`}
          >
            <nav
              ref={mobileNavRef}
              className="relative flex flex-col items-center gap-2"
              onMouseLeave={handleMobileMouseLeave}
            >
              {/* Active Bubble */}
              <Bubble
                style={mobileActiveBubble}
                variant="active"
                debug={DEBUG_MODE}
              />
              {/* Hover Bubble */}
              <Bubble
                style={mobileHoverBubble}
                variant="hover"
                debug={DEBUG_MODE}
              />

              {NAV_LINKS.map((link) => (
                <MobileNavLink
                  key={link.path}
                  link={link}
                  isActive={isActivePath(link.path)}
                  onMouseEnter={handleMobileMouseEnter}
                  onMouseLeave={() => {}}
                />
              ))}

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="relative z-10 mb-6"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="text-yellow-300" size={22} />
                ) : (
                  <Moon className="text-blue-300" size={22} />
                )}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
