import React, { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface HeroProps {
  onOpenTrialModal: () => void;
  onExploreExperts: () => void;
  onSelectSubject?: (subject: string) => void;
  onScrollToAssistant?: () => void;
}

const SUBJECT_BAR_ITEMS = [
  { label: 'Calculus', prompt: 'Explain step by step how to differentiate f(x) = x² sin(x) using the product rule.' },
  { label: 'Physics', prompt: 'How do I know when to use conservation of energy vs. conservation of momentum in collisions?' },
  { label: 'Programming', prompt: 'What is the practical difference between a list and a tuple in Python?' },
  { label: 'Chemistry', prompt: 'How do I balance a redox equation in acidic solution step by step without guessing?' },
  { label: 'Economics', prompt: 'What is the difference between a shift in demand and movement along the demand curve?' }
];

export const Hero: React.FC<HeroProps> = ({
  onOpenTrialModal,
  onExploreExperts,
  onSelectSubject,
  onScrollToAssistant
}) => {
  const heroAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = heroAreaRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId: number | null = null;

    interface RippleWave {
      x: number;
      y: number;
      startedAt: number;
      duration: number;
      maxRadius: number;
    }

    const pointer = {
      targetX: -9999,
      targetY: -9999,
      x: -9999,
      y: -9999,
      targetStrength: 0,
      strength: 0
    };

    const ripples: RippleWave[] = [];

    const draw = (nowMs: number = performance.now()) => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('theme-dark');
      const spacing = 30;
      const influenceRadius = 145;

      // Prune completed ripples and compute active wave states
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (nowMs - ripples[i].startedAt >= ripples[i].duration) {
          ripples.splice(i, 1);
        }
      }

      const activeWaves = ripples.map(r => {
        const progress = Math.min(1, Math.max(0, (nowMs - r.startedAt) / r.duration));
        const easedProgress = 1 - Math.pow(1 - progress, 2.2);
        const radius = easedProgress * r.maxRadius;
        const fade = (1 - progress) * (1 - progress);
        return {
          x: r.x,
          y: r.y,
          radius,
          fade
        };
      });

      // Very subtle trailing ambient wash around the cursor
      if (pointer.strength > 0.005) {
        const glowRadius = 260;
        const grad = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          glowRadius
        );
        const peakAlpha = (isDark ? 0.055 : 0.065) * pointer.strength;
        grad.addColorStop(0, `rgba(245, 197, 44, ${peakAlpha.toFixed(4)})`);
        grad.addColorStop(1, 'rgba(245, 197, 44, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Faint concentric wave rings
      for (const w of activeWaves) {
        if (w.radius < 2) continue;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        const ringAlpha = (isDark ? 0.14 : 0.11) * w.fade;
        ctx.strokeStyle = isDark
          ? `rgba(245, 197, 44, ${ringAlpha.toFixed(3)})`
          : `rgba(15, 34, 73, ${ringAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      // Faint architectural dot matrix with gentle cursor & click-wave response
      const startX = (width % spacing) / 2 + spacing / 2;
      const startY = (height % spacing) / 2 + spacing / 2;
      const waveBand = 54;

      for (let gy = startY; gy < height; gy += spacing) {
        for (let gx = startX; gx < width; gx += spacing) {
          let drawX = gx;
          let drawY = gy;
          let radius = 1;
          let alpha = isDark ? 0.085 : 0.075;
          let useWarmAccent = false;

          if (pointer.strength > 0.005) {
            const dx = gx - pointer.x;
            const dy = gy - pointer.y;
            const dist = Math.hypot(dx, dy);

            if (dist < influenceRadius) {
              const t = 1 - dist / influenceRadius;
              const eased = t * t * pointer.strength;
              if (dist > 0.5) {
                const push = eased * 3.2;
                drawX += (dx / dist) * push;
                drawY += (dy / dist) * push;
              }
              radius = 1 + eased * 0.85;
              alpha += eased * (isDark ? 0.24 : 0.18);
              useWarmAccent = eased > 0.25;
            }
          }

          // Click wave crest displacement & highlight
          for (const w of activeWaves) {
            const dx = gx - w.x;
            const dy = gy - w.y;
            const dist = Math.hypot(dx, dy);
            const delta = Math.abs(dist - w.radius);

            if (delta < waveBand) {
              const crest = Math.cos((delta / waveBand) * (Math.PI / 2));
              const intensity = crest * crest * w.fade;
              if (dist > 0.5) {
                const wavePush = intensity * 5.2;
                drawX += (dx / dist) * wavePush;
                drawY += (dy / dist) * wavePush;
              }
              radius += intensity * 1.15;
              alpha += intensity * (isDark ? 0.34 : 0.26);
              if (intensity > 0.22) {
                useWarmAccent = true;
              }
            }
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
          if (useWarmAccent && isDark) {
            ctx.fillStyle = `rgba(245, 197, 44, ${Math.min(alpha, 0.42).toFixed(3)})`;
          } else if (isDark) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha, 0.45).toFixed(3)})`;
          } else {
            ctx.fillStyle = `rgba(15, 34, 73, ${Math.min(alpha, 0.38).toFixed(3)})`;
          }
          ctx.fill();
        }
      }
    };

    const tick = (nowMs: number) => {
      rafId = null;
      pointer.x += (pointer.targetX - pointer.x) * 0.065;
      pointer.y += (pointer.targetY - pointer.y) * 0.065;
      pointer.strength += (pointer.targetStrength - pointer.strength) * 0.055;

      draw(nowMs);

      const stillMoving =
        ripples.length > 0 ||
        Math.abs(pointer.targetX - pointer.x) > 0.35 ||
        Math.abs(pointer.targetY - pointer.y) > 0.35 ||
        Math.abs(pointer.targetStrength - pointer.strength) > 0.005;

      if (stillMoving) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const scheduleTick = () => {
      if (prefersReducedMotion) {
        draw();
        return;
      }
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nextX = e.clientX - rect.left;
      const nextY = e.clientY - rect.top;
      if (pointer.strength < 0.01) {
        pointer.x = nextX;
        pointer.y = nextY;
      }
      pointer.targetX = nextX;
      pointer.targetY = nextY;
      pointer.targetStrength = 1;
      scheduleTick();
    };

    const handlePointerLeave = () => {
      pointer.targetStrength = 0;
      scheduleTick();
    };

    const handleBackgroundClick = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select, [role="button"]')) {
        return;
      }
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      if (ripples.length >= 6) {
        ripples.shift();
      }
      ripples.push({
        x: clickX,
        y: clickY,
        startedAt: performance.now(),
        duration: 2100,
        maxRadius: 340
      });
      scheduleTick();
    };

    updateSize();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    resizeObserver?.observe(container);

    const themeObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => {
            draw();
          })
        : null;
    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    container.addEventListener('mousemove', handlePointerMove, { passive: true });
    container.addEventListener('mouseleave', handlePointerLeave);
    container.addEventListener('click', handleBackgroundClick);
    window.addEventListener('resize', updateSize, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      themeObserver?.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      container.removeEventListener('click', handleBackgroundClick);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const handleSubjectClick = (_subject: string, prompt: string) => {
    if (onSelectSubject) {
      onSelectSubject(prompt);
    } else if (onScrollToAssistant) {
      onScrollToAssistant();
    }
  };

  return (
    <section id="top" className="bg-[#FAFAF5]">
      <div ref={heroAreaRef} className="relative overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full z-0"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 md:pt-16 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Editorial Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-[11px] font-mono-nums font-medium uppercase tracking-[0.18em] text-slate-500">
                FEWER ROADBLOCKS, MORE «I GET IT NOW» MOMENTS.
              </div>

              <h1
                className="font-hero-headline text-[#0F2249]"
                style={{ fontSize: 'clamp(2.6rem, 4.9vw, 4.35rem)', textWrap: 'balance' }}
              >
                Your next great idea starts with{' '}
                <span className="relative inline-block">
                  <span className="font-serif-accent font-normal italic">one question.</span>
                  <span
                    aria-hidden="true"
                    className="block w-full h-[5px] bg-[#F5C52C] rounded-full mt-1"
                  />
                </span>
              </h1>

              <p className="text-base sm:text-[17px] text-slate-600 leading-relaxed max-w-md">
                Unstick that assignment with AI, learn with a tutor, and find your community. At your own pace, even late at night.
              </p>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <button
                  type="button"
                  onClick={onOpenTrialModal}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-[#0F2249] hover:bg-[#19346b] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
                >
                  <span>Start your 3-day free trial</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onExploreExperts}
                  className="text-sm font-semibold text-[#0F2249] hover:opacity-75 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Explore tutoring</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-4 text-[11px] font-mono-nums tracking-wider text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>24/7 AI</span>
                <span className="text-slate-300">/</span>
                <span>Verified experts</span>
                <span className="text-slate-300">/</span>
                <span>At your pace</span>
              </div>
            </div>

            {/* Right Editorial Study Assistant Preview Card */}
            <div className="lg:col-span-6">
              <div
                onClick={onScrollToAssistant}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onScrollToAssistant?.();
                  }
                }}
                className="relative bg-[#E6ECF5] rounded-2xl p-6 sm:p-9 pb-14 sm:pb-16 border border-slate-200/70 cursor-pointer group transition-transform duration-200 hover:-translate-y-0.5"
              >
                {/* Floating Gold Tag */}
                <div className="inline-block bg-[#F5C52C] text-[#0F2249] px-3.5 py-2 rounded-md text-[10px] font-mono-nums font-bold uppercase tracking-[0.14em] mb-4 shadow-xs">
                  FROM STUCK TO «GOT IT».
                </div>

                {/* Inner White Assistant Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-[#0F2249]">ProLnk AI</span>
                    <span className="text-[10px] font-mono-nums uppercase tracking-[0.14em] text-slate-400">
                      STUDY ASSISTANT
                    </span>
                  </div>

                  {/* User Prompt Box */}
                  <div className="bg-[#FAF9F2] rounded-lg px-4 py-3 text-xs sm:text-sm text-slate-800 font-medium border border-slate-200/50">
                    How do I differentiate f(x) = x² sin(x)?
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <p className="font-editorial text-lg sm:text-xl text-[#0F2249]">
                      Let’s take it step by step.
                    </p>
                    <p className="text-xs text-slate-600">
                      We use the product rule: <span className="font-mono-nums">(uv)′ = u′v + uv′</span>
                    </p>

                    <div className="bg-[#EBF0F7] rounded-lg px-4 py-3.5 text-center sm:text-left">
                      <span className="font-editorial text-base sm:text-lg text-[#0F2249]">
                        f′(x) = 2x sin(x) + x² cos(x)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-1">
                      Now you try: what would change if we used cos(x)?
                    </p>
                  </div>
                </div>

                {/* Overlapping Bottom-Right Navy Corner Card */}
                <div className="mt-4 sm:mt-0 sm:absolute sm:right-6 sm:bottom-5 bg-[#0F2249] text-white rounded-xl px-5 py-4 shadow-xl max-w-[270px] border border-white/10">
                  <div className="text-[9px] font-mono-nums uppercase tracking-[0.16em] text-slate-300">
                    NOT JUST AN ANSWER.
                  </div>
                  <div className="font-editorial text-base sm:text-lg text-white mt-1 leading-snug">
                    A way to understand it.
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center text-[11px] text-slate-400">
                A glimpse of how you can learn with ProLnk
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Dark Navy Subject Bar */}
      <div className="bg-[#0F2249] text-white border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="text-[11px] font-mono-nums uppercase tracking-[0.15em] text-slate-300 leading-relaxed shrink-0">
            THAT TOUGH SUBJECT,<br className="hidden lg:block" /> YOUR NEXT WIN.
          </div>

          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-x-8 sm:gap-x-12 gap-y-3 flex-1">
            {SUBJECT_BAR_ITEMS.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSubjectClick(item.label, item.prompt)}
                className="font-editorial text-lg sm:text-xl text-white hover:text-[#F5C52C] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
