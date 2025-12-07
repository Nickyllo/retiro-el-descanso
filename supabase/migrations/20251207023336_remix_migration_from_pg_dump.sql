CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: check_room_availability(date, date, integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_room_availability(p_check_in date, p_check_out date, p_guests integer, p_exclude_reservation_id uuid DEFAULT NULL::uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;


--
-- Name: handle_new_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: hotel_capacity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hotel_capacity (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    max_rooms integer DEFAULT 6 NOT NULL,
    max_guests_per_room integer DEFAULT 4 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    package_type text NOT NULL,
    check_in date NOT NULL,
    check_out date NOT NULL,
    guests integer DEFAULT 1,
    special_requests text,
    status text DEFAULT 'pending'::text,
    total_price numeric(10,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reservation_code text,
    room_code text,
    reminder_sent boolean DEFAULT false
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL
);


--
-- Name: hotel_capacity hotel_capacity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_capacity
    ADD CONSTRAINT hotel_capacity_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: hotel_capacity update_hotel_capacity_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_hotel_capacity_updated_at BEFORE UPDATE ON public.hotel_capacity FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reservations Admins can delete reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete reservations" ON public.reservations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: reservations Admins can update all reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all reservations" ON public.reservations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: hotel_capacity Admins can update capacity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update capacity" ON public.hotel_capacity FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: reservations Admins can view all reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all reservations" ON public.reservations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: hotel_capacity Anyone can view hotel capacity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view hotel capacity" ON public.hotel_capacity FOR SELECT USING (true);


--
-- Name: reservations Users can create own reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: reservations Users can update own reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own reservations" ON public.reservations FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: reservations Users can view own reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own reservations" ON public.reservations FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: hotel_capacity; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hotel_capacity ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: reservations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


