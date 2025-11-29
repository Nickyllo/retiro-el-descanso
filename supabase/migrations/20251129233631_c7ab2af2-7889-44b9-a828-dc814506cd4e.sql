-- Create a table to track hotel capacity settings
CREATE TABLE IF NOT EXISTS public.hotel_capacity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_rooms INTEGER NOT NULL DEFAULT 6,
  max_guests_per_room INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default capacity
INSERT INTO public.hotel_capacity (max_rooms, max_guests_per_room)
VALUES (6, 4);

-- Enable RLS
ALTER TABLE public.hotel_capacity ENABLE ROW LEVEL SECURITY;

-- Policy for viewing capacity (everyone can view)
CREATE POLICY "Anyone can view hotel capacity"
ON public.hotel_capacity
FOR SELECT
USING (true);

-- Policy for admins to update capacity
CREATE POLICY "Admins can update capacity"
ON public.hotel_capacity
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a function to check room availability for a date range
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_check_in DATE,
  p_check_out DATE,
  p_guests INTEGER,
  p_exclude_reservation_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_rooms INTEGER;
  v_max_guests INTEGER;
  v_occupied_rooms INTEGER;
  v_total_guests INTEGER;
  v_available BOOLEAN;
  v_current_date DATE;
BEGIN
  -- Get hotel capacity
  SELECT max_rooms, max_guests_per_room 
  INTO v_max_rooms, v_max_guests
  FROM public.hotel_capacity
  LIMIT 1;

  -- Initialize counters
  v_occupied_rooms := 0;
  v_total_guests := 0;
  v_current_date := p_check_in;

  -- Check each date in the range
  WHILE v_current_date < p_check_out LOOP
    -- Count reservations for this date
    SELECT 
      COUNT(DISTINCT id),
      COALESCE(SUM(guests), 0)
    INTO v_occupied_rooms, v_total_guests
    FROM public.reservations
    WHERE status IN ('confirmed', 'pending')
      AND check_in <= v_current_date
      AND check_out > v_current_date
      AND (p_exclude_reservation_id IS NULL OR id != p_exclude_reservation_id);

    -- Check if adding this reservation would exceed capacity
    IF v_occupied_rooms >= v_max_rooms OR (v_total_guests + p_guests) > (v_max_rooms * v_max_guests) THEN
      RETURN json_build_object(
        'available', false,
        'reason', 'Capacidad máxima alcanzada para las fechas seleccionadas',
        'occupied_rooms', v_occupied_rooms,
        'max_rooms', v_max_rooms,
        'total_guests', v_total_guests,
        'max_total_guests', v_max_rooms * v_max_guests
      );
    END IF;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  -- If we made it through all dates, rooms are available
  RETURN json_build_object(
    'available', true,
    'occupied_rooms', v_occupied_rooms,
    'max_rooms', v_max_rooms,
    'total_guests', v_total_guests,
    'max_total_guests', v_max_rooms * v_max_guests
  );
END;
$$;

-- Add a column to track if reminder email was sent
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Create trigger for hotel_capacity updated_at
CREATE TRIGGER update_hotel_capacity_updated_at
BEFORE UPDATE ON public.hotel_capacity
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();