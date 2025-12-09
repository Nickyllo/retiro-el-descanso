/**
 * DOM Protector - Sistema de protección contra eliminación de elementos del DOM
 * Detecta cuando elementos protegidos son eliminados y los restaura automáticamente
 * Modo completo: protege toda la página automáticamente
 */

interface ProtectedElement {
  selector: string;
  constructor: () => HTMLElement | null;
  originalHTML: string | null;
  parentSelector: string | null;
  insertPosition: 'first' | 'last' | 'before' | 'after';
  referenceSelector?: string;
  siblingIndex?: number;
}

class DOMProtector {
  private protectedElements: Map<string, ProtectedElement> = new Map();
  private observer: MutationObserver | null = null;
  private isRestoring: boolean = false;
  private enabled: boolean = true;
  private fullPageProtection: boolean = false;
  private pageSnapshot: string | null = null;
  private elementSnapshots: Map<string, { html: string; parentSelector: string; siblingIndex: number }> = new Map();

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
      
      // Si está en modo protección completa, restaurar cualquier elemento
      if (this.fullPageProtection) {
        this.restoreFromSnapshot(element, parent);
        return;
      }

      // Verificar si el elemento removido coincide con algún selector protegido
      for (const [id, protected_] of this.protectedElements) {
        if (this.matchesSelector(element, protected_.selector)) {
          console.warn(`[DOMProtector] Elemento protegido eliminado: ${protected_.selector}`);
          this.restoreElement(id, protected_, parent);
          return;
        }

        const matchingChild = element.querySelector(protected_.selector);
        if (matchingChild) {
          console.warn(`[DOMProtector] Elemento protegido eliminado (como hijo): ${protected_.selector}`);
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

  private getElementIdentifier(element: HTMLElement): string {
    const parts: string[] = [];
    
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.getAttribute('data-protected')) {
      return `[data-protected="${element.getAttribute('data-protected')}"]`;
    }
    
    parts.push(element.tagName.toLowerCase());
    
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.trim()).slice(0, 3);
      if (classes.length) {
        parts.push(`.${classes.join('.')}`);
      }
    }
    
