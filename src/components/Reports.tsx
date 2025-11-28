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
    <section id="denuncias" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Canal de Denuncias
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tu seguridad y bienestar son nuestra prioridad. Si presenciaste alguna situación irregular, 
            repórtala de manera confidencial.
          </p>
        </div>

        <Card className="border-border animate-slide-up">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="report-name" className="block text-sm font-medium mb-2 text-foreground">
                  Nombre (opcional para denuncias anónimas)
                </label>
                <Input
                  id="report-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  maxLength={100}
                />
              </div>

              <div>
                <label htmlFor="report-email" className="block text-sm font-medium mb-2 text-foreground">
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
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2 text-foreground">
                  Categoría
                </label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
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
                <label htmlFor="description" className="block text-sm font-medium mb-2 text-foreground">
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
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/1000 caracteres
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Todas las denuncias son tratadas con la máxima confidencialidad. 
                  Tu información será utilizada únicamente para investigar el incidente reportado.
                </p>
              </div>

              <Button type="submit" className="w-full" variant="destructive">
                Enviar Denuncia
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Reports;
