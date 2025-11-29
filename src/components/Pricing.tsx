import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Día de Descanso",
    price: "No disponible",
    period: "",
    description: "Temporalmente no disponible",
    features: [
      "Acceso a todas las instalaciones",
      "Clase de yoga o meditación",
      "Almuerzo saludable incluido",
      "Uso de áreas comunes",
      "Senderos ecológicos"
    ],
    highlighted: false,
    available: false
  },
  {
    name: "Fin de Semana Completo",
    price: "$ 1.000.000",
    period: "2 días / 1 noche",
    description: "La opción más popular",
    features: [
      "Alojamiento en habitación privada",
      "Todas las comidas incluidas",
      "Clases de yoga y meditación",
      "1 masaje relajante",
      "Acceso al spa",
      "Actividades al aire libre"
    ],
    highlighted: true,
    available: true
  },
  {
    name: "Retiro Semanal",
    price: "No disponible",
    period: "",
    description: "Temporalmente no disponible",
    features: [
      "Habitación premium",
      "Plan alimenticio personalizado",
      "Clases diarias ilimitadas",
      "3 sesiones de masaje",
      "Acceso VIP al spa",
      "Talleres de crecimiento personal",
      "Consulta de bienestar",
      "Kit de bienvenida"
    ],
    highlighted: false,
    available: false
  }
];

const Pricing = () => {
  const handleReserva = () => {
    window.location.href = "/reservaciones";
  };

  return (
    <section id="reservas" className="py-24 px-6 bg-gradient-to-b from-card via-background to-accent/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">
            Planes y Precios
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Inversiones en tu bienestar que transforman vidas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`group relative overflow-hidden animate-slide-up transition-all duration-500 ${
                plan.highlighted 
                  ? 'border-2 border-primary shadow-dramatic scale-105 z-10 bg-gradient-to-br from-card to-primary/5' 
                  : 'border-2 border-border/50 hover:border-primary/30 bg-card'
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {plan.highlighted && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-background px-6 py-2 rounded-full text-sm font-bold shadow-lg z-20">
                  Más Popular
                </div>
              )}
              <CardHeader className="text-center pb-10 pt-12">
                <CardTitle className="text-3xl mb-3 font-bold">{plan.name}</CardTitle>
                <CardDescription className="mb-6 text-lg">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-gradient">{plan.price}</span>
                  <span className="text-muted-foreground ml-3 text-lg">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-card-foreground leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleReserva}
                  disabled={!plan.available}
                  className={`w-full py-4 px-8 rounded-full font-semibold text-lg transition-all duration-500 ${
                    !plan.available
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      : plan.highlighted
                      ? 'bg-gradient-to-r from-primary to-secondary text-background hover:shadow-xl hover:scale-105'
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-background'
                  }`}
                >
                  {plan.available ? 'Reservar Ahora' : 'No Disponible'}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
