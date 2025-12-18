import { useEffect, useRef } from 'react';

interface VisibilityProtectionOptions {
  onHidden?: () => void;
  onVisible?: () => void;
  blurOnHidden?: boolean;
}

/**
 * Hook to detect tab visibility changes and potential screen capture
 * Provides soft protection against content stealing
 */
export const useVisibilityProtection = (options: VisibilityProtectionOptions = {}) => {
  const { onHidden, onVisible, blurOnHidden = false } = options;
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[Security] Tab hidden');
        onHidden?.();
        
        if (blurOnHidden && !overlayRef.current) {
          // Create blur overlay
          overlayRef.current = document.createElement('div');
          overlayRef.current.style.cssText = `
            position: fixed;
            inset: 0;
            background: hsl(0 0% 4%);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: system-ui;
            font-size: 1.25rem;
          `;
          overlayRef.current.textContent = 'Click to continue watching';
          overlayRef.current.onclick = () => {
            overlayRef.current?.remove();
            overlayRef.current = null;
          };
          document.body.appendChild(overlayRef.current);
        }
      } else {
        console.log('[Security] Tab visible');
        onVisible?.();
        
        // Keep overlay until user clicks
      }
    };

    // Detect potential screen capture
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        console.log('[Security] Screenshot attempt detected');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      overlayRef.current?.remove();
    };
  }, [onHidden, onVisible, blurOnHidden]);
};

/**
 * Soft protection to disable right-click on sensitive elements
 */
export const useContextMenuProtection = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    element.addEventListener('contextmenu', handleContextMenu);
    return () => element.removeEventListener('contextmenu', handleContextMenu);
  }, [ref]);
};

/**
 * Detect DevTools opening (soft detection)
 */
export const useDevToolsDetection = (onDetected?: () => void) => {
  useEffect(() => {
    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      if ((widthDiff || heightDiff) && !devtoolsOpen) {
        devtoolsOpen = true;
        console.log('[Security] DevTools may be open');
        onDetected?.();
      } else if (!widthDiff && !heightDiff) {
        devtoolsOpen = false;
      }
    };

    window.addEventListener('resize', checkDevTools);
    checkDevTools();

    return () => window.removeEventListener('resize', checkDevTools);
  }, [onDetected]);
};
