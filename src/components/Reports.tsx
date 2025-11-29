import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const reportSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  description: z.string().trim().min(20, "La descripción debe tener al menos 20 caracteres").max(1000)
});

const Reports = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      reportSchema.parse({ name, email, description });
      
      if (!category) {
        toast({
          title: "Error",
          description: "Por favor selecciona una categoría",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Denuncia recibida",
        description: "Tu reporte ha sido enviado. Lo revisaremos a la brevedad.",
      });

      setName("");
      setEmail("");
      setCategory("");
      setDescription("");
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
    <section id="denuncias" className="py-24 px-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 mb-8 shadow-soft">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">
            Canal de Denuncias
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Tu seguridad y bienestar son nuestra máxima prioridad
          </p>
        </div>

        <Card className="border-2 border-border/50 bg-card animate-slide-up shadow-elegant">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="report-name" className="block text-lg font-semibold mb-3 text-foreground">
                  Nombre <span className="text-sm font-normal text-muted-foreground">(opcional para denuncias anónimas)</span>
                </label>
                <Input
                  id="report-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  maxLength={100}
                  className="text-lg py-6"
                />
              </div>

              <div>
                <label htmlFor="report-email" className="block text-lg font-semibold mb-3 text-foreground">
                  Email de contacto
                </label>
                <Input
                  id="report-email"
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
                <label htmlFor="category" className="block text-lg font-semibold mb-3 text-foreground">
                  Categoría
                </label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category" className="text-lg py-6">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seguridad">Seguridad</SelectItem>
                    <SelectItem value="higiene">Higiene</SelectItem>
                    <SelectItem value="personal">Conducta del personal</SelectItem>
                    <SelectItem value="instalaciones">Estado de instalaciones</SelectItem>
                    <SelectItem value="servicios">Calidad de servicios</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="description" className="block text-lg font-semibold mb-3 text-foreground">
                  Descripción detallada
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe la situación de manera detallada..."
                  rows={6}
                  required
                  maxLength={1000}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {description.length}/1000 caracteres
                </p>
              </div>

              <div className="bg-accent/50 p-6 rounded-xl border-2 border-border/50">
                <p className="text-base text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Confidencialidad garantizada:</strong> Todas las denuncias son tratadas con absoluta discreción. 
                  Tu información será utilizada únicamente para investigar el incidente reportado.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-5 px-8 bg-destructive text-destructive-foreground font-bold text-lg rounded-full hover:shadow-xl hover:scale-105 transition-all duration-500"
              >
                Enviar Denuncia Confidencial
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Reports;
