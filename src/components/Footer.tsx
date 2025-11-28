import { Facebook, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-card-foreground">Retiro El Descanso</h3>
            <p className="text-muted-foreground">
              Tu refugio de paz en medio de la naturaleza.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-card-foreground">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection("servicios")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Servicios
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("galeria")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Galería
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("precios")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Precios
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("ubicacion")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Ubicación
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-card-foreground">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                +57 (1) 234 5678
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                info@retiroeldescanso.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-card-foreground">Síguenos</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground">
            © {currentYear} Retiro El Descanso. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
