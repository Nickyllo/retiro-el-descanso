import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Calendar, LayoutDashboard, ChevronDown, Menu, X, Leaf } from "lucide-react";

const Navigation = () => {
  const { user, signOut, isAdmin, fullName } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Inicio", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "Servicios", action: () => scrollToSection("servicios") },
    { label: "Galería", action: () => scrollToSection("galeria") },
    { label: "Precios", action: () => scrollToSection("reservas") },
    { label: "Ubicación", action: () => scrollToSection("ubicacion") },
    { label: "Calificaciones", action: () => scrollToSection("calificanos") },
    { label: "Denuncias", action: () => scrollToSection("denuncias") },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-elegant"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 group"
          >
            <div className={`transition-colors duration-300 ${isScrolled ? "text-primary" : "text-background"}`}>
              <Leaf className="w-8 h-8" />
            </div>
            <span
              className={`text-xl font-bold font-serif transition-colors duration-300 hidden sm:block ${
                isScrolled ? "text-foreground" : "text-background"
              }`}
            >
              Retiro El Descanso
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={link.action}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  isScrolled
                    ? "text-foreground hover:bg-accent"
                    : "text-background hover:bg-background/20"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`transition-colors duration-300 ${
                      isScrolled
                        ? "text-foreground hover:bg-accent"
                        : "text-background hover:bg-background/20"
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {fullName || user.email?.split("@")[0]}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/reservaciones" className="flex items-center cursor-pointer">
                      <Calendar className="w-4 h-4 mr-2" />
                      Mis Reservas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    className={`transition-colors duration-300 ${
                      isScrolled
                        ? "text-foreground hover:bg-accent"
                        : "text-background hover:bg-background/20"
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button
                    className={`transition-all duration-300 ${
                      isScrolled
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-background text-foreground hover:bg-background/90"
                    }`}
                  >
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 transition-colors duration-300 ${
              isScrolled ? "text-foreground" : "text-background"
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 bg-background/98 backdrop-blur-md rounded-b-2xl shadow-dramatic animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.action}
                  className="px-4 py-3 text-left text-foreground hover:bg-accent rounded-lg transition-colors duration-300"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-border my-2" />
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-left text-foreground hover:bg-accent rounded-lg transition-colors duration-300"
                  >
                    <LayoutDashboard className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    to="/reservaciones"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-left text-foreground hover:bg-accent rounded-lg transition-colors duration-300"
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Mis Reservas
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-left text-destructive hover:bg-accent rounded-lg transition-colors duration-300"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-left text-foreground hover:bg-accent rounded-lg transition-colors duration-300"
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors duration-300 text-center font-medium"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
