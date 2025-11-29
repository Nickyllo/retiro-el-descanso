import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Location = () => {
  return (
    <section id="ubicacion" className="py-24 px-6 bg-gradient-to-b from-background via-card to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">
            Ubicación
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            En el corazón de la naturaleza colombiana
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6 animate-slide-up">
            <Card className="group border-2 border-border/50 hover:border-primary/30 bg-card transition-all duration-500">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3 text-card-foreground">Dirección</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Km 15 Vía La Calera<br />
                    Vereda El Descanso<br />
                    Cundinamarca, Colombia
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-2 border-border/50 hover:border-primary/30 bg-card transition-all duration-500">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3 text-card-foreground">Teléfono</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    +57 (1) 234 5678<br />
                    +57 310 123 4567
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-2 border-border/50 hover:border-primary/30 bg-card transition-all duration-500">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3 text-card-foreground">Email</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    info@retiroeldescanso.com<br />
                    reservas@retiroeldescanso.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-2 border-border/50 hover:border-primary/30 bg-card transition-all duration-500">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3 text-card-foreground">Horario</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Lunes a Domingo<br />
                    8:00 AM - 6:00 PM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden shadow-dramatic border-4 border-border/50">
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
