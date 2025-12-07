import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for reservations that need reminders...");

    // Get tomorrow's date (24 hours from now)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

    console.log("Looking for check-ins on:", tomorrowDateStr);

    // Find all reservations with check-in tomorrow that haven't received a reminder
    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("*")
      .eq("check_in", tomorrowDateStr)
      .eq("reminder_sent", false)
      .in("status", ["confirmed", "pending"]);

    if (reservationsError) {
      console.error("Error fetching reservations:", reservationsError);
      throw reservationsError;
    }

    console.log(`Found ${reservations?.length || 0} reservations needing reminders`);

    if (!reservations || reservations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reservations need reminders", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let successCount = 0;
    let errorCount = 0;

    // Send reminder email for each reservation
    for (const reservation of reservations) {
      try {
        // Get user profile for guest name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", reservation.user_id)
          .maybeSingle();

        // Get user email
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
          reservation.user_id
        );

        if (userError || !user?.email) {
          console.error(`Could not get user email for reservation ${reservation.id}`);
          errorCount++;
          continue;
        }

        const guestName = profile?.full_name || user.email.split('@')[0] || 'Huésped';

        // Send reminder email
        const { error: emailError } = await resend.emails.send({
          from: "Retiro El Descanso <reservas@nickyllo.com>",
          to: [user.email],
          subject: "Recordatorio: Tu retiro comienza mañana 🌿",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #8B7355 0%, #A0826D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
                  .info-box { background: #f8f5f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #8B7355; }
                  .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
                  .label { font-weight: bold; color: #8B7355; }
                  .button { display: inline-block; background: #8B7355; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                  .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0;">🌿 Retiro El Descanso</h1>
                    <p style="margin: 10px 0 0;">Tu experiencia comienza mañana</p>
                  </div>
                  
                  <div class="content">
                    <h2>Hola ${guestName},</h2>
                    
                    <p>Este es un recordatorio amigable de que tu retiro en <strong>El Descanso</strong> comienza mañana. ¡Estamos emocionados de recibirte!</p>
                    
                    <div class="info-box">
                      <h3 style="margin-top: 0; color: #8B7355;">Detalles de tu Reserva</h3>
                      <div class="info-row">
                        <span class="label">Código de Reserva:</span>
                        <span>${reservation.reservation_code}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Código de Habitación:</span>
                        <span>${reservation.room_code}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Check-in:</span>
                        <span>${new Date(reservation.check_in).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Check-out:</span>
                        <span>${new Date(reservation.check_out).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Huéspedes:</span>
                        <span>${reservation.guests} persona(s)</span>
                      </div>
                    </div>
                    
                    <h3>Recomendaciones para tu llegada:</h3>
                    <ul>
                      <li>Trae tu pase de acceso (boarding pass) impreso o en tu celular</li>
                      <li>El check-in comienza a las 2:00 PM</li>
                      <li>Trae ropa cómoda para yoga y meditación</li>
                      <li>No olvides tu traje de baño para la piscina</li>
                      <li>Recomendamos llegar con tiempo para disfrutar el paisaje</li>
                    </ul>
                    
                    ${reservation.special_requests ? `
                      <div class="info-box">
                        <h4 style="margin-top: 0;">Tus solicitudes especiales:</h4>
                        <p style="margin: 0;">${reservation.special_requests}</p>
                      </div>
                    ` : ''}
                    
                    <p>Si tienes alguna pregunta o necesitas hacer cambios, no dudes en contactarnos.</p>
                    
                    <p style="margin-top: 30px;">¡Nos vemos pronto!</p>
                    <p style="margin: 5px 0;"><strong>El equipo de Retiro El Descanso</strong></p>
                  </div>
                  
                  <div class="footer">
                    <p>Este es un recordatorio automático para tu reserva con código ${reservation.reservation_code}</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        if (emailError) {
          console.error(`Error sending email for reservation ${reservation.id}:`, emailError);
          errorCount++;
          continue;
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from("reservations")
          .update({ reminder_sent: true })
          .eq("id", reservation.id);

        if (updateError) {
          console.error(`Error updating reminder status for ${reservation.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`Reminder sent successfully for reservation ${reservation.id}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing reservation ${reservation.id}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reminder emails processed",
        total: reservations.length,
        success: successCount,
        errors: errorCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-reminder-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
