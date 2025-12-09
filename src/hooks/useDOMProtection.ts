import { useEffect, useRef } from 'react';
import { domProtector } from '@/lib/domProtector';

interface UseDOMProtectionOptions {
  /**
   * Identificador único para el elemento protegido
   */
  id: string;
  /**
   * Selector CSS para identificar el elemento
   */
  selector: string;
  /**
   * Función que reconstruye el elemento (opcional, se genera automáticamente si no se proporciona)
   */
  rebuilder?: () => HTMLElement | null;
  /**
   * Selector del elemento padre donde restaurar
   */
  parentSelector?: string;
  /**
   * Posición donde insertar el elemento restaurado
   */
  insertPosition?: 'first' | 'last' | 'before' | 'after';
  /**
   * Selector de referencia para posiciones 'before' y 'after'
   */
  referenceSelector?: string;
  /**
   * Si está habilitada la protección (default: true)
   */
  enabled?: boolean;
}

/**
 * Hook para proteger un elemento React contra eliminación del DOM
 * 
 * @example
 * ```tsx
 * function ProtectedComponent() {
 *   const ref = useDOMProtection({
 *     id: 'my-component',
 *     selector: '#my-protected-element',
 *   });
 * 
 *   return <div id="my-protected-element" ref={ref}>Contenido protegido</div>;
 * }
 * ```
 */
export function useDOMProtection<T extends HTMLElement = HTMLElement>(
  options: UseDOMProtectionOptions
): React.RefObject<T> {
  const ref = useRef<T>(null);
  const { id, selector, rebuilder, parentSelector, insertPosition, referenceSelector, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    // Esperar a que el elemento esté montado
    const timeoutId = setTimeout(() => {
      const element = ref.current || document.querySelector(selector) as T;
      
      if (!element) {
        console.warn(`[useDOMProtection] Elemento no encontrado: ${selector}`);
        return;
      }

      // Crear el constructor que clona el elemento actual
      const elementConstructor = rebuilder || (() => {
        if (ref.current) {
          return ref.current.cloneNode(true) as HTMLElement;
        }
        const original = document.querySelector(selector) as HTMLElement;
        return original?.cloneNode(true) as HTMLElement || null;
      });

      domProtector.register(id, {
        selector,
        constructor: elementConstructor,
        parentSelector,
        insertPosition,
        referenceSelector,
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      domProtector.unregister(id);
    };
  }, [id, selector, rebuilder, parentSelector, insertPosition, referenceSelector, enabled]);

  return ref;
}

export default useDOMProtection;
