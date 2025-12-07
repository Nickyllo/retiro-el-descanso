import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailRequest {
  guestEmail: string;
  guestName: string;
  packageName: string;
  reservationCode: string;
  roomCode: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
}

const generateBoardingPassHTML = (data: ReservationEmailRequest) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu Pase de Acceso - Retiro El Descanso</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(to bottom, #f9fafb, #f3f4f6); color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; margin-bottom: 16px; padding: 12px;">
            <span style="font-size: 36px;">🍃</span>
          </div>
          <h1 style="font-size: 32px; font-weight: bold; color: #059669; margin: 0 0 8px 0;">Retiro El Descanso</h1>
          <p style="font-size: 18px; color: #6b7280; margin: 0;">¡Tu reserva ha sido confirmada!</p>
        </div>

        <!-- Boarding Pass Card -->
        <div style="background: linear-gradient(to bottom right, #ffffff, #f0fdf4); border: 2px solid #d1fae5; border-radius: 24px; padding: 40px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); margin-bottom: 30px;">
          <!-- Reservation Code Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 24px; border-bottom: 2px dashed #d1fae5; margin-bottom: 32px;">
            <div>
              <h2 style="font-size: 28px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0;">Tu Pase de Acceso</h2>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">Presenta este código al llegar</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Código de Reserva</p>
              <p style="font-size: 24px; font-weight: bold; color: #059669; font-family: 'Courier New', monospace; margin: 0;">${data.reservationCode}</p>
            </div>
          </div>

          <!-- Guest Name -->
          <div style="margin-bottom: 32px;">
            <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Huésped Principal</p>
            <h3 style="font-size: 36px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0;">${data.guestName}</h3>
            <p style="font-size: 18px; color: #6b7280; margin: 0;">${data.packageName}</p>
          </div>

          <!-- Details Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
            <div style="background: rgba(255, 255, 255, 0.7); border: 1px solid #d1fae5; border-radius: 16px; padding: 16px;">
              <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">📅 Check-In</p>
              <p style="font-size: 14px; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace; margin: 0;">${formatDate(data.checkIn)}</p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.7); border: 1px solid #d1fae5; border-radius: 16px; padding: 16px;">
              <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">📅 Check-Out</p>
              <p style="font-size: 14px; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace; margin: 0;">${formatDate(data.checkOut)}</p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.7); border: 1px solid #d1fae5; border-radius: 16px; padding: 16px;">
              <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">👥 Huéspedes</p>
              <p style="font-size: 14px; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace; margin: 0;">${data.guests} ${data.guests === 1 ? 'persona' : 'personas'}</p>
            </div>
          </div>

          <!-- Room Code -->
          <div style="background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)); border: 2px solid #10b981; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <p style="font-size: 12px; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">🔑 Código de Habitación</p>
            <p style="font-size: 48px; font-weight: bold; color: #059669; font-family: 'Courier New', monospace; margin: 0; letter-spacing: 4px;">${data.roomCode}</p>
            <p style="font-size: 12px; color: #6b7280; margin: 8px 0 0 0;">Usa este código para acceder a tu habitación</p>
          </div>

          <!-- QR Code Placeholder -->
          <div style="text-align: center; padding: 24px; background: white; border: 2px solid #d1fae5; border-radius: 16px; margin-bottom: 24px;">
            <div style="width: 200px; height: 200px; margin: 0 auto; background: linear-gradient(45deg, #f0fdf4, #dcfce7); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 14px; color: #059669; text-align: center; padding: 20px;">
                <p style="margin: 0; font-weight: bold;">Código QR</p>
                <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.7;">Disponible en tu pase digital</p>
              </div>
            </div>
          </div>

          <!-- Total Price -->
          <div style="text-align: center; padding: 20px; background: rgba(16, 185, 129, 0.05); border-radius: 12px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">Total de la Reserva</p>
            <p style="font-size: 32px; font-weight: bold; color: #059669; margin: 0;">${formatPrice(data.totalPrice)}</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 24px; border-top: 2px dashed #d1fae5;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">Presenta este pase digital al llegar • Válido para las fechas indicadas</p>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">Contacto: +57 (1) 234 5678 • info@retiroeldescanso.com</p>
          </div>
        </div>

        <!-- Additional Info -->
        <div style="background: white; border-radius: 16px; padding: 24px; text-align: center;">
          <h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0;">Preparativos para tu estadía</h3>
          <ul style="list-style: none; padding: 0; margin: 0; text-align: left; color: #4b5563;">
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✓ Trae ropa cómoda para yoga y meditación</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✓ No olvides protector solar y repelente</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✓ Llega con la mente abierta y el corazón dispuesto</li>
            <li style="padding: 8px 0;">✓ Desconecta tu teléfono y conéctate contigo mismo</li>
          </ul>
        </div>

        <!-- Footer Message -->
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0 0 8px 0;">¡Nos vemos pronto en Retiro El Descanso!</p>
          <p style="margin: 0;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReservationEmailRequest = await req.json();

    console.log("Sending reservation email to:", data.guestEmail);

    const emailHtml = generateBoardingPassHTML(data);

    const emailResponse = await resend.emails.send({
      from: "Retiro El Descanso <reservas@nickyllo.com>",
      to: [data.guestEmail],
      subject: `Tu Pase de Acceso - Reserva ${data.reservationCode}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending reservation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
