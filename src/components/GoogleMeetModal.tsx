import React, { useState, useEffect } from 'react';
import {
  Video,
  Link2,
  Plus,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  Clock,
  CheckCircle2,
  Search
} from 'lucide-react';
import { DashboardSession } from '../types';
import { pickNextVariantIndex } from './Modals';
import {
  initGoogleMeetAuth,
  googleMeetSignIn,
  getMeetAccessToken,
  clearMeetAccessToken
} from '../firebase/authService';
import {
  MeetSpace,
  MeetAccessType,
  MeetEntryPointAccess,
  GoogleMeetApiError,
  MEET_CONSOLE_CONFIG_URL,
  createMeetSpace,
  getMeetSpace,
  extractMeetLinkInfo
} from '../services/googleMeetService';

export interface GoogleMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: DashboardSession | null;
  initialMode?: 'launch' | 'join';
  onSpaceLinked?: (
    sessionId: string,
    space: { meetingUri: string; meetingCode?: string; spaceName?: string }
  ) => void;
  onNotify?: (msg: string) => void;
}

const MEET_MODAL_PHRASES = [
  {
    badge: 'Google Meet en vivo',
    line1: 'Tu clase,',
    line2: 'cara a cara.',
    accent: 'Sin fricción.',
    desc: 'Lanza una sala nueva de Google Meet para tu tutoría o únete al instante con el enlace compartido.'
  },
  {
    badge: 'Conexión directa',
    line1: 'Entra a tu sesión',
    line2: 'en un clic.',
    accent: 'Conéctate ahora.',
    desc: 'Crea salas con acceso controlado desde tu cuenta de Google o valida el enlace de tu tutor antes de entrar.'
  },
  {
    badge: 'Tutoría en vivo',
    line1: 'De tu reserva',
    line2: 'a la videollamada.',
    accent: 'Todo integrado.',
    desc: 'Vincula tu sala de Google Meet directamente a tu sesión apartada para volver a entrar cuando quieras.'
  },
  {
    badge: 'Workspace listo',
    line1: 'Comparte ideas',
    line2: 'en tiempo real.',
    accent: 'Aprende mejor.',
    desc: 'Inicia salas instantáneas o abre cualquier código meet.google.com desde tu portal ProLnk.'
  }
];

const ACCESS_OPTIONS: { value: MeetAccessType; label: string; hint: string }[] = [
  {
    value: 'TRUSTED',
    label: 'Invitados / organización (Trusted)',
    hint: 'Tu tutor o personas invitadas entran directo; otros solicitan acceso.'
  },
  {
    value: 'OPEN',
    label: 'Abierta con enlace (Open)',
    hint: 'Cualquier persona con este enlace puede entrar sin esperar admisión.'
  },
  {
    value: 'RESTRICTED',
    label: 'Solo invitados explícitos (Restricted)',
    hint: 'Únicamente participantes autorizados en la sala pueden ingresar.'
  }
];

