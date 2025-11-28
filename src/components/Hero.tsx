import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-retreat.jpg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="mb-6 animate-fade-in text-5xl font-bold leading-tight md:text-7xl lg:text-8xl">
          Retiro El Descanso
        </h1>
        <p className="mb-8 max-w-2xl animate-slide-up text-lg md:text-xl lg:text-2xl font-light opacity-90">
          Tu refugio de paz en medio de la naturaleza. Desconéctate del mundo y reconéctate contigo mismo.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => scrollToSection("reservas")}
          >
            Reserva Ahora
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            onClick={() => scrollToSection("servicios")}
          >
            Conoce Más
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <button 
          onClick={() => scrollToSection("servicios")}
          className="text-white opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Scroll down"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;
