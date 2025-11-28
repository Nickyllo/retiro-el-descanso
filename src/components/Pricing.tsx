import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Día de Descanso",
    price: "$150.000",
    period: "por día",
    description: "Perfecto para una escapada rápida",
    features: [
      "Acceso a todas las instalaciones",
      "Clase de yoga o meditación",
      "Almuerzo saludable incluido",
      "Uso de áreas comunes",
      "Senderos ecológicos"
    ],
    highlighted: false
  },
  {
    name: "Fin de Semana Completo",
    price: "$450.000",
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
    highlighted: true
  },
  {
    name: "Retiro Semanal",
    price: "$1.200.000",
    period: "7 días / 6 noches",
    description: "Transformación profunda",
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
    highlighted: false
  }
];

const Pricing = () => {
  const scrollToReservas = () => {
    const element = document.getElementById("reservas");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="precios" className="py-20 px-4 bg-gradient-to-b from-card to-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Planes y Precios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative animate-slide-up ${
                plan.highlighted 
                  ? 'border-primary shadow-lg scale-105 z-10' 
                  : 'border-border'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Más Popular
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="mb-4">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={scrollToReservas}
                >
                  Reservar Ahora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
