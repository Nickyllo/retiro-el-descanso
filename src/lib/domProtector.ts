/**
 * DOM Protector - Sistema de protección contra eliminación de elementos del DOM
 * Detecta cuando elementos protegidos son eliminados y los restaura automáticamente
 */

interface ProtectedElement {
  selector: string;
  constructor: () => HTMLElement | null;
  originalHTML: string | null;
  parentSelector: string | null;
  insertPosition: 'first' | 'last' | 'before' | 'after';
  referenceSelector?: string;
}

class DOMProtector {
  private protectedElements: Map<string, ProtectedElement> = new Map();
  private observer: MutationObserver | null = null;
  private isRestoring: boolean = false;
  private enabled: boolean = true;

  constructor() {
    this.initObserver();
  }

  private initObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      if (this.isRestoring || !this.enabled) return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          this.handleRemovedNodes(mutation.removedNodes, mutation.target as HTMLElement);
        }
      }
    });

    // Observar todo el documento
    if (document.body) {
      this.startObserving();
    } else {
      document.addEventListener('DOMContentLoaded', () => this.startObserving());
    }
  }

  private startObserving(): void {
    if (this.observer && document.body) {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  private handleRemovedNodes(removedNodes: NodeList, parent: HTMLElement): void {
    removedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const element = node as HTMLElement;
      
      // Verificar si el elemento removido coincide con algún selector protegido
      for (const [id, protected_] of this.protectedElements) {
        // Verificar si el nodo removido coincide con el selector
        if (this.matchesSelector(element, protected_.selector)) {
          console.warn(`[DOMProtector] Elemento protegido eliminado: ${protected_.selector}`);
          this.restoreElement(id, protected_, parent);
          return;
        }

        // Verificar si algún hijo del nodo removido coincide
        const matchingChild = element.querySelector(protected_.selector);
        if (matchingChild) {
          console.warn(`[DOMProtector] Elemento protegido eliminado (como hijo): ${protected_.selector}`);
          // En este caso, el padre fue eliminado, necesitamos restaurar en el ancestro correcto
          this.restoreElement(id, protected_, null);
        }
      }
    });
  }

  private matchesSelector(element: HTMLElement, selector: string): boolean {
    try {
      return element.matches(selector);
    } catch {
      return false;
    }
  }

  private restoreElement(id: string, protected_: ProtectedElement, originalParent: HTMLElement | null): void {
    // Evitar loops de restauración
    this.isRestoring = true;

    setTimeout(() => {
      try {
        // Verificar si el elemento ya existe (puede haber sido restaurado o nunca fue eliminado)
        const existing = document.querySelector(protected_.selector);
        if (existing) {
          this.isRestoring = false;
          return;
        }

        // Intentar usar el constructor primero
        let newElement: HTMLElement | null = null;
        
        try {
          newElement = protected_.constructor();
        } catch (constructorError) {
          console.warn(`[DOMProtector] Constructor falló, usando HTML original:`, constructorError);
        }

        // Si el constructor falla, usar el HTML original
        if (!newElement && protected_.originalHTML) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = protected_.originalHTML;
          newElement = wrapper.firstElementChild as HTMLElement;
        }

        if (!newElement) {
          console.error(`[DOMProtector] No se pudo restaurar el elemento: ${protected_.selector}`);
          this.isRestoring = false;
          return;
        }

        // Determinar dónde insertar el elemento
        let targetParent: HTMLElement | null = null;

        if (protected_.parentSelector) {
          targetParent = document.querySelector(protected_.parentSelector) as HTMLElement;
        } else if (originalParent && document.body.contains(originalParent)) {
          targetParent = originalParent;
        } else {
          targetParent = document.body;
        }

        if (!targetParent) {
          console.error(`[DOMProtector] No se encontró el padre para restaurar: ${protected_.parentSelector}`);
          this.isRestoring = false;
          return;
        }

        // Insertar según la posición especificada
        switch (protected_.insertPosition) {
          case 'first':
            targetParent.insertBefore(newElement, targetParent.firstChild);
            break;
          case 'last':
            targetParent.appendChild(newElement);
            break;
          case 'before':
            if (protected_.referenceSelector) {
              const reference = targetParent.querySelector(protected_.referenceSelector);
              if (reference) {
                targetParent.insertBefore(newElement, reference);
              } else {
                targetParent.appendChild(newElement);
              }
            }
            break;
          case 'after':
            if (protected_.referenceSelector) {
              const reference = targetParent.querySelector(protected_.referenceSelector);
              if (reference && reference.nextSibling) {
                targetParent.insertBefore(newElement, reference.nextSibling);
              } else {
                targetParent.appendChild(newElement);
              }
            }
            break;
        }

        console.info(`[DOMProtector] Elemento restaurado exitosamente: ${protected_.selector}`);

        // Actualizar el HTML original con el nuevo elemento
        protected_.originalHTML = newElement.outerHTML;

      } catch (error) {
        console.error(`[DOMProtector] Error al restaurar elemento:`, error);
      } finally {
        this.isRestoring = false;
      }
    }, 0);
  }

  /**
   * Registra un elemento para protegerlo contra eliminación
   * @param id - Identificador único para este elemento protegido
   * @param options - Opciones de configuración
   */
  public register(
    id: string,
    options: {
      selector: string;
      constructor: () => HTMLElement | null;
      parentSelector?: string;
      insertPosition?: 'first' | 'last' | 'before' | 'after';
      referenceSelector?: string;
    }
  ): void {
    // Capturar el HTML original del elemento si existe
    const existingElement = document.querySelector(options.selector) as HTMLElement;
    const originalHTML = existingElement?.outerHTML || null;

    // Determinar el selector del padre si no se proporciona
    let parentSelector = options.parentSelector || null;
    if (!parentSelector && existingElement?.parentElement) {
      // Intentar crear un selector único para el padre
      const parent = existingElement.parentElement;
      if (parent.id) {
        parentSelector = `#${parent.id}`;
      } else if (parent.className) {
        const classes = parent.className.split(' ').filter(c => c).join('.');
        parentSelector = parent.tagName.toLowerCase() + (classes ? `.${classes}` : '');
      } else {
        parentSelector = parent.tagName.toLowerCase();
      }
    }

    this.protectedElements.set(id, {
      selector: options.selector,
      constructor: options.constructor,
      originalHTML,
      parentSelector,
      insertPosition: options.insertPosition || 'last',
      referenceSelector: options.referenceSelector,
    });

    console.info(`[DOMProtector] Elemento registrado: ${options.selector} (ID: ${id})`);
  }

  /**
   * Desregistra un elemento protegido
   * @param id - Identificador del elemento a desregistrar
   */
  public unregister(id: string): void {
    if (this.protectedElements.delete(id)) {
      console.info(`[DOMProtector] Elemento desregistrado: ${id}`);
    }
  }

  /**
   * Habilita o deshabilita la protección
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.info(`[DOMProtector] Protección ${enabled ? 'habilitada' : 'deshabilitada'}`);
  }

  /**
   * Obtiene el estado actual de la protección
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Lista todos los elementos protegidos
   */
  public listProtected(): string[] {
    return Array.from(this.protectedElements.keys());
  }

  /**
   * Destruye el protector y libera recursos
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.protectedElements.clear();
    console.info(`[DOMProtector] Protector destruido`);
  }
}

// Instancia global del protector
export const domProtector = new DOMProtector();

// Exponer globalmente para uso desde la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).domProtector = domProtector;
}

export default DOMProtector;
