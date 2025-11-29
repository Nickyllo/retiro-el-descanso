import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Calendar, Users, Key, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

interface BoardingPassProps {
  reservationCode: string;
  roomCode: string;
  packageName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  qrData: string;
}

export const BoardingPass = ({
  reservationCode,
  roomCode,
  packageName,
  checkIn,
  checkOut,
  guests,
  guestName,
  qrData,
}: BoardingPassProps) => {
  const passRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!passRef.current) return;

    try {
      const canvas = await html2canvas(passRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `boarding-pass-${reservationCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={passRef}
        className="bg-gradient-to-br from-background via-card to-primary/5 rounded-3xl p-8 border-2 border-primary/20 shadow-dramatic max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-dashed border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-foreground font-bold">
                Retiro El Descanso
              </h2>
              <p className="text-sm text-muted-foreground">Tu Pase de Acceso</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Código de Reserva
            </p>
            <p className="font-mono text-xl font-bold text-primary">
              {reservationCode}
            </p>
          </div>
        </div>

        {/* Guest Info */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Huésped Principal
          </p>
          <p className="font-serif text-3xl text-foreground font-bold">
            {guestName}
          </p>
          <p className="text-lg text-muted-foreground mt-1">{packageName}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-card/50 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground uppercase">Check-In</p>
            </div>
            <p className="font-mono text-sm font-semibold text-foreground">
              {new Date(checkIn).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground uppercase">Check-Out</p>
            </div>
            <p className="font-mono text-sm font-semibold text-foreground">
              {new Date(checkOut).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground uppercase">Huéspedes</p>
            </div>
            <p className="font-mono text-sm font-semibold text-foreground">
              {guests} {guests === 1 ? 'persona' : 'personas'}
            </p>
          </div>
        </div>

        {/* Room Code & QR */}
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-6 border-2 border-primary/20">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Código de Habitación
              </p>
            </div>
            <p className="font-mono text-4xl font-bold text-primary tracking-wider">
              {roomCode}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Usa este código para acceder a tu habitación
            </p>
          </div>

          <div className="bg-background p-4 rounded-2xl border-2 border-border/50">
            <QRCodeSVG
              value={qrData}
              size={120}
              level="H"
              includeMargin={false}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Presenta este pase digital al llegar • Válido para las fechas indicadas
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contacto: +57 (1) 234 5678 • info@retiroeldescanso.com
          </p>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <Button
          onClick={handleDownload}
          size="lg"
          className="gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Download className="w-5 h-5" />
          Descargar Pase de Acceso
        </Button>
      </div>
    </div>
  );
};
