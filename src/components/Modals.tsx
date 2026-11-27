import React, { useState, useEffect } from 'react';
import { Expert } from '../types';
import { ProLnkLogo } from './Logo';
import {
  X,
  CheckCircle2,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Star,
  ShieldCheck
} from 'lucide-react';
import {
  SessionSchedulePicker,
  getDefaultFutureSchedule,
  isScheduleInPast,
  formatScheduleSummary
} from './SessionSchedulePicker';

type AuthMode = 'login' | 'signup';

interface EditorialVariant {
  badge: string;
  line1: string;
  line2: string;
  accent: string;
  description: string;
  cardKicker: string;
  cardTitle: string;
  cardBody: string;
  subtitle?: string;
}

const lastVariantByKey = new Map<string, number>();

export function pickNextVariantIndex(key: string, length: number): number {
  if (length <= 1) return 0;
  let prev = lastVariantByKey.get(key);
  if (prev === undefined) {
    try {
      const stored =
        localStorage.getItem(`prolnk_phrase_${key}`) ??
        sessionStorage.getItem(`prolnk_phrase_${key}`);
      if (stored !== null) {
        const parsed = Number(stored);
        if (!Number.isNaN(parsed)) prev = parsed;
      }
    } catch {
      // ignore storage issues
    }
  }
  const offset = 1 + Math.floor(Math.random() * (length - 1));
  const next = prev === undefined ? Math.floor(Math.random() * length) : (prev + offset) % length;
  lastVariantByKey.set(key, next);
  try {
    localStorage.setItem(`prolnk_phrase_${key}`, String(next));
    sessionStorage.setItem(`prolnk_phrase_${key}`, String(next));
  } catch {
    // ignore storage issues
  }
  return next;
}

const LOGIN_VARIANTS: EditorialVariant[] = [
  {
    badge: 'Tu próximo «ya entendí».',
    line1: 'Qué bueno',
    line2: 'que volviste.',
    accent: 'Sigamos aprendiendo.',
    description: 'Tus preguntas, tus avances y ese tema que ya casi dominas. Todo te espera aquí.',
    cardKicker: 'No solo una respuesta.',
    cardTitle: 'Una forma de entenderlo.',
    cardBody: 'IA, tutorías y comunidad. A tu ritmo.',
    subtitle: 'Una pregunta más cerca de entenderlo.'
  },
  {
    badge: 'De vuelta al estudio.',
    line1: 'Tu espacio',
    line2: 'ya te espera.',
    accent: 'Retoma tu ritmo.',
    description: 'Tus apuntes guardados, tu pizarra y tus sesiones siguen exactamente donde los dejaste.',
    cardKicker: 'Continuidad real.',
    cardTitle: 'Cada sesión suma claridad.',
    cardBody: 'Repasa con IA 24/7 o conecta con tu tutor en minutos.',
    subtitle: 'Sigue construyendo tu racha de aprendizaje.'
  },
  {
    badge: 'Paso a paso.',
    line1: 'Hoy también',
    line2: 'se entiende.',
    accent: 'Vamos por ese tema.',
    description: 'Un ejercicio difícil se vuelve sencillo cuando lo ves desglosado con lógica y calma.',
    cardKicker: 'Sin memorizar a ciegas.',
    cardTitle: 'Comprende el porqué.',
    cardBody: 'Explicaciones claras, ejemplos y práctica guiada.',
    subtitle: 'Entra a tu portal y despeja esa duda hoy.'
  },
  {
    badge: 'Tu avance importa.',
    line1: 'Listo para',
    line2: 'seguir adelante.',
    accent: 'Un logro más hoy.',
    description: 'Vuelve a tus clases, tareas de Classroom y resúmenes listos para tu próximo examen.',
    cardKicker: 'Todo conectado.',
    cardTitle: 'Estudia sin distracciones.',
    cardBody: 'Tus cursos, apuntes y tutores en un mismo lugar.',
    subtitle: 'Qué gusto verte de nuevo por aquí.'
  },
  {
    badge: 'Estudio inteligente.',
    line1: 'Menos estrés,',
    line2: 'más claridad.',
    accent: 'Domina la materia.',
    description: 'Incluso si estudias tarde en la noche, siempre tienes respaldo para avanzar con seguridad.',
    cardKicker: 'Disponible 24/7.',
    cardTitle: 'Nunca te quedes trabado.',
    cardBody: 'IA académica y especialistas verificados cuando los necesites.',
    subtitle: 'Retoma tus metas académicas en segundos.'
  },
  {
    badge: 'Tu portal ProLnk.',
    line1: 'Otra duda',
    line2: 'que se resuelve.',
    accent: 'Así se avanza.',
    description: 'Cada problema resuelto fortalece tu base para el siguiente parcial o proyecto.',
    cardKicker: 'A tu manera.',
    cardTitle: 'Tu ritmo marca la pauta.',
    cardBody: 'Aprende paso a paso con herramientas pensadas para ti.',
    subtitle: 'Inicia sesión y continúa tu camino.'
  }
];

