import { Facebook, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-b from-card to-background border-t-2 border-border/50 pt-16 pb-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-gradient">Retiro El Descanso</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Tu refugio de serenidad en armonía con la naturaleza.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xl mb-6 text-card-foreground">Enlaces</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => scrollToSection("servicios")}
                  className="text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  Servicios
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("galeria")}
                  className="text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  Galería
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("precios")}
                  className="text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  Precios
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("ubicacion")}
                  className="text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  Ubicación
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xl mb-6 text-card-foreground">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground text-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                +57 (1) 234 5678
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                info@retiroeldescanso.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xl mb-6 text-card-foreground">Síguenos</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary hover:from-primary hover:to-secondary hover:text-background transition-all duration-500 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary hover:from-primary hover:to-secondary hover:text-background transition-all duration-500 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-border/50 pt-8 text-center space-y-3">
          <p className="text-muted-foreground text-lg">
            © {currentYear} Retiro El Descanso. Todos los derechos reservados.
          </p>
          <p className="text-muted-foreground text-base">
            Hecho por <span className="text-primary font-medium">Nickyllo</span>
          </p>
          <p className="text-sm">
            <a 
              href="https://nickyllo.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-all"
            >
              nickyllo.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
