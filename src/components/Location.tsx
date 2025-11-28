import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Location = () => {
  return (
    <section id="ubicacion" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Ubicación
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuéntranos en medio de la naturaleza
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 animate-slide-up">
            <Card className="border-border">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-card-foreground">Dirección</h3>
                  <p className="text-muted-foreground">
                    Km 15 Vía La Calera<br />
                    Vereda El Descanso<br />
                    Cundinamarca, Colombia
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-card-foreground">Teléfono</h3>
                  <p className="text-muted-foreground">
                    +57 (1) 234 5678<br />
                    +57 310 123 4567
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-card-foreground">Email</h3>
                  <p className="text-muted-foreground">
                    info@retiroeldescanso.com<br />
                    reservas@retiroeldescanso.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-card-foreground">Horario de Atención</h3>
                  <p className="text-muted-foreground">
                    Lunes a Domingo<br />
                    8:00 AM - 6:00 PM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127260.7389!2d-74.0721!3d4.7110!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9bfd2da6cb29%3A0x239d635520a33914!2sBogot%C3%A1%2C%20Colombia!5e0!3m2!1ses!2sco!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de ubicación"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