const SIGNUP_VARIANTS: EditorialVariant[] = [
  {
    badge: 'Tu primera vez en ProLnk.',
    line1: 'Tu primer',
    line2: 'gran paso.',
    accent: 'Empieza a entenderlo.',
    description: 'Es tu primera vez aquí: crea tu espacio en segundos y desbloquea IA 24/7, apuntes y tutores verificados.',
    cardKicker: '3 días gratis · Sin tarjeta.',
    cardTitle: 'Bienvenido desde el día uno.',
    cardBody: 'Prueba todo el portal sin compromiso y avanza a tu ritmo.',
    subtitle: 'Crea tu perfil por primera vez y abre tu portal de estudio.'
  },
  {
    badge: 'Bienvenido · 3 días gratis.',
    line1: 'De «no entiendo»',
    line2: 'a tenerlo claro.',
    accent: 'Descúbrelo hoy.',
    description: 'Sube tus apuntes, pregunta sin miedo y prueba una tutoría 1-a-1 desde tu primer minuto.',
    cardKicker: 'Tu espacio nuevo.',
    cardTitle: 'Todo listo para comenzar.',
    cardBody: 'Sin cobros automáticos ni tarjetas requeridas.',
    subtitle: 'Activa tu cuenta gratuita en menos de un minuto.'
  },
  {
    badge: 'Empieza hoy sin costo.',
    line1: 'Aprender bien',
    line2: 'cambia todo.',
    accent: 'Únete a ProLnk.',
    description: 'Diseñado para estudiantes que quieren entender de verdad, no solo copiar una respuesta.',
    cardKicker: 'Primer acceso.',
    cardTitle: 'Estudia con respaldo real.',
    cardBody: 'IA paso a paso, pizarra interactiva y comunidad activa.',
    subtitle: 'Estrena tu espacio de aprendizaje personalizado.'
  },
  {
    badge: 'Tu espacio desde cero.',
    line1: 'Todo empieza',
    line2: 'con una duda.',
    accent: 'Resuélvela aquí.',
    description: 'Crea tu cuenta por primera vez y lleva tus materias, sesiones y apuntes en orden.',
    cardKicker: 'Prueba completa.',
    cardTitle: 'Explora sin presión.',
    cardBody: 'Tres días de acceso total para conocer cada herramienta.',
    subtitle: 'Da tu primer paso con tu cuenta nueva.'
  },
  {
    badge: 'Primer ingreso.',
    line1: 'Bienvenido',
    line2: 'a tu portal.',
    accent: 'A tu propio ritmo.',
    description: 'Ya sea cálculo, física, química o código, aquí encuentras guía clara desde el inicio.',
    cardKicker: 'Comienza gratis.',
    cardTitle: 'Tu aliado de estudio 24/7.',
    cardBody: 'Conecta con tutores reales cuando quieras profundizar.',
    subtitle: 'Configura tu cuenta nueva en segundos.'
  },
  {
    badge: 'Nuevo comienzo.',
    line1: 'Haz que estudiar',
    line2: 'tenga sentido.',
    accent: 'Empieza gratis hoy.',
    description: 'Regístrate por primera vez y convierte horas de bloqueo en momentos de claridad.',
    cardKicker: 'Sin compromisos.',
    cardTitle: 'Tu ritmo, tus metas.',
    cardBody: 'Acceso inmediato a tutorías, pizarra y comunidad.',
    subtitle: 'Crea tu cuenta y entra directo a tu portal.'
  }
];

const BOOKING_VARIANTS: EditorialVariant[] = [
  {
    badge: 'Tutoría 1-a-1 verificada.',
    line1: 'Aprende con',
    line2: 'quien sí explica.',
    accent: 'Aparta tu cita.',
    description: 'Sesión privada en vivo con pizarra compartida, resolución paso a paso y resumen guardado en tu portal.',
    cardKicker: 'Total estimado',
    cardTitle: '',
    cardBody: ''
  },
  {
    badge: 'Conexión en vivo.',
    line1: 'Una hora clave',
    line2: 'antes del examen.',
    accent: 'Reserva tu espacio.',
    description: 'Resuelve tus ejercicios puntuales directamente con un especialista verificado de tu materia.',
    cardKicker: 'Total estimado',
    cardTitle: '',
    cardBody: ''
  },
  {
    badge: 'Acompañamiento real.',
    line1: 'Despeja cada duda',
    line2: 'frente a frente.',
    accent: 'Elige tu horario.',
    description: 'Practica ejercicios reales en la pizarra en vivo y quédate con las notas listas para repasar.',
    cardKicker: 'Total estimado',
    cardTitle: '',
    cardBody: ''
  },
  {
    badge: 'Sesión personalizada.',
    line1: 'Tu ritmo merece',
    line2: 'atención dedicada.',
    accent: 'Agenda en segundos.',
    description: 'Elige el tema exacto donde necesitas apoyo y aprovecha cada minuto de tu sesión 1-a-1.',
    cardKicker: 'Total estimado',
    cardTitle: '',
    cardBody: ''
  },
  {
    badge: 'Tutores verificados.',
    line1: 'Convierte la duda',
    line2: 'en dominio.',
    accent: 'Programa tu clase.',
    description: 'Con opción de prioridad urgente en ~15 minutos si necesitas resolver algo hoy mismo.',
    cardKicker: 'Total estimado',
    cardTitle: '',
    cardBody: ''
  }
];

