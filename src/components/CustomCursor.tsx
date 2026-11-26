import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const pointerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isNativeCursorTarget, setIsNativeCursorTarget] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('theme-dark')
  );

  useEffect(() => {
    const htmlEl = document.documentElement;
    const syncTheme = () => setIsDark(htmlEl.classList.contains('theme-dark'));
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateAvailability = () => {
      const allowed = finePointerQuery.matches && !reducedMotionQuery.matches;
      setIsEnabled(allowed);
      if (allowed) {
        document.documentElement.classList.add('custom-cursor-enabled');
      } else {
        document.documentElement.classList.remove('custom-cursor-enabled');
      }
    };

    updateAvailability();
    finePointerQuery.addEventListener('change', updateAvailability);
    reducedMotionQuery.addEventListener('change', updateAvailability);

    return () => {
      document.documentElement.classList.remove('custom-cursor-enabled');
      finePointerQuery.removeEventListener('change', updateAvailability);
      reducedMotionQuery.removeEventListener('change', updateAvailability);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId = 0;

    const isTextOrCanvasTarget = (el: Element | null): boolean => {
      if (!el) return false;
      return Boolean(
        el.closest(
          'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"], canvas, :disabled, [aria-disabled="true"]'
        )
      );
    };

    const isInteractiveTarget = (el: Element | null): boolean => {
      if (!el) return false;
      if (el.closest(':disabled, [aria-disabled="true"]')) return false;
      return Boolean(
        el.closest(
          'a, button, [role="button"], select, label, .cursor-pointer, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"]'
        )
      );
    };

    const syncFromPointerEvent = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (ringX < -50) {
        ringX = mouseX;
        ringY = mouseY;
      }

      if (pointerRef.current) {
        pointerRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target as Element | null;
      setIsVisible(true);
      setIsNativeCursorTarget(isTextOrCanvasTarget(target));
      setIsHoveringInteractive(isInteractiveTarget(target));
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') {
        setIsVisible(false);
        setIsPressed(false);
        return;
      }
      syncFromPointerEvent(e);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') {
        setIsVisible(false);
        setIsPressed(false);
        return;
      }
      syncFromPointerEvent(e);
      setIsPressed(true);
    };

    const onPointerUp = (e: PointerEvent) => {
      setIsPressed(false);
      if (!e.pointerType || e.pointerType === 'mouse') {
        const target = e.target as Element | null;
        setIsNativeCursorTarget(isTextOrCanvasTarget(target));
        setIsHoveringInteractive(isInteractiveTarget(target));
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      setIsPressed(false);
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0)`;
      }

      rafId = requestAnimationFrame(animateRing);
    };

    rafId = requestAnimationFrame(animateRing);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('blur', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('blur', onMouseLeave);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  const showOverlay = isVisible && !isNativeCursorTarget;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Trailing Soft Ring — outer box handles exact centered (ringX, ringY) translation; inner ring handles symmetric scale */}
      <div
        ref={ringRef}
        style={{ willChange: 'transform' }}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none"
      >
        <div
          className={`w-full h-full rounded-full transition-[transform,scale,opacity,background-color,border-color] duration-150 ease-out ${
            !showOverlay
              ? 'opacity-0 scale-75'
              : isPressed
              ? 'opacity-90 scale-75'
              : isHoveringInteractive
              ? 'opacity-100 scale-125'
              : 'opacity-85 scale-100'
          } ${
            isDark
              ? isHoveringInteractive
                ? 'border border-[#F5C52C] bg-[#F5C52C]/15'
                : 'border border-[#F5C52C]/55 bg-transparent'
              : isHoveringInteractive
              ? 'border border-[#0F2249] bg-[#F5C52C]/22'
              : 'border border-[#0F2249]/35 bg-transparent'
          }`}
        />
      </div>

      {/* Precision Geometric ProLnk Arrowhead (tip aligned at exact hotspot) */}
      <div
        ref={pointerRef}
        style={{ willChange: 'transform, opacity', marginLeft: '-1px', marginTop: '-1px' }}
        className={`fixed top-0 left-0 transition-opacity duration-100 ${
          showOverlay ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          style={{ transformOrigin: '1px 1px' }}
          className={`overflow-visible transition-[transform,scale] duration-150 drop-shadow-sm ${
            isPressed ? 'scale-90' : isHoveringInteractive ? 'scale-110' : 'scale-100'
          }`}
        >
          <path
            d="M1 1L17.5 9.6L10.3 12L7.9 19.2L1 1Z"
            fill={isDark ? '#F5C52C' : '#0F2249'}
            stroke={isDark ? '#0F2249' : '#FFFFFF'}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle
            cx="5.2"
            cy="5.4"
            r="1.35"
            fill={isDark ? '#0F2249' : '#F5C52C'}
          />
        </svg>
      </div>
    </div>
  );
};
