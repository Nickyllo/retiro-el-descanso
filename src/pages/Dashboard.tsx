import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, ArrowLeft, Users, Calendar, DollarSign } from 'lucide-react';

interface Reservation {
  id: string;
  user_id: string;
  package_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  total_price: number;
  created_at: string;
  user_name?: string;
}

export default function Dashboard() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAllReservations();
    }
  }, [user, isAdmin]);

  const fetchAllReservations = async () => {
    const { data: reservationsData } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (reservationsData) {
      // Fetch profiles separately
      const userIds = [...new Set(reservationsData.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]) || []);
      
      const enrichedReservations = reservationsData.map(r => ({
        ...r,
        user_name: profilesMap.get(r.user_id) || 'Sin nombre'
      }));
      
      setReservations(enrichedReservations);
      setStats({
        total: reservationsData.length,
        pending: reservationsData.filter(r => r.status === 'pending').length,
        revenue: reservationsData.reduce((sum, r) => sum + (r.total_price || 0), 0),
      });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);
    fetchAllReservations();
  };

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-serif text-lg">Dashboard Admin</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reservas</p>
                <p className="font-serif text-2xl">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="font-serif text-2xl">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="font-serif text-2xl">${stats.revenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-serif text-xl">Todas las Reservas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Paquete</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fechas</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Huéspedes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id} className="border-t border-border/30">
                    <td className="px-4 py-3 text-sm">{res.user_name || 'Sin nombre'}</td>
                    <td className="px-4 py-3 text-sm capitalize">{res.package_type}</td>
                    <td className="px-4 py-3 text-sm">{res.check_in} → {res.check_out}</td>
                    <td className="px-4 py-3 text-sm">{res.guests}</td>
                    <td className="px-4 py-3 text-sm font-medium">${res.total_price}</td>
                    <td className="px-4 py-3">
                      <Select value={res.status} onValueChange={(v) => updateStatus(res.id, v)}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="confirmed">Confirmada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No hay reservas aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
