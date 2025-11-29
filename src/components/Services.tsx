import { Home, Utensils, Dumbbell, Sparkles, Mountain, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Home,
    title: "Alojamiento Confortable",
    description: "Habitaciones acogedoras con vistas a la naturaleza y todas las comodidades necesarias para tu descanso."
  },
  {
    icon: Utensils,
    title: "Alimentación Saludable",
    description: "Menús balanceados con ingredientes orgánicos y opciones vegetarianas preparados con amor."
  },
  {
    icon: Dumbbell,
    title: "Yoga y Meditación",
    description: "Clases diarias guiadas por instructores certificados en espacios diseñados para tu práctica."
  },
  {
    icon: Sparkles,
    title: "Spa y Bienestar",
    description: "Tratamientos de relajación, masajes terapéuticos y terapias holísticas para renovar tu energía."
  },
  {
    icon: Mountain,
    title: "Actividades al Aire Libre",
    description: "Senderismo, caminatas ecológicas y conexión directa con la naturaleza circundante."
  },
  {
    icon: Heart,
    title: "Talleres de Crecimiento",
    description: "Programas de desarrollo personal, mindfulness y técnicas de manejo del estrés."
  }
];

const Services = () => {
  return (
    <section id="servicios" className="py-24 px-6 bg-gradient-to-b from-background via-accent/20 to-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">
            Nuestros Servicios
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Experiencias cuidadosamente diseñadas para tu bienestar integral
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-2 border-border/50 bg-card hover:border-primary/50 transition-all duration-500 hover:shadow-xl animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="p-10 text-center relative z-10">
                <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <service.icon className="w-10 h-10 text-primary group-hover:text-secondary transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-card-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {service.description}
                </p>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
