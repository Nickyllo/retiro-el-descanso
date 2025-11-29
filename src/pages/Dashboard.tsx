import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Leaf, ArrowLeft, Users, Calendar, Banknote, Pencil, Trash2, X, User, Mail, Phone } from 'lucide-react';

interface Reservation {
  id: string;
  user_id: string;
  package_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  total_price: number;
  special_requests: string | null;
  created_at: string;
  user_name?: string;
}

const packages = [
  { id: 'basico', name: 'Paquete Básico', price: 150000, nights: 2 },
  { id: 'estandar', name: 'Paquete Estándar', price: 280000, nights: 3 },
  { id: 'premium', name: 'Paquete Premium', price: 450000, nights: 5 },
];

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

export default function Dashboard() {
  const { user, loading, isAdmin, fullName } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0 });
  const [profile, setProfile] = useState({ phone: '', full_name: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Edit modal state
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [editForm, setEditForm] = useState({
    package_type: '',
    check_in: '',
    check_out: '',
    guests: 1,
    status: '',
    total_price: 0,
  });
  
  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      if (isAdmin) {
        fetchAllReservations();
      }
    }
  }, [user, isAdmin]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ phone: profile.phone, full_name: profile.full_name })
      .eq('id', user.id);
    
    if (error) {
      toast({ title: 'Error al actualizar perfil', variant: 'destructive' });
    } else {
      toast({ title: 'Perfil actualizado correctamente' });
      setIsEditingProfile(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'La contraseña debe tener al menos 6 caracteres', variant: 'destructive' });
      return;
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast({ title: 'Error al cambiar contraseña', variant: 'destructive' });
    } else {
      toast({ title: 'Contraseña actualizada correctamente' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const fetchAllReservations = async () => {
    const { data: reservationsData } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (reservationsData) {
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
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error al actualizar', variant: 'destructive' });
    } else {
      toast({ title: `Reserva ${status === 'confirmed' ? 'confirmada' : status === 'cancelled' ? 'cancelada' : 'actualizada'}` });
      fetchAllReservations();
    }
  };

  const openEditModal = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setEditForm({
      package_type: reservation.package_type,
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      guests: reservation.guests,
      status: reservation.status,
      total_price: reservation.total_price,
    });
  };

  const calculateCheckOut = (checkInDate: string, packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || !checkInDate) return '';
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + pkg.nights);
    return date.toISOString().split('T')[0];
  };

  const handleEditFormChange = (field: string, value: string | number) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate checkout and price when package or checkin changes
      if (field === 'package_type' || field === 'check_in') {
        const pkgId = field === 'package_type' ? value as string : prev.package_type;
        const checkIn = field === 'check_in' ? value as string : prev.check_in;
        const pkg = packages.find(p => p.id === pkgId);
        
        if (pkg && checkIn) {
          updated.check_out = calculateCheckOut(checkIn, pkgId);
          updated.total_price = pkg.price * prev.guests;
        }
      }
      
      if (field === 'guests') {
        const pkg = packages.find(p => p.id === prev.package_type);
        if (pkg) {
          updated.total_price = pkg.price * (value as number);
        }
      }
      
      return updated;
    });
  };

  const saveEdit = async () => {
    if (!editingReservation) return;
    
    const { error } = await supabase
      .from('reservations')
      .update({
        package_type: editForm.package_type,
        check_in: editForm.check_in,
        check_out: editForm.check_out,
        guests: editForm.guests,
        status: editForm.status,
        total_price: editForm.total_price,
      })
      .eq('id', editingReservation.id);
    
    if (error) {
      toast({ title: 'Error al guardar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reserva actualizada' });
      setEditingReservation(null);
      fetchAllReservations();
    }
  };

  const deleteReservation = async () => {
    if (!deletingId) return;
    
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', deletingId);
    
    if (error) {
      toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reserva eliminada' });
      setDeletingId(null);
      fetchAllReservations();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-muted'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-serif text-lg">Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* User Profile Section */}
        <div className="bg-card rounded-xl border border-border/50 p-6 mb-8">
          <h2 className="font-serif text-2xl mb-6">Mi Perfil</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">Nombre</Label>
                  {isEditingProfile ? (
                    <Input
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">{profile.full_name || fullName || 'Sin nombre'}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">Correo</Label>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">Teléfono</Label>
                  {isEditingProfile ? (
                    <Input
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+57 300 123 4567"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">{profile.phone || 'No registrado'}</p>
                  )}
                </div>
              </div>
              
              {isEditingProfile ? (
                <div className="flex gap-2">
                  <Button onClick={updateProfile}>Guardar Cambios</Button>
                  <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancelar</Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditingProfile(true)}>Editar Perfil</Button>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-serif text-lg">Cambiar Contraseña</h3>
              <div className="space-y-3">
                <div>
                  <Label>Nueva Contraseña</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <Label>Confirmar Contraseña</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetir contraseña"
                  />
                </div>
                <Button onClick={changePassword} disabled={!newPassword || !confirmPassword}>
                  Actualizar Contraseña
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <>
            <h2 className="font-serif text-2xl mb-6">Panel de Administración</h2>
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
                <Banknote className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="font-serif text-2xl">{formatCOP(stats.revenue)}</p>
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
                  <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">{res.user_name}</td>
                    <td className="px-4 py-3 text-sm capitalize">{res.package_type}</td>
                    <td className="px-4 py-3 text-sm">{res.check_in} → {res.check_out}</td>
                    <td className="px-4 py-3 text-sm">{res.guests}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCOP(res.total_price)}</td>
                    <td className="px-4 py-3">{getStatusBadge(res.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(res)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {res.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(res.id, 'cancelled')}
                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingId(res.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No hay reservas aún
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
            </div>
          </>
        )}
      </main>

      {/* Edit Modal */}
      <Dialog open={!!editingReservation} onOpenChange={() => setEditingReservation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Paquete</Label>
              <Select value={editForm.package_type} onValueChange={(v) => handleEditFormChange('package_type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - {formatCOP(pkg.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha de entrada</Label>
              <Input
                type="date"
                value={editForm.check_in}
                onChange={(e) => handleEditFormChange('check_in', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de salida</Label>
              <Input type="date" value={editForm.check_out} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Huéspedes</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={editForm.guests}
                onChange={(e) => handleEditFormChange('guests', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={editForm.status} onValueChange={(v) => handleEditFormChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total:</p>
              <p className="font-serif text-2xl text-primary">{formatCOP(editForm.total_price)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReservation(null)}>Cancelar</Button>
            <Button onClick={saveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reserva será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteReservation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
