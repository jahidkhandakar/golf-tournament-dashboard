import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { RiMenu3Fill } from "react-icons/ri";
import Logo from "../logo/index.js";
import { navLinks, type MenuItem } from "../../../data/menu-items/index.js";


const Navbar = () => {
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lang, setLang] = useState<"EN" | "FR">("EN");
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen && !contactOpen) return;

    const html = document.documentElement;
    const previous = html.style.overflow;

    html.style.overflow = "hidden";

    return () => {
      html.style.overflow = previous;
    };
  }, [menuOpen, contactOpen]);

  const isActive = (href?: string) => {
    return !!href && pathname === href;
  };

  const navContainerClass = `
    sticky inset-0 w-full z-50 transition-all duration-300
    ${isScrolled
      ? "bg-white/90 backdrop-blur-md shadow-md py-3"
      : "bg-white/90 py-4"
    }
  `;

  return (
    <>
      <nav className={navContainerClass}>
        <div className="container mx-auto flex items-center justify-between px-6">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((item: MenuItem) =>
              item.submenu ? (
                <div key={item.label} className="relative group">
                  <button className="flex items-center gap-1 text-base font-medium text-black/90 hover:text-secondary transition-colors cursor-pointer">
                    {item.label}

                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>

                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200">
                    <div className="min-w-[220px] rounded-xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden py-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          className="block px-4 py-2.5 text-sm font-medium text-black/90 hover:text-secondary transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.href!}
                  className={`text-base font-medium transition-colors ${isActive(item.href)
                    ? "text-secondary"
                    : "text-black/90 hover:text-secondary"
                    }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <button className="font-medium text-sm px-6 py-2 rounded-full bg-secondary hover:bg-primary text-white transition-colors cursor-pointer">
                Sign In
              </button>
            </Link>

            <button
              className="lg:hidden text-black/90 hover:text-secondary transition-colors flex items-center justify-center cursor-pointer"
              onClick={toggleMenu}
              aria-label="Open Menu"
            >
              <RiMenu3Fill size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div className="fixed inset-0 z-[999] overflow-x-hidden pointer-events-none lg:hidden">
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`pointer-events-auto absolute top-0 right-0 w-72 h-full bg-white shadow-xl transition-transform duration-300
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between py-4 px-5 border-b border-white/10">
            <Logo />

            <button
              onClick={toggleMenu}
              className="text-black/90 hover:text-secondary transition-colors cursor-pointer"
            >
              <X className="w-8 h-8 border border-white/20 rounded-full p-1.5" />
            </button>
          </div>

          <div className="flex flex-col p-5 gap-2">
            {navLinks.map((item: MenuItem) =>
              item.submenu ? (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      setOpenSubmenu((prev) =>
                        prev === item.label ? null : item.label
                      )
                    }
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-base font-medium text-black/90 hover:text-secondary transition-colors cursor-pointer"
                  >
                    {item.label}

                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openSubmenu === item.label ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {openSubmenu === item.label && (
                    <div className="ml-3 mt-1 flex flex-col border-l border-white/10">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          onClick={() => setMenuOpen(false)}
                          className="px-4 py-2 text-sm  text-black/90 transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.href!}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-base font-medium transition-colors hover:text-secondary ${isActive(item.href)
                    ? "text-secondary"
                    : "text-black/90 "
                    }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </aside>
      </div>

      {/* Placeholder during initial render */}
      {!mounted && <span className="hidden" />}
    </>
  );
};

export default Navbar;