import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Leaf, ArrowLeft, LogOut, X } from 'lucide-react';
import { z } from 'zod';
import { BoardingPass } from '@/components/BoardingPass';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const packages = [
  { id: 'basico', name: 'Paquete Básico', price: 150000, nights: 2 },
  { id: 'estandar', name: 'Paquete Estándar', price: 280000, nights: 3 },
  { id: 'premium', name: 'Paquete Premium', price: 450000, nights: 5 },
];

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

const reservationSchema = z.object({
  packageType: z.string().min(1, 'Selecciona un paquete'),
  checkIn: z.string().min(1, 'Selecciona fecha de entrada'),
  guests: z.number().min(1).max(10),
  specialRequests: z.string().max(500).optional(),
});

export default function Reservations() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packageType, setPackageType] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReservations();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setUserProfile(data);
  };

  const generateReservationCode = () => {
    return 'RD' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateRoomCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const fetchReservations = async () => {
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMyReservations(data);
  };

  const calculateCheckOut = (checkInDate: string, packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || !checkInDate) return '';
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + pkg.nights);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const selectedPkg = packages.find(p => p.id === packageType);
      const checkOut = calculateCheckOut(checkIn, packageType);

      reservationSchema.parse({ packageType, checkIn, guests, specialRequests });

      const reservationCode = generateReservationCode();
      const roomCode = generateRoomCode();

      const { data: newReservation, error } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id,
          package_type: packageType,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          special_requests: specialRequests || null,
          total_price: selectedPkg ? selectedPkg.price * guests : 0,
          reservation_code: reservationCode,
          room_code: roomCode,
        })
        .select()
        .single();

      if (error) throw error;

      // Send email with boarding pass
      try {
        const profile = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        await supabase.functions.invoke('send-reservation-email', {
          body: {
            guestEmail: user.email,
            guestName: profile?.data?.full_name || user.email?.split('@')[0] || 'Huésped',
            packageName: selectedPkg?.name || packageType,
            reservationCode: reservationCode,
            roomCode: roomCode,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests,
            totalPrice: selectedPkg ? selectedPkg.price * guests : 0,
          },
        });
        console.log('Reservation email sent successfully');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the reservation if email fails
      }

      toast({ title: 'Reserva creada exitosamente', description: 'Revisa tu correo para ver tu pase de acceso' });
      
      // Show boarding pass
      setCurrentReservation({
        ...newReservation,
        packageName: selectedPkg?.name,
      });
      setShowBoardingPass(true);

      setPackageType('');
      setCheckIn('');
      setGuests(1);
      setSpecialRequests('');
      fetchReservations();
    } catch (err: any) {
      toast({
        title: 'Error al crear reserva',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPkg = packages.find(p => p.id === packageType);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-serif text-lg">Retiro El Descanso</span>
          </a>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl text-foreground mb-2">Reservaciones</h1>
          <p className="text-muted-foreground mb-8">Reserva tu próxima experiencia de paz y bienestar</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-card rounded-2xl shadow-elegant p-6 border border-border/50">
              <h2 className="font-serif text-xl mb-6">Nueva Reserva</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Paquete</Label>
                  <Select value={packageType} onValueChange={setPackageType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un paquete" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - {formatCOP(pkg.price)} ({pkg.nights} noches)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkIn">Fecha de entrada</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="checkIn"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-10"
                    />
                  </div>
                </div>

                {checkIn && packageType && (
                  <p className="text-sm text-muted-foreground">
                    Salida: {calculateCheckOut(checkIn, packageType)}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="guests">Número de huéspedes</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      max={10}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requests">Solicitudes especiales</Label>
                  <Textarea
                    id="requests"
                    placeholder="Dietas especiales, alergias, preferencias..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                  />
                </div>

                {selectedPkg && (
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total estimado:</p>
                    <p className="font-serif text-2xl text-primary">{formatCOP(selectedPkg.price * guests)}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creando...' : 'Crear Reserva'}
                </Button>
              </form>
            </div>

            {/* My Reservations */}
            <div>
              <h2 className="font-serif text-xl mb-4">Mis Reservas</h2>
              {myReservations.length === 0 ? (
                <p className="text-muted-foreground">No tienes reservas aún</p>
              ) : (
                <div className="space-y-4">
                  {myReservations.map((res) => {
                    const pkg = packages.find(p => p.id === res.package_type);
                    return (
                      <div key={res.id} className="bg-card rounded-xl p-4 border border-border/50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{pkg?.name || res.package_type}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {res.status === 'confirmed' ? 'Confirmada' : 
                             res.status === 'pending' ? 'Pendiente' : res.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {res.check_in} → {res.check_out}
                        </p>
                        <p className="text-sm text-muted-foreground">{res.guests} huésped(es)</p>
                        <p className="font-serif text-lg text-primary mt-2">{formatCOP(res.total_price)}</p>
                        
                        {res.reservation_code && res.room_code && (
                          <Button
                            onClick={() => {
                              setCurrentReservation({
                                ...res,
                                packageName: pkg?.name,
                              });
                              setShowBoardingPass(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                          >
                            Ver Pase de Acceso
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Boarding Pass Dialog */}
      <Dialog open={showBoardingPass} onOpenChange={setShowBoardingPass}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background">
          <button
            onClick={() => setShowBoardingPass(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          {currentReservation && userProfile && (
            <BoardingPass
              reservationCode={currentReservation.reservation_code}
              roomCode={currentReservation.room_code}
              packageName={currentReservation.packageName}
              checkIn={currentReservation.check_in}
              checkOut={currentReservation.check_out}
              guests={currentReservation.guests}
              guestName={userProfile.full_name || user?.email || 'Huésped'}
              qrData={`RESERVA:${currentReservation.reservation_code}|ROOM:${currentReservation.room_code}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