const QUESTION_VARIANTS: EditorialVariant[] = [
  {
    badge: 'Comunidad ProLnk.',
    line1: 'Una buena duda',
    line2: 'también conecta.',
    accent: 'Pregunta sin pena.',
    description: 'Comparte exactamente dónde te trabaste y recibe explicaciones claras de estudiantes y tutores verificados.',
    cardKicker: 'Respuestas verificadas',
    cardTitle: 'Paso a paso, sin rodeos.',
    cardBody: 'Tutores activos revisan las preguntas destacadas cada día.'
  },
  {
    badge: 'Aprender en compañía.',
    line1: 'Tu pregunta ayuda',
    line2: 'a muchos más.',
    accent: 'Compártela hoy.',
    description: 'Escribe tu ejercicio o concepto y obtén distintos enfoques hasta que haga clic.',
    cardKicker: 'Apoyo colaborativo',
    cardTitle: 'Respuestas con criterio.',
    cardBody: 'Las mejores soluciones quedan guardadas para toda la comunidad.'
  },
  {
    badge: 'Foro académico.',
    line1: 'Nadie nace',
    line2: 'sabiéndolo todo.',
    accent: 'Aclara ese punto.',
    description: 'Publica tu duda por materia y recibe orientación práctica sin juicios ni respuestas vacías.',
    cardKicker: 'Comunidad activa',
    cardTitle: 'De bloqueo a claridad.',
    cardBody: 'Vota las mejores explicaciones y aprende con ejemplos reales.'
  },
  {
    badge: 'Dudas reales.',
    line1: 'Pregunta justo',
    line2: 'donde te quedaste.',
    accent: 'Te ayudamos ya.',
    description: 'Entre pares y especialistas verificados siempre hay una explicación más clara.',
    cardKicker: 'Guía confiable',
    cardTitle: 'Ejemplos que sí sirven.',
    cardBody: 'Ideal para tareas, laboratorios y preparación de parciales.'
  }
];

const CONTACT_VARIANTS: EditorialVariant[] = [
  {
    badge: 'Soporte directo.',
    line1: 'Siempre hay',
    line2: 'alguien contigo.',
    accent: 'Escríbenos hoy.',
    description: '¿Tienes dudas sobre tutorías, planes o tu cuenta estudiantil? Nuestro equipo responde rápido.',
    cardKicker: 'Tiempo promedio',
    cardTitle: 'Menos de 2 horas.',
    cardBody: 'Atención directa para estudiantes y tutores ProLnk.'
  },
  {
    badge: 'Equipo ProLnk.',
    line1: 'Cuéntanos cómo',
    line2: 'podemos ayudarte.',
    accent: 'Estamos atentos.',
    description: 'Escríbenos cualquier consulta técnica, académica o sobre tus sesiones programadas.',
    cardKicker: 'Acompañamiento real',
    cardTitle: 'Respuestas humanas.',
    cardBody: 'Sin bots interminables: revisamos tu mensaje personalmente.'
  },
  {
    badge: 'Atención cercana.',
    line1: 'Queremos que tu',
    line2: 'experiencia fluya.',
    accent: 'Hablemos pronto.',
    description: 'Si algo no salió como esperabas o quieres sugerir una mejora, te leemos.',
    cardKicker: 'Soporte ágil',
    cardTitle: 'Seguimiento completo.',
    cardBody: 'Te respondemos directo a tu correo en el menor tiempo posible.'
  }
];

interface AuthModalProps {
  isOpen: boolean;
  initialMode: AuthMode;
  initialEmail?: string;
  onClose: () => void;
  onLogin?: (name: string, email: string, uid?: string, photoURL?: string) => void;
  onRegister?: (
    name: string,
    email: string,
    uid?: string,
    photoURL?: string,
    extra?: { semester?: string }
  ) => void;
}

const AuthSplitModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  initialEmail = '',
  onClose,
  onLogin,
  onRegister
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginPhraseIdx, setLoginPhraseIdx] = useState(0);
  const [signupPhraseIdx, setSignupPhraseIdx] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [grade, setGrade] = useState('Colegio / Bachillerato');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [footerNote, setFooterNote] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLoginPhraseIdx(pickNextVariantIndex('auth_login', LOGIN_VARIANTS.length));
      setSignupPhraseIdx(pickNextVariantIndex('auth_signup', SIGNUP_VARIANTS.length));
      setErrorMsg(null);
      setInfoMsg(null);
      setFooterNote(null);
      setShowPassword(false);
      setIsDarkTheme(document.documentElement.classList.contains('theme-dark'));
      if (initialEmail) {
        setEmail(initialEmail);
      }
    }
  }, [isOpen, initialMode, initialEmail]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    if (nextMode === 'login') {
      setLoginPhraseIdx(pickNextVariantIndex('auth_login', LOGIN_VARIANTS.length));
    } else {
      setSignupPhraseIdx(pickNextVariantIndex('auth_signup', SIGNUP_VARIANTS.length));
    }
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleGoogleContinue = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      const { signInWithGoogle, formatFirebaseAuthError } = await import('../firebase/authService');
      try {
        const user = await signInWithGoogle();
        const resolvedName = user.displayName || user.email?.split('@')[0] || 'Student';
        const resolvedEmail = user.email || '';
        if (mode === 'signup' && onRegister) {
          onRegister(resolvedName, resolvedEmail, user.uid, user.photoURL || undefined, { semester: grade });
        } else if (onLogin) {
          onLogin(resolvedName, resolvedEmail, user.uid, user.photoURL || undefined);
        } else if (onRegister) {
          onRegister(resolvedName, resolvedEmail, user.uid, user.photoURL || undefined, { semester: grade });
        }
        onClose();
      } catch (err) {
        setErrorMsg(formatFirebaseAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim()) {
      setErrorMsg('Escribe primero tu correo electrónico para enviarte el enlace de recuperación.');
      return;
    }
    setIsLoading(true);
    try {
      const { resetUserPassword, formatFirebaseAuthError } = await import('../firebase/authService');
      try {
        await resetUserPassword(email.trim());
        setInfoMsg(`Enviamos un enlace de recuperación a ${email.trim()}. Revisa tu bandeja.`);
      } catch (err) {
        setErrorMsg(formatFirebaseAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMsg(null);
    setInfoMsg(null);

    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const finalName = name.trim() || email.split('@')[0];
        const { registerUserWithEmail, formatFirebaseAuthError } = await import('../firebase/authService');
        try {
          const user = await registerUserWithEmail(finalName, email.trim(), password);
          if (onRegister) {
            onRegister(user.displayName || finalName, user.email || email.trim(), user.uid, undefined, {
              semester: grade
            });
          } else if (onLogin) {
            onLogin(user.displayName || finalName, user.email || email.trim(), user.uid);
          }
          onClose();
        } catch (err) {
          setErrorMsg(formatFirebaseAuthError(err));
        }
      } else {
        const { loginUserWithEmail, formatFirebaseAuthError } = await import('../firebase/authService');
        try {
          const user = await loginUserWithEmail(email.trim(), password, keepSignedIn);
          if (onLogin) {
            onLogin(user.displayName || email.split('@')[0], user.email || email.trim(), user.uid);
          } else if (onRegister) {
            onRegister(user.displayName || email.split('@')[0], user.email || email.trim(), user.uid);
          }
          onClose();
        } catch (err) {
          setErrorMsg(formatFirebaseAuthError(err));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === 'login';
  const activeCopy = isLogin ? LOGIN_VARIANTS[loginPhraseIdx] : SIGNUP_VARIANTS[signupPhraseIdx];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? 'Inicia sesión en ProLnk' : 'Crea tu cuenta en ProLnk'}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#FAFAF5] text-[#0F2249] flex flex-col animate-in fade-in duration-150"
    >
      {/* Top Editorial Bar */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-5 pb-4 border-b border-slate-200/80 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer text-left"
          aria-label="Volver al inicio"
        >
          <ProLnkLogo size="md" light={isDarkTheme} />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#0F2249] hover:opacity-75 transition-opacity cursor-pointer"
        >
          <span>Volver al inicio</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Centered Split Card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10">
        <div className="w-full max-w-[960px] bg-white border border-slate-200/90 rounded-[24px] shadow-[0_24px_60px_-22px_rgba(15,34,73,0.14)] overflow-hidden grid grid-cols-1 md:grid-cols-[44%_56%]">
          {/* Left Editorial Graph-Paper Brand Panel */}
          <div className="editorial-grid-panel p-7 sm:p-9 md:p-10 flex flex-col justify-between gap-8 border-b md:border-b-0 md:border-r border-slate-200/80">
            <div className="space-y-6">
              {/* Top Gold Micro Pill */}
              <div className="inline-block bg-[#F5C52C] text-[#0F2249] font-mono-nums text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md shadow-2xs">
                {activeCopy.badge}
              </div>

              {/* Dynamic Editorial Headline: Returning vs First-Time (rotates every open) */}
              <div>
                <h2 className="font-editorial text-[2.25rem] sm:text-[2.6rem] leading-[1.04] text-[#0F2249] tracking-tight">
                  {activeCopy.line1}
                  <br />
                  {activeCopy.line2}
                </h2>

                <div className="mt-1.5 inline-block">
                  <span className="font-serif-accent text-[2.15rem] sm:text-[2.5rem] leading-[1.06] text-[#0F2249] block">
                    {activeCopy.accent}
                  </span>
                  <div className="h-[5px] w-full bg-[#F5C52C] rounded-full mt-1" />
                </div>
              </div>

              <p className="font-subtitle text-xs sm:text-[13.5px] leading-relaxed text-slate-600 max-w-xs">
                {activeCopy.description}
              </p>
            </div>

            {/* Bottom Floating Card + Strip */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
                <div className="font-mono-nums text-[10px] tracking-[0.14em] uppercase font-medium text-slate-500">
                  {activeCopy.cardKicker}
                </div>
                <div className="font-editorial text-[1.4rem] leading-snug text-[#0F2249]">
                  {activeCopy.cardTitle}
                </div>
                <p className="text-xs text-slate-600">{activeCopy.cardBody}</p>
              </div>

              <div className="font-mono-nums text-[10px] tracking-[0.18em] uppercase font-medium text-slate-500">
                {isLogin ? 'IA 24/7  /  TUTORÍAS  /  COMUNIDAD' : '3 DÍAS GRATIS  /  SIN TARJETA  /  ACCESO TOTAL'}
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="bg-white p-7 sm:p-10 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-5">
              {/* Heading */}
              <div>
                <div className="font-mono-nums text-[10px] tracking-[0.16em] uppercase font-medium text-slate-500">
                  {isLogin ? 'Tu espacio de aprendizaje' : 'Bienvenido a ProLnk'}
                </div>
                <h1 className="font-editorial text-3xl sm:text-[2.35rem] text-[#0F2249] mt-1 leading-tight">
                  {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
                </h1>
                <p className="font-subtitle text-xs sm:text-[13px] text-slate-600 mt-1">
                  {activeCopy.subtitle}
                </p>
              </div>

              {/* Segmented Pill Tabs */}
              <div className="editorial-segmented-track bg-[#EEF2F7] p-1 rounded-xl grid grid-cols-2 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    isLogin
                      ? 'editorial-segmented-active bg-white text-[#0F2249] shadow-2xs'
                      : 'text-slate-500 hover:text-[#0F2249]'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    !isLogin
                      ? 'editorial-segmented-active bg-white text-[#0F2249] shadow-2xs'
                      : 'text-slate-500 hover:text-[#0F2249]'
                  }`}
                >
                  Crear cuenta
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {infoMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-[13px]">
                {!isLogin && (
                  <div>
                    <label className="block text-[#0F2249] font-semibold mb-1.5 text-xs">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ej. Pablo Vettorazzi"
                      className="w-full bg-[#F4F6FA] border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249] transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[#0F2249] font-semibold mb-1.5 text-xs">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-[#F4F6FA] border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249] transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#0F2249] font-semibold text-xs">Contraseña</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isLoading}
                        className="text-[11px] font-semibold text-[#0F2249] hover:opacity-75 cursor-pointer"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center bg-[#F4F6FA] border border-slate-200 rounded-xl focus-within:border-[#0F2249] transition-colors">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={isLogin ? undefined : 6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={isLogin ? 'Introduce tu contraseña' : 'Mínimo 6 caracteres'}
                      className="w-full bg-transparent px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="pr-3.5 text-[11px] font-semibold text-[#0F2249] hover:opacity-75 cursor-pointer shrink-0"
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-[#0F2249] font-semibold mb-1.5 text-xs">
                      Nivel académico
                    </label>
                    <select
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      className="w-full bg-[#F4F6FA] border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#0F2249]"
                    >
                      <option value="Colegio / Bachillerato">Colegio / Bachillerato</option>
                      <option value="Secundaria">Secundaria / Básicos</option>
                      <option value="Universidad">Universidad</option>
                      <option value="Autodidacta">Autodidacta</option>
                    </select>
                  </div>
                )}

                {isLogin && (
                  <label className="inline-flex items-center gap-2 text-xs text-[#0F2249] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={keepSignedIn}
                      onChange={e => setKeepSignedIn(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 accent-[#0F2249] cursor-pointer"
                    />
                    <span>Mantener mi sesión iniciada</span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs sm:text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-55"
                >
                  <span>
                    {isLoading
                      ? isLogin
                        ? 'Iniciando sesión...'
                        : 'Creando tu cuenta...'
                      : isLogin
                      ? 'Iniciar sesión'
                      : 'Crear cuenta gratis'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Secondary Google sign-in option */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleContinue}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.18 3.645-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.11-6.68-4.96H1.21v3.15C3.25 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.32 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.61H1.21C.44 8.14 0 9.97 0 12s.44 3.86 1.21 5.39l4.11-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.21 6.61l4.11 3.15c.94-2.85 3.58-4.96 6.68-4.96z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </button>

                {/* Switch between first-time & returning */}
                <div className="text-center text-xs text-slate-600 pt-1">
                  {isLogin ? (
                    <>
                      ¿Aún no tienes cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="font-bold text-[#0F2249] hover:opacity-75 inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Empieza gratis</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      ¿Ya tienes una cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="font-bold text-[#0F2249] hover:opacity-75 inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Inicia sesión</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>

                <p className="text-center text-[10px] text-slate-400">
                  {isLogin
                    ? 'Al continuar, aceptas los Términos y la Política de privacidad.'
                    : 'Prueba gratuita de 3 días · Sin tarjeta de crédito requerida.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Footer */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pb-5 pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <div>© {new Date().getFullYear()} ProLnk · Aprende a tu ritmo.</div>
        <div className="flex flex-col items-center sm:items-end gap-1">
          {footerNote && (
            <div className="text-[11px] text-[#0F2249] bg-[#EEF2F7] px-3 py-1 rounded-lg border border-slate-200">
              {footerNote}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setFooterNote('Privacidad: tus datos académicos y apuntes permanecen privados en tu cuenta.')
              }
              className="hover:text-[#0F2249] cursor-pointer"
            >
              Privacidad
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() =>
                setFooterNote('Términos: la prueba gratuita dura 3 días y no realiza cobros automáticos.')
              }
              className="hover:text-[#0F2249] cursor-pointer"
            >
              Términos
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() =>
                setFooterNote('¿Necesitas ayuda? Crea tu cuenta gratis o escríbenos desde Contacto.')
              }
              className="hover:text-[#0F2249] cursor-pointer"
            >
              ¿Necesitas ayuda?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrialModal: React.FC<{
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
  onRegister?: (
    name: string,
    email: string,
    uid?: string,
    photoURL?: string,
    extra?: { semester?: string }
  ) => void;
  onLogin?: (name: string, email: string, uid?: string, photoURL?: string) => void;
}> = ({ isOpen, initialEmail = '', onClose, onRegister, onLogin }) => (
  <AuthSplitModal
    isOpen={isOpen}
    initialMode="signup"
    initialEmail={initialEmail}
    onClose={onClose}
    onRegister={onRegister}
    onLogin={onLogin}
  />
);

export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string, email: string, uid?: string, photoURL?: string) => void;
  onRegister?: (
    name: string,
    email: string,
    uid?: string,
    photoURL?: string,
    extra?: { semester?: string }
  ) => void;
}> = ({ isOpen, onClose, onLogin, onRegister }) => (
  <AuthSplitModal
    isOpen={isOpen}
    initialMode="login"
    onClose={onClose}
    onLogin={onLogin}
    onRegister={onRegister}
  />
);

interface BookingModalProps {
  expert: Expert | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (details: {
    expertName: string;
    topic: string;
    total: number;
    date: string;
    day?: string;
    month?: string;
    time?: string;
  }) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  expert,
  isOpen,
  onClose,
  onBookingConfirmed
}) => {
  const initialSchedule = getDefaultFutureSchedule();
  const [dateKey, setDateKey] = useState(initialSchedule.dateKey);
  const [time24, setTime24] = useState(initialSchedule.time24);
  const [topic, setTopic] = useState('');
  const [urgentUpgrade, setUrgentUpgrade] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const nextDefault = getDefaultFutureSchedule();
      setDateKey(nextDefault.dateKey);
      setTime24(nextDefault.time24);
      setTopic('');
      setUrgentUpgrade(false);
      setIsSuccess(false);
      setPhraseIdx(pickNextVariantIndex('booking_modal', BOOKING_VARIANTS.length));
    }
  }, [isOpen, expert?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !expert) return null;

  const basePrice = expert.hourlyRate;
  const totalPrice = basePrice + (urgentUpgrade ? 25 : 0);
  const copy = BOOKING_VARIANTS[phraseIdx];
  const scheduleInvalid = isScheduleInPast(dateKey, time24);
  const scheduleSummary = formatScheduleSummary(dateKey, time24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isScheduleInPast(dateKey, time24)) return;
    setIsSuccess(true);
    setTimeout(() => {
      onBookingConfirmed({
        expertName: expert.name,
        topic: topic || `Sesión de ${expert.subjects[0]}`,
        total: totalPrice,
        date: scheduleSummary.fullDate,
        day: scheduleSummary.day,
        month: scheduleSummary.month,
        time: scheduleSummary.timeLabel
      });
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-[24px] w-full max-w-[880px] overflow-hidden shadow-[0_24px_60px_-20px_rgba(15,34,73,0.28)] grid grid-cols-1 md:grid-cols-[42%_58%]">
        {/* Left Editorial Graph-Paper Panel */}
        <div className="editorial-grid-panel p-6 sm:p-8 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="space-y-4">
            <div className="inline-block bg-[#F5C52C] text-[#0F2249] text-[10px] font-extrabold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md">
              {copy.badge}
            </div>

            <div>
              <h3 className="font-editorial text-2xl sm:text-[1.9rem] leading-[1.08] text-[#0F2249]">
                {copy.line1}
                <br />
                {copy.line2}
              </h3>
              <div className="mt-1 inline-block">
                <span className="font-serif-accent text-2xl sm:text-[1.8rem] text-[#0F2249] block">
                  {copy.accent}
                </span>
                <div className="h-[4px] w-full bg-[#F5C52C] rounded-full mt-1" />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600">
              {copy.description}
            </p>
          </div>

          <div className="space-y-4">
            {/* Tutor + Live Summary Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F2249] text-[#F5C52C] flex items-center justify-center font-bold text-xs shrink-0">
                  {expert.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-editorial text-base text-[#0F2249] truncate">{expert.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {expert.subjects.slice(0, 2).join(' · ')}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0F2249]">
                  <Star className="w-3.5 h-3.5 fill-[#F5C52C] text-[#F5C52C]" />
                  <span>{expert.rating}</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between font-mono-nums">
                <div>
                  <div className="text-[10px] tracking-[0.12em] uppercase text-slate-500 font-semibold">
                    {copy.cardKicker}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Q{basePrice}/hr {urgentUpgrade ? '+ Q25 prioridad' : ''}
                  </div>
                </div>
                <div className="font-editorial text-2xl text-[#0F2249]">Q{totalPrice}</div>
              </div>
            </div>

            <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-slate-500">
              EN VIVO  /  PIZARRA  /  RESUMEN
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="bg-white p-6 sm:p-8 relative flex flex-col justify-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-[13px]">
              <div>
                <div className="text-[10px] tracking-[0.15em] uppercase font-semibold text-slate-500">
                  Reservar sesión
                </div>
                <h3 className="font-editorial text-2xl text-[#0F2249] mt-0.5">
                  Agenda con {expert.name.split(' ')[0]}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Elige el tema, día y horario que mejor te funcione.
                </p>
              </div>

              <div>
                <label className="block text-[#0F2249] font-semibold mb-1.5 text-xs">
                  Tema o tarea a repasar
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Ej. Regla de la cadena, leyes de Newton, laboratorio..."
                  className="w-full bg-[#F4F6FA] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
                />
              </div>

              <div>
                <label className="block text-[#0F2249] font-semibold mb-1.5 text-xs">
                  Fecha y horario personalizado
                </label>
                <SessionSchedulePicker
                  dateKey={dateKey}
                  time24={time24}
                  onChange={next => {
                    setDateKey(next.dateKey);
                    setTime24(next.time24);
                  }}
                />
              </div>

              <div
                onClick={() => setUrgentUpgrade(!urgentUpgrade)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  urgentUpgrade
                    ? 'bg-amber-50 border-[#F5C52C]'
                    : 'bg-[#F4F6FA] border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={urgentUpgrade}
                  onChange={e => setUrgentUpgrade(e.target.checked)}
                  className="mt-0.5 accent-[#0F2249] w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F2249] text-xs flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Prioridad urgente (+Q25)</span>
                    </span>
                    <span className="text-amber-700 font-bold font-mono-nums text-xs">~15 min</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Notificamos a {expert.name.split(' ')[0]} de inmediato para conexión prioritaria.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-2/5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={scheduleInvalid}
                  className="w-3/5 py-3 rounded-xl bg-[#0F2249] hover:bg-[#19346b] disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Confirmar cita (Q{totalPrice})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-2xl text-[#0F2249]">¡Cita apartada!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Reservaste con <strong>{expert.name}</strong> ({scheduleSummary.fullDate}). Revisa tu portal para entrar a la sala en vivo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const QuestionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmitQuestion: (title: string, category: string) => void;
}> = ({ isOpen, onClose, onSubmitQuestion }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Physics');
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setPhraseIdx(pickNextVariantIndex('question_modal', QUESTION_VARIANTS.length));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copy = QUESTION_VARIANTS[phraseIdx];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmitQuestion(title, category);
    setTitle('');
    onClose();
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-[24px] w-full max-w-[820px] overflow-hidden shadow-[0_24px_60px_-20px_rgba(15,34,73,0.28)] grid grid-cols-1 md:grid-cols-[42%_58%]">
        {/* Left Editorial Graph-Paper Panel */}
        <div className="editorial-grid-panel p-6 sm:p-8 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="space-y-4">
            <div className="inline-block bg-[#F5C52C] text-[#0F2249] text-[10px] font-extrabold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md">
              {copy.badge}
            </div>

            <div>
              <h3 className="font-editorial text-2xl sm:text-[1.85rem] leading-[1.08] text-[#0F2249]">
                {copy.line1}
                <br />
                {copy.line2}
              </h3>
              <div className="mt-1 inline-block">
                <span className="font-serif-accent text-2xl sm:text-[1.75rem] text-[#0F2249] block">
                  {copy.accent}
                </span>
                <div className="h-[4px] w-full bg-[#F5C52C] rounded-full mt-1" />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600">{copy.description}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1.5">
              <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-500">
                {copy.cardKicker}
              </div>
              <div className="font-editorial text-base text-[#0F2249]">{copy.cardTitle}</div>
              <p className="text-[11px] text-slate-600">{copy.cardBody}</p>
            </div>

            <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-slate-500">
              FÍSICA  /  CÁLCULO  /  PROGRAMACIÓN
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="bg-white p-6 sm:p-8 relative flex flex-col justify-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-[13px]">
            <div>
              <div className="text-[10px] tracking-[0.15em] uppercase font-semibold text-slate-500">
                Nueva consulta
              </div>
              <h3 className="font-editorial text-2xl text-[#0F2249] mt-0.5">
                Pregunta a la comunidad
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Sé específico para recibir una respuesta más rápida.
              </p>
            </div>

            <div>
              <label className="block text-[#0F2249] font-semibold mb-1.5 text-xs">
                Tu pregunta
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. ¿Cómo balancear ecuaciones redox paso a paso?"
                className="w-full bg-[#F4F6FA] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
              />
            </div>

            <div>
              <label className="block text-[#0F2249] font-semibold mb-1.5 text-xs">
                Materia
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#F4F6FA] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#0F2249]"
              >
                <option value="Chemistry">Química</option>
                <option value="Physics">Física</option>
                <option value="Mathematics">Matemáticas</option>
                <option value="Tech">Tecnología / Programación</option>
                <option value="Career">Carrera y Estudio</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-2/5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-3/5 py-3 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs cursor-pointer shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Publicar pregunta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const ContactModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setPhraseIdx(pickNextVariantIndex('contact_modal', CONTACT_VARIANTS.length));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copy = CONTACT_VARIANTS[phraseIdx];

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-[24px] w-full max-w-[820px] overflow-hidden shadow-[0_24px_60px_-20px_rgba(15,34,73,0.28)] grid grid-cols-1 md:grid-cols-[42%_58%]">
        {/* Left Editorial Graph-Paper Panel */}
        <div className="editorial-grid-panel p-6 sm:p-8 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="space-y-4">
            <div className="inline-block bg-[#F5C52C] text-[#0F2249] text-[10px] font-extrabold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md">
              {copy.badge}
            </div>

            <div>
              <h3 className="font-editorial text-2xl sm:text-[1.85rem] leading-[1.08] text-[#0F2249]">
                {copy.line1}
                <br />
                {copy.line2}
              </h3>
              <div className="mt-1 inline-block">
                <span className="font-serif-accent text-2xl sm:text-[1.75rem] text-[#0F2249] block">
                  {copy.accent}
                </span>
                <div className="h-[4px] w-full bg-[#F5C52C] rounded-full mt-1" />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600">{copy.description}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1.5">
              <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-500">
                {copy.cardKicker}
              </div>
              <div className="font-editorial text-base text-[#0F2249] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{copy.cardTitle}</span>
              </div>
              <p className="text-[11px] text-slate-600">{copy.cardBody}</p>
            </div>

            <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-slate-500">
              SOPORTE  /  TUTORÍAS  /  CUENTA
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="bg-white p-6 sm:p-8 relative flex flex-col justify-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!submitted ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4 text-xs sm:text-[13px]"
            >
              <div>
                <div className="text-[10px] tracking-[0.15em] uppercase font-semibold text-slate-500">
                  Contacto ProLnk
                </div>
                <h3 className="font-editorial text-2xl text-[#0F2249] mt-0.5">
                  Envíanos un mensaje
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Te responderemos directamente a tu correo.
                </p>
              </div>

              <div>
                <label className="block text-[#0F2249] font-semibold mb-1.5 text-xs">
                  Tu correo electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  className="w-full bg-[#F4F6FA] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
                />
              </div>

              <div>
                <label className="block text-[#0F2249] font-semibold mb-1.5 text-xs">
                  Mensaje
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full bg-[#F4F6FA] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs rounded-xl cursor-pointer inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Enviar mensaje</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-2xl text-[#0F2249]">¡Mensaje enviado!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Nuestro equipo suele responder en menos de 2 horas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