export const GoogleMeetModal: React.FC<GoogleMeetModalProps> = ({
  isOpen,
  onClose,
  session,
  initialMode,
  onSpaceLinked,
  onNotify
}) => {
  const [mode, setMode] = useState<'launch' | 'join'>('launch');
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [needsAuth, setNeedsAuth] = useState<boolean>(() => !getMeetAccessToken());
  const [accessToken, setAccessToken] = useState<string | null>(() => getMeetAccessToken());
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Launch New Room state
  const [roomLabel, setRoomLabel] = useState('Tutoría ProLnk 1-a-1');
  const [accessType, setAccessType] = useState<MeetAccessType>('TRUSTED');
  const [entryPointAccess, setEntryPointAccess] = useState<MeetEntryPointAccess>('ALL');
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdSpace, setCreatedSpace] = useState<MeetSpace | null>(null);

  // Join Existing Link state
  const [joinLinkInput, setJoinLinkInput] = useState('');
  const [verifiedSpace, setVerifiedSpace] = useState<MeetSpace | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [copiedUri, setCopiedUri] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{
    message: string;
    isPermissionError?: boolean;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleMeetAuth(
      (user, token) => {
        setAccessToken(token);
        setConnectedEmail(user.email);
        setNeedsAuth(false);
      },
      () => {
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setPhraseIdx(pickNextVariantIndex('google_meet_modal', MEET_MODAL_PHRASES.length));
    setApiError(null);
    setConfirmCreateOpen(false);
    setCreatedSpace(null);
    setVerifiedSpace(null);

    const token = getMeetAccessToken();
    setAccessToken(token);
    setNeedsAuth(!token);

    const resolvedMode = initialMode ?? (session?.meetUri ? 'join' : 'launch');
    setMode(resolvedMode);

    if (session) {
      setRoomLabel(`${session.topic} · ${session.expertName}`);
      setJoinLinkInput(session.meetUri || '');
    } else {
      setRoomLabel('Tutoría ProLnk 1-a-1');
      setJoinLinkInput('');
    }
  }, [isOpen, session, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCreating && !isVerifying) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isCreating, isVerifying, onClose]);

  if (!isOpen) return null;

  const phrase = MEET_MODAL_PHRASES[phraseIdx];
  const parsedJoinLink = extractMeetLinkInfo(joinLinkInput);
  const activeAccessHint = ACCESS_OPTIONS.find(o => o.value === accessType)?.hint || '';

  const handleApiError = (err: unknown) => {
    if (err instanceof GoogleMeetApiError) {
      if (err.isAuthError) {
        clearMeetAccessToken();
        setAccessToken(null);
        setNeedsAuth(true);
      }
      setApiError({
        message: err.message,
        isPermissionError: err.isPermissionError
      });
    } else if (err instanceof Error) {
      setApiError({ message: err.message });
    } else {
      setApiError({ message: 'No se pudo completar la operación con Google Meet.' });
    }
  };

  const handleGoogleLogin = async () => {
    setIsConnecting(true);
    setApiError(null);
    try {
      const res = await googleMeetSignIn();
      setAccessToken(res.accessToken);
      setConnectedEmail(res.user.email);
      setNeedsAuth(false);
      onNotify?.('Cuenta de Google conectada para Google Meet.');
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConfirmCreateSpace = async () => {
    if (!accessToken) return;
    setIsCreating(true);
    setApiError(null);
    try {
      const space = await createMeetSpace(accessToken, {
        accessType,
        entryPointAccess
      });
      setCreatedSpace(space);
      setConfirmCreateOpen(false);
      if (session && space.meetingUri) {
        onSpaceLinked?.(session.id, {
          meetingUri: space.meetingUri,
          meetingCode: space.meetingCode,
          spaceName: space.name
        });
      }
      onNotify?.(`Sala Google Meet lista: ${space.meetingCode || space.name}`);
    } catch (err) {
      setConfirmCreateOpen(false);
      handleApiError(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerifyExistingRoom = async () => {
    if (!accessToken || !parsedJoinLink) return;
    setIsVerifying(true);
    setApiError(null);
    try {
      const space = await getMeetSpace(accessToken, parsedJoinLink.spaceName);
      setVerifiedSpace(space);
      if (session && (space.meetingUri || parsedJoinLink.meetingUri)) {
        onSpaceLinked?.(session.id, {
          meetingUri: space.meetingUri || parsedJoinLink.meetingUri,
          meetingCode: space.meetingCode || parsedJoinLink.meetingCode,
          spaceName: space.name
        });
      }
      onNotify?.(`Sala ${space.meetingCode || parsedJoinLink.meetingCode} verificada.`);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLinkToSession = () => {
    if (!session || !parsedJoinLink) return;
    onSpaceLinked?.(session.id, {
      meetingUri: verifiedSpace?.meetingUri || parsedJoinLink.meetingUri,
      meetingCode: verifiedSpace?.meetingCode || parsedJoinLink.meetingCode,
      spaceName: verifiedSpace?.name || parsedJoinLink.spaceName
    });
    onNotify?.('Enlace de Google Meet guardado en tu sesión.');
  };

  const handleCopy = async (uri: string) => {
    try {
      await navigator.clipboard.writeText(uri);
      setCopiedUri(uri);
      onNotify?.('Enlace de Google Meet copiado.');
      setTimeout(() => setCopiedUri(null), 2000);
    } catch {
      onNotify?.(`Enlace listo: ${uri}`);
    }
  };

  const renderGoogleSignInButton = () => (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isConnecting}
      className="gsi-material-button"
    >
      <div className="gsi-material-button-state"></div>
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            style={{ display: 'block' }}
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            ></path>
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            ></path>
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            ></path>
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            ></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </div>
        <span className="gsi-material-button-contents">
          {isConnecting ? 'Conectando...' : 'Sign in with Google'}
        </span>
      </div>
    </button>
  );

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget && !isCreating && !isVerifying) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-[24px] w-full max-w-[840px] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-[40%_60%] my-auto">
        {/* Left Editorial Graph-Paper Column */}
        <div className="editorial-grid-panel p-6 sm:p-8 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="space-y-4">
            <div className="inline-block bg-[#F5C52C] text-[#0F2249] text-[10px] font-extrabold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md">
              {phrase.badge}
            </div>

            <div>
              <h3 className="font-editorial text-2xl sm:text-[28px] leading-[1.08] text-[#0F2249]">
                {phrase.line1}
                <br />
                {phrase.line2}
              </h3>
              <div className="mt-1 inline-block">
                <span className="font-serif-accent text-2xl sm:text-[26px] text-[#0F2249] block">
                  {phrase.accent}
                </span>
                <div className="h-[4px] w-full bg-[#F5C52C] rounded-full mt-1" />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600">{phrase.desc}</p>

            {session && (
              <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-500">
                  Sesión reservada
                </div>
                <div className="font-editorial text-base text-[#0F2249] leading-snug">
                  {session.topic}
                </div>
                <div className="text-xs text-slate-600">Con {session.expertName}</div>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0F2249]" />
                    {session.date}
                  </span>
                  {session.time && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0F2249]" />
                      {session.time}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-slate-500">
            GOOGLE WORKSPACE / MEET EN VIVO
          </div>
        </div>

        {/* Right Interactive Column */}
        <div className="bg-white p-6 sm:p-7 relative space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[0.15em] uppercase font-semibold text-slate-500">
                Aula de videollamada
              </div>
              <h4 className="font-editorial text-xl sm:text-2xl text-[#0F2249] mt-0.5">
                Google Meet
              </h4>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating || isVerifying}
              aria-label="Cerrar ventana de Google Meet"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F3F5F8] border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setMode('launch');
                setApiError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'launch'
                  ? 'bg-white text-[#0F2249] shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-[#0F2249]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lanzar nueva sala</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('join');
                setApiError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'join'
                  ? 'bg-white text-[#0F2249] shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-[#0F2249]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Unirse con enlace</span>
            </button>
          </div>

          {/* Error Banner */}
          {apiError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-start gap-2">
                {apiError.isPermissionError ? (
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold">{apiError.message}</p>
                  {apiError.isPermissionError && (
                    <p className="text-amber-800/90">
                      Verifica que la API de Google Meet esté habilitada y vuelve a conceder permisos con tu cuenta de Google.
                    </p>
                  )}
                </div>
              </div>
              {apiError.isPermissionError && (
                <a
                  href={MEET_CONSOLE_CONFIG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F2249] text-white font-semibold text-[11px]"
                >
                  <span>Abrir configuración en Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* MODE 1: LAUNCH NEW MEETING ROOM */}
          {mode === 'launch' && (
            <div className="space-y-4">
              {createdSpace?.meetingUri ? (
                <div className="p-5 rounded-2xl bg-[#F4F7FB] border border-slate-200 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">
                          Sala creada y vinculada
                        </div>
                        <div className="font-editorial text-lg text-[#0F2249]">
                          Código: {createdSpace.meetingCode || createdSpace.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0 text-[#0F2249]">
                      <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate font-mono">{createdSpace.meetingUri}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdSpace.meetingUri!)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F2249] font-semibold shrink-0 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUri === createdSpace.meetingUri ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={createdSpace.meetingUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <Video className="w-4 h-4 text-[#F5C52C]" />
                      <span>Entrar ahora a Google Meet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setCreatedSpace(null)}
                      className="py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#0F2249] font-semibold text-xs cursor-pointer"
                    >
                      Crear otra
                    </button>
                  </div>
                </div>
              ) : needsAuth || !accessToken ? (
                <div className="p-5 rounded-2xl bg-[#FAFAF5] border border-slate-200 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0F2249] text-[#F5C52C] flex items-center justify-center mx-auto">
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-editorial text-lg text-[#0F2249]">
                      Conecta tu cuenta de Google
                    </h5>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Inicia sesión con Google para generar una sala real de Google Meet con tu permiso y asociarla a tu sesión.
                    </p>
                  </div>
                  <div className="flex justify-center">{renderGoogleSignInButton()}</div>
                </div>
              ) : confirmCreateOpen ? (
                <div className="p-5 rounded-2xl bg-[#FAFAF5] border-2 border-[#0F2249]/20 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#0F2249] bg-[#F5C52C] px-2.5 py-1 rounded-md inline-block">
                      Confirmar creación
                    </span>
                    <h5 className="font-editorial text-lg text-[#0F2249] pt-1">
                      ¿Crear esta sala de Google Meet?
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Se generará una nueva sala en Google Meet en la cuenta{' '}
                      <strong className="text-[#0F2249]">{connectedEmail || 'conectada'}</strong> para{' '}
                      <strong className="text-[#0F2249]">{roomLabel}</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-[#0F2249] space-y-1">
                    <div>
                      <strong>Acceso:</strong>{' '}
                      {ACCESS_OPTIONS.find(o => o.value === accessType)?.label}
                    </div>
                    <div>
                      <strong>Puntos de entrada:</strong>{' '}
                      {entryPointAccess === 'ALL' ? 'Todos los enlaces y teléfonos' : 'Solo esta aplicación'}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      disabled={isCreating}
                      onClick={() => setConfirmCreateOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isCreating}
                      onClick={handleConfirmCreateSpace}
                      className="px-5 py-2.5 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isCreating ? 'Creando sala...' : 'Confirmar y crear sala'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 bg-[#F4F7FB] px-3 py-2 rounded-xl border border-slate-200/70">
                    <span>
                      Conectado como{' '}
                      <strong className="text-[#0F2249]">{connectedEmail || 'Google Workspace'}</strong>
                    </span>
                    <span className="text-emerald-700 font-bold">Listo</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F2249] mb-1">
                      Nombre de referencia de la sesión
                    </label>
                    <input
                      type="text"
                      value={roomLabel}
                      onChange={e => setRoomLabel(e.target.value)}
                      placeholder="Ej. Cálculo diferencial · Daniela Ríos"
                      className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0F2249] placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#0F2249] mb-1">
                        Control de acceso
                      </label>
                      <select
                        value={accessType}
                        onChange={e => setAccessType(e.target.value as MeetAccessType)}
                        className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-[#0F2249] focus:outline-none focus:border-[#0F2249]"
                      >
                        {ACCESS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F2249] mb-1">
                        Puntos de entrada
                      </label>
                      <select
                        value={entryPointAccess}
                        onChange={e => setEntryPointAccess(e.target.value as MeetEntryPointAccess)}
                        className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-[#0F2249] focus:outline-none focus:border-[#0F2249]"
                      >
                        <option value="ALL">Todos los enlaces (ALL)</option>
                        <option value="CREATOR_APP_ONLY">Solo esta aplicación</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">{activeAccessHint}</p>

                  <button
                    type="button"
                    onClick={() => setConfirmCreateOpen(true)}
                    className="w-full py-3 px-4 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Video className="w-4 h-4 text-[#F5C52C]" />
                    <span>Lanzar nueva sala de Google Meet</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: JOIN EXISTING MEETING USING EMBEDDED LINK */}
          {mode === 'join' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0F2249] mb-1.5">
                  Enlace o código de Google Meet
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={joinLinkInput}
                    onChange={e => {
                      setJoinLinkInput(e.target.value);
                      setVerifiedSpace(null);
                    }}
                    placeholder="https://meet.google.com/abc-defg-hij o abc-defg-hij"
                    className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#0F2249] placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Pega el enlace enviado por tu tutor o usa el enlace ya vinculado a tu sesión apartada.
                </p>
              </div>

              {parsedJoinLink ? (
                <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-slate-200 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#0F2249]">
                          Enlace integrado listo
                        </span>
                        {verifiedSpace?.activeConference?.conferenceRecord && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                            Llamada en curso
                          </span>
                        )}
                        {verifiedSpace && !verifiedSpace.activeConference?.conferenceRecord && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            Sala verificada
                          </span>
                        )}
                      </div>
                      <div className="font-editorial text-lg text-[#0F2249] mt-0.5">
                        {verifiedSpace?.meetingCode || parsedJoinLink.meetingCode}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 truncate">
                        {verifiedSpace?.meetingUri || parsedJoinLink.meetingUri}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(verifiedSpace?.meetingUri || parsedJoinLink.meetingUri)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[#0F2249] font-semibold shrink-0 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUri === (verifiedSpace?.meetingUri || parsedJoinLink.meetingUri) ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={verifiedSpace?.meetingUri || parsedJoinLink.meetingUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[180px] py-2.5 px-4 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <Video className="w-4 h-4 text-[#F5C52C]" />
                      <span>Unirse a Google Meet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {session &&
                      session.meetUri !== (verifiedSpace?.meetingUri || parsedJoinLink.meetingUri) && (
                        <button
                          type="button"
                          onClick={handleLinkToSession}
                          className="py-2.5 px-3.5 rounded-xl bg-[#F5C52C] hover:bg-[#e5b51f] text-[#0F2249] font-bold text-xs cursor-pointer"
                        >
                          Guardar en esta sesión
                        </button>
                      )}
                  </div>

                  {/* Optional live room verification using Google Meet API */}
                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    {accessToken ? (
                      <button
                        type="button"
                        onClick={handleVerifyExistingRoom}
                        disabled={isVerifying}
                        className="text-[11px] font-semibold text-[#0F2249] hover:underline inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>
                          {isVerifying ? 'Consultando estado de la sala...' : 'Verificar estado en Google Meet'}
                        </span>
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                        <span className="text-[11px] text-slate-500">
                          ¿Quieres verificar el estado de esta sala antes de entrar?
                        </span>
                        <div className="scale-90 origin-right">{renderGoogleSignInButton()}</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#FAFAF5] border border-dashed border-slate-300 text-center space-y-2">
                  <Link2 className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-[#0F2249]">
                    Ingresa un enlace o código válido de Google Meet
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ejemplo: <span className="font-mono">https://meet.google.com/abc-defg-hij</span> o{' '}
                    <span className="font-mono">abc-defg-hij</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
