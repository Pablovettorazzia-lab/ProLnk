import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const pointerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pulseTimerRef = useRef<number | null>(null);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isClickPulsing, setIsClickPulsing] = useState(false);
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
    let hasPosition = false;
    let lastNonMouseTime = 0;
    let prevVisible = false;
    let prevNativeTarget = false;
    let prevInteractive = false;
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

    const updateTargetsFromPoint = (clientX: number, clientY: number, rawTarget: EventTarget | null) => {
      const el =
        rawTarget instanceof Element
          ? rawTarget
          : document.elementFromPoint(clientX, clientY);

      if (!prevVisible) {
        prevVisible = true;
        setIsVisible(true);
      }

      const nextNative = isTextOrCanvasTarget(el);
      if (nextNative !== prevNativeTarget) {
        prevNativeTarget = nextNative;
        setIsNativeCursorTarget(nextNative);
      }

      const nextInteractive = isInteractiveTarget(el);
      if (nextInteractive !== prevInteractive) {
        prevInteractive = nextInteractive;
        setIsHoveringInteractive(nextInteractive);
      }
    };

    const syncCoords = (clientX: number, clientY: number, target: EventTarget | null) => {
      mouseX = clientX;
      mouseY = clientY;

      if (!hasPosition) {
        ringX = mouseX;
        ringY = mouseY;
        hasPosition = true;
      }

      if (pointerRef.current) {
        pointerRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      updateTargetsFromPoint(clientX, clientY, target);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') {
        lastNonMouseTime = Date.now();
        if (prevVisible) {
          prevVisible = false;
          setIsVisible(false);
        }
        setIsPressed(false);
        return;
      }
      syncCoords(e.clientX, e.clientY, e.target);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (Date.now() - lastNonMouseTime < 500) return;
      syncCoords(e.clientX, e.clientY, e.target);
    };

    const onDragOver = (e: DragEvent) => {
      if (e.clientX === 0 && e.clientY === 0) return;
      syncCoords(e.clientX, e.clientY, e.target);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') {
        lastNonMouseTime = Date.now();
        if (prevVisible) {
          prevVisible = false;
          setIsVisible(false);
        }
        setIsPressed(false);
        return;
      }

      syncCoords(e.clientX, e.clientY, e.target);
      setIsPressed(true);

      const el =
        e.target instanceof Element
          ? e.target
          : document.elementFromPoint(e.clientX, e.clientY);

      if (!isTextOrCanvasTarget(el)) {
        setIsClickPulsing(true);
        if (pulseTimerRef.current !== null) {
          window.clearTimeout(pulseTimerRef.current);
        }
        pulseTimerRef.current = window.setTimeout(() => {
          setIsClickPulsing(false);
          pulseTimerRef.current = null;
        }, 180);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      setIsPressed(false);
      if (!e.pointerType || e.pointerType === 'mouse') {
        syncCoords(e.clientX, e.clientY, e.target);
      }
    };

    const onMouseLeave = () => {
      prevVisible = false;
      setIsVisible(false);
      setIsPressed(false);
      setIsClickPulsing(false);
    };

    const animateRing = () => {
      if (hasPosition) {
        const dx = mouseX - ringX;
        const dy = mouseY - ringY;
        ringX = Math.abs(dx) < 0.05 ? mouseX : ringX + dx * 0.24;
        ringY = Math.abs(dy) < 0.05 ? mouseY : ringY + dy * 0.24;

        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0)`;
        }
      }

      rafId = requestAnimationFrame(animateRing);
    };

    rafId = requestAnimationFrame(animateRing);
    window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
    window.addEventListener('mousemove', onMouseMove, { capture: true, passive: true });
    window.addEventListener('dragover', onDragOver, { capture: true, passive: true });
    window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
    window.addEventListener('pointerup', onPointerUp, { capture: true, passive: true });
    window.addEventListener('pointercancel', onPointerUp, { capture: true, passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('blur', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current);
      }
      window.removeEventListener('pointermove', onPointerMove, { capture: true });
      window.removeEventListener('mousemove', onMouseMove, { capture: true });
      window.removeEventListener('dragover', onDragOver, { capture: true });
      window.removeEventListener('pointerdown', onPointerDown, { capture: true });
      window.removeEventListener('pointerup', onPointerUp, { capture: true });
      window.removeEventListener('pointercancel', onPointerUp, { capture: true });
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('blur', onMouseLeave);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  const showOverlay = isVisible && !isNativeCursorTarget;
  const activeClick = isPressed || isClickPulsing;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Trailing Soft Ring — outer box handles exact centered (ringX, ringY) tracking; inner ring handles click pulse & hover scale */}
      <div
        ref={ringRef}
        style={{ willChange: 'transform' }}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none"
      >
        <div
          className={`w-full h-full rounded-full transition-[transform,scale,opacity,background-color,border-color,box-shadow] duration-150 ease-out ${
            !showOverlay
              ? 'opacity-0 scale-75'
              : activeClick
              ? 'opacity-100 scale-75'
              : isHoveringInteractive
              ? 'opacity-100 scale-125'
              : 'opacity-85 scale-100'
          } ${
            activeClick
              ? isDark
                ? 'border-2 border-[#FDE047] bg-[#F5C52C]/35 shadow-[0_0_14px_rgba(245,197,44,0.5)]'
                : 'border-2 border-[#F5C52C] bg-[#F5C52C]/35 shadow-[0_0_12px_rgba(15,34,73,0.2)]'
              : isDark
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
          className={`overflow-visible transition-[transform,scale] duration-150 ease-out drop-shadow-sm ${
            activeClick ? 'scale-[0.86]' : isHoveringInteractive ? 'scale-110' : 'scale-100'
          }`}
        >
          <path
            d="M1 1L17.5 9.6L10.3 12L7.9 19.2L1 1Z"
            fill={isDark ? '#F5C52C' : activeClick ? '#1E3A8A' : '#0F2249'}
            stroke={isDark ? '#0F2249' : activeClick ? '#F5C52C' : '#FFFFFF'}
            strokeWidth="1.6"
            strokeLinejoin="round"
            className="transition-colors duration-150"
          />
          <circle
            cx="5.2"
            cy="5.4"
            r={activeClick ? '1.65' : '1.35'}
            fill={isDark ? (activeClick ? '#FFFFFF' : '#0F2249') : '#F5C52C'}
            className="transition-all duration-150"
          />
        </svg>
      </div>
    </div>
  );
};
