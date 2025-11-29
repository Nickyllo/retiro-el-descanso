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
import heroImage from "@/assets/hero-retreat.jpg";
import { User, LogOut, Calendar, LayoutDashboard, ChevronDown } from "lucide-react";

const Hero = () => {
  const { user, signOut, isAdmin, fullName } = useAuth();
  const navigate = useNavigate();
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReserva = () => {
    navigate("/reservaciones");
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-noise">
      {/* Auth buttons */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-background hover:bg-background/20 backdrop-blur-sm">
                <User className="w-4 h-4 mr-2" />
                {fullName || user.email?.split('@')[0]}
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
              <Button variant="ghost" className="text-background hover:bg-background/20 backdrop-blur-sm">
                <User className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-background text-foreground hover:bg-background/90">
                Registrarse
              </Button>
            </Link>
          </div>
        )}
      </div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-foreground/50 to-secondary/40" />
      </div>
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="max-w-5xl space-y-8">
          <h1 className="animate-fade-in text-6xl font-bold leading-tight tracking-tight text-background md:text-7xl lg:text-8xl drop-shadow-lg">
            Retiro El Descanso
          </h1>
          <p className="animate-slide-up text-xl md:text-2xl lg:text-3xl font-light text-background/95 max-w-3xl mx-auto leading-relaxed drop-shadow" style={{ animationDelay: "0.2s" }}>
            Tu refugio de paz y serenidad en medio de la naturaleza
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <button 
              onClick={handleReserva}
              className="group relative px-10 py-4 bg-background text-foreground font-medium text-lg rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10">Reserva Ahora</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 text-background font-medium transition-opacity duration-500">Reserva Ahora</span>
            </button>
            <button 
              onClick={() => scrollToSection("servicios")}
              className="px-10 py-4 border-2 border-background text-background font-medium text-lg rounded-full backdrop-blur-sm bg-background/10 hover:bg-background/20 transition-all duration-500 hover:scale-105"
            >
              Descubre Más
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={() => scrollToSection("servicios")}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-background opacity-80 hover:opacity-100 transition-all duration-300 animate-float"
        aria-label="Scroll down"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </section>
  );
};

export default Hero;
