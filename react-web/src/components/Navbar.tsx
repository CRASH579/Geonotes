import Logo from "@/assets/logo.svg";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-surface">
      <div className="relative flex items-center justify-between px-3 py-2">
        <a href="https://geonotes.in" target="_blank" className="flex items-center">
          <img src={Logo} className="h-10" alt="Geonotes logo" />
        </a>
        <nav className="
        absolute bg-surface-2 left-1/2 -translate-x-1/2
        hidden sm:flex
        items-center gap-3
        px-3 py-1
        rounded-full
        border-1 border-border/50 
        ">
          <Link to="/" className="text-light hover:text-brand">
            Home
          </Link>
          <Link to="/web" className="text-light hover:text-brand">
            Web
          </Link>
          <Link to="/about" className="text-light hover:text-brand">
            About
          </Link>
          <Link to="/projects" className="text-light hover:text-brand">
            Projects
          </Link>
        </nav>
        <button className="">☀️</button>
      </div>
    </header>
  );
};
