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
    <section id="servicios" className="py-20 px-4 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Diseñados para brindarte una experiencia integral de descanso y renovación
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 border-border bg-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
