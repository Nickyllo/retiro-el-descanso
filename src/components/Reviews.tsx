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
    <section id="calificanos" className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-card-foreground">
            Calificaciones
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lo que dicen nuestros huéspedes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-card-foreground mb-4 italic">"{testimonial.comment}"</p>
                <p className="text-muted-foreground font-semibold">- {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-2xl mx-auto border-border animate-fade-in">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold mb-6 text-center text-card-foreground">
              Déjanos tu Calificación
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Calificación
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          value <= (hoveredRating || rating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-card-foreground">
                  Nombre
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-card-foreground">
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
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2 text-card-foreground">
                  Comentario
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos sobre tu experiencia..."
                  rows={4}
                  required
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/500 caracteres
                </p>
              </div>

              <Button type="submit" className="w-full">
                Enviar Calificación
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Reviews;