    return parts.join('');
  }

  private getSiblingIndex(element: HTMLElement): number {
    if (!element.parentElement) return 0;
    return Array.from(element.parentElement.children).indexOf(element);
  }

  private restoreFromSnapshot(element: HTMLElement, originalParent: HTMLElement): void {
    this.isRestoring = true;

    setTimeout(() => {
      try {
        // Buscar snapshot por cualquier método posible
        let snapshot = null;
        let matchedKey = '';
        
        // Método 1: Buscar por path único
        const siblingIndex = originalParent ? Array.from(originalParent.children).indexOf(element) : 0;
        const uniquePath = this.createUniquePath(element, siblingIndex >= 0 ? siblingIndex : 0);
        snapshot = this.elementSnapshots.get(uniquePath);
        matchedKey = uniquePath;
        
        // Método 2: Buscar por ID si existe
        if (!snapshot && element.id) {
          for (const [key, value] of this.elementSnapshots) {
            if (key.includes(`#${element.id}`)) {
              snapshot = value;
              matchedKey = key;
              break;
            }
          }
        }
        
        // Método 3: Buscar por data-protected
        if (!snapshot && element.getAttribute('data-protected')) {
          const dataAttr = element.getAttribute('data-protected');
          for (const [key, value] of this.elementSnapshots) {
            if (key.includes(`[data-protected="${dataAttr}"]`)) {
              snapshot = value;
              matchedKey = key;
              break;
            }
          }
        }
        
        // Método 4: Buscar por HTML similar
        if (!snapshot) {
          const elementHTML = element.outerHTML;
          for (const [key, value] of this.elementSnapshots) {
            if (value.html === elementHTML || value.html.includes(element.innerHTML.substring(0, 100))) {
              snapshot = value;
              matchedKey = key;
              break;
            }
          }
        }

        if (snapshot) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = snapshot.html;
          const newElement = wrapper.firstElementChild as HTMLElement;

          if (!newElement) {
            this.isRestoring = false;
            return;
          }

          let targetParent: HTMLElement | null = null;
          
          if (snapshot.parentSelector === 'body') {
            targetParent = document.body;
          } else if (snapshot.parentSelector) {
            targetParent = document.querySelector(snapshot.parentSelector) as HTMLElement;
          }
          
          if (!targetParent && originalParent && document.body.contains(originalParent)) {
            targetParent = originalParent;
          }
          
          if (!targetParent) {
            targetParent = document.body;
          }

          // Insertar en la posición original
          const children = Array.from(targetParent.children);
          if (snapshot.siblingIndex < children.length) {
            targetParent.insertBefore(newElement, children[snapshot.siblingIndex]);
          } else {
            targetParent.appendChild(newElement);
          }

          console.info(`[DOMProtector] Elemento restaurado: ${matchedKey}`);
        } else {
          // Restaurar usando el HTML del elemento eliminado directamente
          const wrapper = document.createElement('div');
          wrapper.innerHTML = element.outerHTML;
          const newElement = wrapper.firstElementChild as HTMLElement;

          if (newElement && originalParent && document.body.contains(originalParent)) {
            originalParent.appendChild(newElement);
            console.info(`[DOMProtector] Elemento restaurado desde HTML original`);
          }
        }
      } catch (error) {
        console.error(`[DOMProtector] Error al restaurar:`, error);
      } finally {
        this.isRestoring = false;
      }
    }, 0);
  }

  private restoreElement(id: string, protected_: ProtectedElement, originalParent: HTMLElement | null): void {
    this.isRestoring = true;

    setTimeout(() => {
      try {
        const existing = document.querySelector(protected_.selector);
        if (existing) {
          this.isRestoring = false;
          return;
        }

        let newElement: HTMLElement | null = null;
        
        try {
          newElement = protected_.constructor();
        } catch (constructorError) {
          console.warn(`[DOMProtector] Constructor falló, usando HTML original:`, constructorError);
        }

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
        protected_.originalHTML = newElement.outerHTML;

      } catch (error) {
        console.error(`[DOMProtector] Error al restaurar elemento:`, error);
      } finally {
        this.isRestoring = false;
      }
    }, 0);
  }

  /**
   * Activa la protección completa de toda la página
   * Captura un snapshot de todos los elementos y los restaura si son eliminados
   */
  public enableFullPageProtection(): void {
    if (this.fullPageProtection) return;
    
    this.fullPageProtection = true;
    this.pageSnapshot = document.body.innerHTML;
    
    // Capturar snapshots de todos los elementos importantes
    this.captureAllElements(document.body);
    
    console.info(`[DOMProtector] Protección completa de página activada - ${this.elementSnapshots.size} elementos protegidos`);
  }

  private captureAllElements(container: HTMLElement, depth: number = 0): void {
    // Sin límite de profundidad - capturar absolutamente todo
    if (depth > 50) return; // Solo límite de seguridad para evitar stack overflow

    Array.from(container.children).forEach((child, index) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      
      const element = child as HTMLElement;
      
      // Crear identificador único usando path completo
      const uniqueId = this.createUniquePath(element, index);
      
      // Capturar TODOS los elementos sin excepción
      this.elementSnapshots.set(uniqueId, {
        html: element.outerHTML,
        parentSelector: container === document.body ? 'body' : this.createUniquePath(container, this.getSiblingIndex(container)),
        siblingIndex: index,
      });
      
      // Recurrir a todos los hijos
      if (element.children.length > 0) {
        this.captureAllElements(element, depth + 1);
      }
    });
  }

  private createUniquePath(element: HTMLElement, index: number): string {
    const parts: string[] = [];
    let current: HTMLElement | null = element;
    let currentIndex = index;
    
    while (current && current !== document.body && parts.length < 10) {
      let identifier = current.tagName.toLowerCase();
      
      if (current.id) {
        identifier = `#${current.id}`;
        parts.unshift(identifier);
        break;
      }
      
      if (current.getAttribute('data-protected')) {
        identifier = `[data-protected="${current.getAttribute('data-protected')}"]`;
        parts.unshift(identifier);
        break;
      }
      
      // Usar índice para unicidad
      identifier += `:nth-child(${currentIndex + 1})`;
      parts.unshift(identifier);
      
      currentIndex = current.parentElement ? this.getSiblingIndex(current) : 0;
      current = current.parentElement;
    }
    
    return parts.join(' > ');
  }

  /**
   * Desactiva la protección completa de página
   */
  public disableFullPageProtection(): void {
    this.fullPageProtection = false;
    this.pageSnapshot = null;
    this.elementSnapshots.clear();
    console.info(`[DOMProtector] Protección completa de página desactivada`);
  }

  /**
   * Verifica si la protección completa está activa
   */
  public isFullPageProtectionEnabled(): boolean {
    return this.fullPageProtection;
  }

  /**
   * Registra un elemento para protegerlo contra eliminación
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
    const existingElement = document.querySelector(options.selector) as HTMLElement;
    const originalHTML = existingElement?.outerHTML || null;

    let parentSelector = options.parentSelector || null;
    if (!parentSelector && existingElement?.parentElement) {
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
      siblingIndex: existingElement ? this.getSiblingIndex(existingElement) : 0,
    });

    console.info(`[DOMProtector] Elemento registrado: ${options.selector} (ID: ${id})`);
  }

  /**
   * Desregistra un elemento protegido
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
   * Lista todos los snapshots capturados
   */
  public listSnapshots(): string[] {
    return Array.from(this.elementSnapshots.keys());
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
    this.elementSnapshots.clear();
    this.fullPageProtection = false;
    this.pageSnapshot = null;
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
