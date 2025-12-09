import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { domProtector } from '@/lib/domProtector';

/**
 * Componente que activa la protección DOM en todas las rutas
 * Detecta cambios de navegación y recaptura el snapshot del DOM
 */
export function DOMProtectionProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    // Esperar a que React renderice la nueva ruta
    const timeoutId = setTimeout(() => {
      domProtector.enableFullPageProtection();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return <>{children}</>;
}

export default DOMProtectionProvider;
