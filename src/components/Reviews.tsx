import { useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const reviewSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  comment: z.string().trim().min(10, "El comentario debe tener al menos 10 caracteres").max(500)
});

const testimonials = [
  {
    name: "María García",
    rating: 5,
    comment: "Una experiencia transformadora. El lugar es hermoso y el personal muy atento. Volveré sin duda."
  },
  {
    name: "Carlos Rodríguez",
    rating: 5,
    comment: "Exactamente lo que necesitaba para desconectarme. Las clases de yoga son excelentes."
  },
  {
    name: "Ana Martínez",
    rating: 4,
    comment: "Muy recomendado. La comida deliciosa y el ambiente muy relajante."
  }
];

const Reviews = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      reviewSchema.parse({ name, email, comment });
      
      if (rating === 0) {
        toast({
          title: "Error",
          description: "Por favor selecciona una calificación",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Gracias por tu opinión!",
        description: "Tu calificación ha sido recibida exitosamente.",
      });

      setName("");
      setEmail("");
      setComment("");
      setRating(0);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <section id="calificanos" className="py-24 px-6 bg-gradient-to-b from-card via-accent/10 to-card relative overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">
            Calificaciones
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Testimonios de quienes han vivido la experiencia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 border-border/50 bg-card hover:border-primary/30 transition-all duration-500 hover:shadow-elegant animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
              <CardContent className="p-8">
                <div className="flex gap-2 mb-6 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < testimonial.rating
                          ? "fill-secondary text-secondary"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-card-foreground mb-6 text-lg leading-relaxed italic text-center">"{testimonial.comment}"</p>
                <p className="text-muted-foreground font-semibold text-center text-lg">— {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-3xl mx-auto border-2 border-border/50 bg-card animate-fade-in shadow-elegant">
          <CardContent className="p-10">
            <h3 className="text-3xl font-bold mb-8 text-center text-gradient">
              Comparte Tu Experiencia
            </h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-semibold mb-4 text-card-foreground">
                  Tu Calificación
                </label>
                <div className="flex gap-3 justify-center">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all hover:scale-125 duration-300"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          value <= (hoveredRating || rating)
                            ? "fill-secondary text-secondary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-lg font-semibold mb-3 text-card-foreground">
                  Nombre
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  maxLength={100}
                  className="text-lg py-6"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-lg font-semibold mb-3 text-card-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  maxLength={255}
                  className="text-lg py-6"
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-lg font-semibold mb-3 text-card-foreground">
                  Tu Comentario
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos sobre tu experiencia transformadora..."
                  rows={5}
                  required
                  maxLength={500}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {comment.length}/500 caracteres
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-5 px-8 bg-gradient-to-r from-primary to-secondary text-background font-bold text-lg rounded-full hover:shadow-xl hover:scale-105 transition-all duration-500"
              >
                Enviar Calificación
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Reviews;
