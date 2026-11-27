import React, { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Plus,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Search,
  Settings,
  PhoneOff,
  Users,
  Film,
  Clock,
  AlertTriangle,
  ShieldAlert,
  LogOut,
  X,
  Link2
} from 'lucide-react';
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
  MeetConferenceRecord,
  MeetParticipant,
  MeetRecording,
  GoogleMeetApiError,
  MEET_CONSOLE_CONFIG_URL,
  createMeetSpace,
  getMeetSpace,
  updateMeetSpaceConfig,
  endActiveConference,
  listConferenceRecords,
  listConferenceParticipants,
  listConferenceRecordings
} from '../services/googleMeetService';

interface GoogleMeetPanelProps {
  onNotify?: (msg: string) => void;
}

type PendingMeetAction =
  | {
      type: 'create_space';
      label: string;
      accessType: MeetAccessType;
      entryPointAccess: MeetEntryPointAccess;
    }
  | {
      type: 'update_config';
      spaceName: string;
      meetingCode?: string;
      accessType: MeetAccessType;
      entryPointAccess: MeetEntryPointAccess;
    }
  | {
      type: 'end_conference';
      spaceName: string;
      meetingCode?: string;
    };

const ACCESS_LABELS: Record<MeetAccessType, { label: string; desc: string }> = {
  TRUSTED: {
    label: 'Solo invitados / organización (Trusted)',
    desc: 'Personas invitadas o de tu organización entran directo; otros piden permiso.'
  },
  OPEN: {
    label: 'Abierta con enlace (Open)',
    desc: 'Cualquier tutor o estudiante con el enlace entra sin pedir admisión.'
  },
  RESTRICTED: {
    label: 'Restringida (Restricted)',
    desc: 'Solo participantes explícitamente invitados pueden unirse.'
  },
  ACCESS_TYPE_UNSPECIFIED: {
    label: 'Predeterminada de Google Meet',
    desc: 'Usa la configuración estándar de tu cuenta.'
  }
};

export const GoogleMeetPanel: React.FC<GoogleMeetPanelProps> = ({ onNotify }) => {
  const [needsAuth, setNeedsAuth] = useState<boolean>(() => !getMeetAccessToken());
  const [accessToken, setAccessToken] = useState<string | null>(() => getMeetAccessToken());
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [savedSpaces, setSavedSpaces] = useState<MeetSpace[]>([]);
  const [activeSpace, setActiveSpace] = useState<MeetSpace | null>(null);

  const [roomLabelInput, setRoomLabelInput] = useState('Tutoría 1-a-1 ProLnk');
  const [createAccessType, setCreateAccessType] = useState<MeetAccessType>('TRUSTED');
  const [createEntryPoint, setCreateEntryPoint] = useState<MeetEntryPointAccess>('ALL');

  const [lookupInput, setLookupInput] = useState('');
  const [editAccessType, setEditAccessType] = useState<MeetAccessType>('TRUSTED');
  const [editEntryPoint, setEditEntryPoint] = useState<MeetEntryPointAccess>('ALL');

  const [records, setRecords] = useState<MeetConferenceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MeetConferenceRecord | null>(null);
  const [participants, setParticipants] = useState<MeetParticipant[]>([]);
  const [recordings, setRecordings] = useState<MeetRecording[]>([]);

  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingRecordDetail, setLoadingRecordDetail] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [copiedUri, setCopiedUri] = useState<string | null>(null);

  const [apiError, setApiError] = useState<{
    message: string;
    isPermissionError?: boolean;
  } | null>(null);

  const [pendingAction, setPendingAction] = useState<PendingMeetAction | null>(null);

  const notify = useCallback(
    (msg: string) => {
      onNotify?.(msg);
    },
    [onNotify]
  );

  const handleApiError = useCallback((err: unknown) => {
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
      setApiError({ message: 'Ocurrió un error al comunicarse con Google Meet.' });
    }
  }, []);

  const fetchConferenceHistory = useCallback(
    async (token: string) => {
      setLoadingRecords(true);
      setApiError(null);
      try {
        const list = await listConferenceRecords(token);
        setRecords(list);
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoadingRecords(false);
      }
    },
    [handleApiError]
  );

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
    if (accessToken) {
      fetchConferenceHistory(accessToken);
    }
  }, [accessToken, fetchConferenceHistory]);

  useEffect(() => {
    if (activeSpace) {
      setEditAccessType(activeSpace.config?.accessType || 'TRUSTED');
      setEditEntryPoint(activeSpace.config?.entryPointAccess || 'ALL');
    }
  }, [activeSpace]);

  const handleGoogleLogin = async () => {
    setIsConnecting(true);
    setApiError(null);
    try {
      const result = await googleMeetSignIn();
      setAccessToken(result.accessToken);
      setConnectedEmail(result.user.email);
      setNeedsAuth(false);
      notify('Google Meet conectado correctamente.');
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectMeet = () => {
    clearMeetAccessToken();
    setAccessToken(null);
    setNeedsAuth(true);
    setSavedSpaces([]);
    setActiveSpace(null);
    setRecords([]);
    setSelectedRecord(null);
    setParticipants([]);
    setRecordings([]);
    setApiError(null);
  };

  const handleLookupSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !lookupInput.trim()) return;
    setLoadingLookup(true);
    setApiError(null);
    try {
      const space = await getMeetSpace(accessToken, lookupInput.trim());
      setActiveSpace(space);
      setSavedSpaces(prev => [space, ...prev.filter(s => s.name !== space.name)]);
      notify(`Sala ${space.meetingCode || space.name} cargada.`);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleSelectRecord = async (record: MeetConferenceRecord) => {
    if (!accessToken) return;
    setSelectedRecord(record);
    setLoadingRecordDetail(true);
    setApiError(null);
    try {
      const [parts, recs] = await Promise.all([
        listConferenceParticipants(accessToken, record.name).catch(() => []),
        listConferenceRecordings(accessToken, record.name).catch(() => [])
      ]);
      setParticipants(parts);
      setRecordings(recs);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingRecordDetail(false);
    }
  };

  const handleCopyUri = async (uri: string) => {
    try {
      await navigator.clipboard.writeText(uri);
      setCopiedUri(uri);
      notify('Enlace de Google Meet copiado al portapapeles.');
      setTimeout(() => setCopiedUri(null), 2000);
    } catch {
      notify(`Enlace listo: ${uri}`);
    }
  };

  const executeConfirmedAction = async () => {
    if (!accessToken || !pendingAction) return;
    setIsExecutingAction(true);
    setApiError(null);

    try {
      if (pendingAction.type === 'create_space') {
        const created = await createMeetSpace(accessToken, {
          accessType: pendingAction.accessType,
          entryPointAccess: pendingAction.entryPointAccess
        });
        setActiveSpace(created);
        setSavedSpaces(prev => [created, ...prev.filter(s => s.name !== created.name)]);
        notify(`Sala Google Meet creada: ${created.meetingCode || created.name}`);
      } else if (pendingAction.type === 'update_config') {
        const updated = await updateMeetSpaceConfig(accessToken, pendingAction.spaceName, {
          accessType: pendingAction.accessType,
          entryPointAccess: pendingAction.entryPointAccess
        });
        setActiveSpace(updated);
        setSavedSpaces(prev => prev.map(s => (s.name === updated.name ? updated : s)));
        notify('Configuración de la sala Google Meet actualizada.');
      } else if (pendingAction.type === 'end_conference') {
        await endActiveConference(accessToken, pendingAction.spaceName);
        const refreshed = await getMeetSpace(accessToken, pendingAction.spaceName).catch(() => null);
        if (refreshed) {
          setActiveSpace(refreshed);
          setSavedSpaces(prev => prev.map(s => (s.name === refreshed.name ? refreshed : s)));
        }
        await fetchConferenceHistory(accessToken);
        notify('Conferencia activa finalizada en Google Meet.');
      }
      setPendingAction(null);
    } catch (err) {
      handleApiError(err);
      setPendingAction(null);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  // Auth Gate Card using Official Sign in with Google button
  if (needsAuth || !accessToken) {
    return (
      <div className="bg-[#0a1329] border border-slate-800 rounded-2xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#0F2249] border border-[#F6C62B]/40 flex items-center justify-center mx-auto shadow-md">
          <Video className="w-8 h-8 text-[#F6C62B]" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
            Integración oficial Google Workspace
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Conecta Google Meet para tus tutorías en vivo
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Inicia sesión con Google para crear salas reales de Google Meet para tus sesiones 1-a-1, consultar salas existentes, ajustar el acceso y revisar tu historial de conferencias, siempre con tu permiso.
          </p>
        </div>

        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs text-left flex items-start gap-2.5 max-w-lg mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-300" />
            <span>{apiError.message}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
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

          <p className="text-[11px] text-slate-400">
            El token OAuth se guarda únicamente en memoria durante tu sesión activa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Status & Controls Bar */}
      <div className="bg-[#0a1329] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Video className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white font-display">
                Google Meet en vivo
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Conectado
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {connectedEmail ? `Sesión activa: ${connectedEmail}` : 'Google Meet API v2 conectada'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchConferenceHistory(accessToken)}
            disabled={loadingRecords}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRecords ? 'animate-spin' : ''}`} />
            <span>Actualizar historial</span>
          </button>
          <button
            type="button"
            onClick={handleDisconnectMeet}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Desconectar</span>
          </button>
        </div>
      </div>

      {/* API Error Guidance Banner */}
      {apiError && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-100">{apiError.message}</p>
                {apiError.isPermissionError && (
                  <p className="text-amber-200/80 leading-relaxed">
                    Verifica que la API de Google Meet esté habilitada en Google Cloud Console y vuelve a conceder permisos con tu cuenta.
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-amber-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {apiError.isPermissionError && (
            <div className="flex flex-wrap gap-2 pl-6">
              <a
                href={MEET_CONSOLE_CONFIG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F6C62B] text-[#0F2249] font-bold text-xs"
              >
                <span>Abrir Google Meet API en Cloud Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Create & Manage Room + Conference History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Create Meet Room + Lookup Space */}
        <div className="lg:col-span-5 space-y-4">
          {/* Create New Study / Tutoring Meet Space */}
          <div className="bg-[#0a1329] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#F6C62B]" />
                <h3 className="text-sm font-bold text-white font-display">
                  Crear nueva sala de Google Meet
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F6C62B]/15 text-[#F6C62B] font-semibold">
                Tutoría / Estudio
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Etiqueta de referencia (local)
                </label>
                <input
                  type="text"
                  value={roomLabelInput}
                  onChange={e => setRoomLabelInput(e.target.value)}
                  placeholder="Ej. Repaso de Cálculo con Daniela"
                  className="w-full bg-[#080f21] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Control de acceso
                </label>
                <select
                  value={createAccessType}
                  onChange={e => setCreateAccessType(e.target.value as MeetAccessType)}
                  className="w-full bg-[#080f21] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
                >
                  <option value="TRUSTED">Solo invitados / organización (Trusted)</option>
                  <option value="OPEN">Abierta con enlace (Open)</option>
                  <option value="RESTRICTED">Restringida solo a invitados (Restricted)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {ACCESS_LABELS[createAccessType].desc}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Puntos de entrada
                </label>
                <select
                  value={createEntryPoint}
                  onChange={e => setCreateEntryPoint(e.target.value as MeetEntryPointAccess)}
                  className="w-full bg-[#080f21] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
                >
                  <option value="ALL">Todos los enlaces y teléfonos (ALL)</option>
                  <option value="CREATOR_APP_ONLY">Solo creados por esta app</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPendingAction({
                    type: 'create_space',
                    label: roomLabelInput.trim() || 'Sala de Tutoría ProLnk',
                    accessType: createAccessType,
                    entryPointAccess: createEntryPoint
                  })
                }
                className="w-full py-2.5 px-4 rounded-xl bg-[#F6C62B] hover:bg-[#e5b51f] text-[#0F2249] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Generar sala de Google Meet</span>
              </button>
            </div>
          </div>

          {/* Look up an Existing Meet Code or URL */}
          <div className="bg-[#0a1329] border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#F6C62B]" />
              <h3 className="text-sm font-bold text-white font-display">
                Consultar o gestionar una sala existente
              </h3>
            </div>
            <form onSubmit={handleLookupSpace} className="flex gap-2">
              <input
                type="text"
                value={lookupInput}
                onChange={e => setLookupInput(e.target.value)}
                placeholder="Código (abc-defg-hij) o URL meet.google.com/..."
                className="flex-1 bg-[#080f21] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B]"
              />
              <button
                type="submit"
                disabled={loadingLookup || !lookupInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {loadingLookup ? 'Buscando...' : 'Buscar'}
              </button>
            </form>

            {savedSpaces.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-400">
                  Salas en esta sesión ({savedSpaces.length})
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {savedSpaces.map(sp => (
                    <button
                      type="button"
                      key={sp.name}
                      onClick={() => setActiveSpace(sp)}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        activeSpace?.name === sp.name
                          ? 'bg-[#122144] border-[#F6C62B]/60 text-white'
                          : 'bg-[#080f21] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate">
                          {sp.meetingCode || sp.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {sp.config?.accessType || 'TRUSTED'}
                        </div>
                      </div>
                      {sp.activeConference?.conferenceRecord && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold shrink-0">
                          En curso
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Room Controls + Conference History */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Meet Room Card */}
          <div className="bg-[#0a1329] border border-slate-800 rounded-2xl p-5 space-y-4">
            {activeSpace ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#F6C62B]">
                        Sala activa seleccionada
                      </span>
                      {activeSpace.activeConference?.conferenceRecord && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          Conferencia en curso
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white font-display mt-0.5">
                      Código: {activeSpace.meetingCode || activeSpace.name}
                    </h3>
                    <p className="text-xs text-slate-400">{activeSpace.name}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeSpace.meetingUri && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyUri(activeSpace.meetingUri!)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedUri === activeSpace.meetingUri ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar enlace</span>
                            </>
                          )}
                        </button>
                        <a
                          href={activeSpace.meetingUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-[#F6C62B] hover:bg-[#e5b51f] text-[#0F2249] text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <span>Unirse a Google Meet</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {activeSpace.meetingUri && (
                  <div className="p-3 rounded-xl bg-[#080f21] border border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0 text-slate-300">
                      <Link2 className="w-4 h-4 text-[#F6C62B] shrink-0" />
                      <span className="truncate font-mono">{activeSpace.meetingUri}</span>
                    </div>
                  </div>
                )}

                {/* Room Access Settings */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Settings className="w-4 h-4 text-[#F6C62B]" />
                    <span>Ajustes de la sala</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Tipo de acceso</label>
                      <select
                        value={editAccessType}
                        onChange={e => setEditAccessType(e.target.value as MeetAccessType)}
                        className="w-full bg-[#080f21] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
                      >
                        <option value="TRUSTED">Trusted (Invitados / Org)</option>
                        <option value="OPEN">Open (Abierta con enlace)</option>
                        <option value="RESTRICTED">Restricted (Solo invitados)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Acceso de entrada</label>
                      <select
                        value={editEntryPoint}
                        onChange={e => setEditEntryPoint(e.target.value as MeetEntryPointAccess)}
                        className="w-full bg-[#080f21] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
                      >
                        <option value="ALL">Todos los puntos (ALL)</option>
                        <option value="CREATOR_APP_ONLY">Solo esta app</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAction({
                          type: 'update_config',
                          spaceName: activeSpace.name,
                          meetingCode: activeSpace.meetingCode,
                          accessType: editAccessType,
                          entryPointAccess: editEntryPoint
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Guardar configuración de acceso
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPendingAction({
                          type: 'end_conference',
                          spaceName: activeSpace.name,
                          meetingCode: activeSpace.meetingCode
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                      <span>Finalizar llamada activa</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 text-center space-y-2">
                <Video className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-bold text-white">Ninguna sala seleccionada todavía</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Crea una sala nueva a la izquierda para obtener tu enlace de Google Meet al instante, o busca un código existente.
                </p>
              </div>
            )}
          </div>

          {/* Recent Conference Records + Participants & Recordings */}
          <div className="bg-[#0a1329] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F6C62B]" />
                <h3 className="text-sm font-bold text-white font-display">
                  Historial reciente de reuniones ({records.length})
                </h3>
              </div>
            </div>

            {loadingRecords ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Cargando conferencias desde Google Meet...
              </p>
            ) : records.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No se encontraron conferencias recientes en esta cuenta.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {records.map(rec => (
                    <button
                      type="button"
                      key={rec.name}
                      onClick={() => handleSelectRecord(rec)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                        selectedRecord?.name === rec.name
                          ? 'bg-[#122144] border-[#F6C62B]/60 text-white'
                          : 'bg-[#080f21] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold truncate">{rec.space || rec.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Inicio: {formatTime(rec.startTime)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Fin: {rec.endTime ? formatTime(rec.endTime) : 'Activa / en curso'}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected Conference Participants & Recordings */}
                <div className="bg-[#080f21] border border-slate-800 rounded-xl p-3.5 space-y-3 text-xs">
                  {selectedRecord ? (
                    loadingRecordDetail ? (
                      <p className="text-slate-400 text-center py-6">Cargando participantes...</p>
                    ) : (
                      <>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white mb-1.5">
                            <Users className="w-3.5 h-3.5 text-[#F6C62B]" />
                            <span>Participantes ({participants.length})</span>
                          </div>
                          {participants.length === 0 ? (
                            <p className="text-[11px] text-slate-500">Sin datos de participantes.</p>
                          ) : (
                            <ul className="space-y-1 max-h-24 overflow-y-auto">
                              {participants.map(p => (
                                <li key={p.name} className="text-[11px] text-slate-300 truncate">
                                  •{' '}
                                  {p.signedinUser?.displayName ||
                                    p.anonymousUser?.displayName ||
                                    p.phoneUser?.displayName ||
                                    'Participante'}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <div className="flex items-center gap-1.5 font-bold text-white mb-1.5">
                            <Film className="w-3.5 h-3.5 text-[#F6C62B]" />
                            <span>Grabaciones ({recordings.length})</span>
                          </div>
                          {recordings.length === 0 ? (
                            <p className="text-[11px] text-slate-500">No hay grabaciones disponibles.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {recordings.map(r => (
                                <div
                                  key={r.name}
                                  className="flex items-center justify-between gap-2 text-[11px] text-slate-300"
                                >
                                  <span className="truncate">{r.state || 'Grabación'}</span>
                                  {r.driveDestination?.exportUri && (
                                    <a
                                      href={r.driveDestination.exportUri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#F6C62B] font-semibold inline-flex items-center gap-1 shrink-0"
                                    >
                                      <span>Ver</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-[11px]">
                      Selecciona una reunión de la lista para ver participantes y grabaciones.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MANDATORY User Confirmation Modal for All Mutating/Destructive Google Meet Actions */}
      {pendingAction && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget && !isExecutingAction) setPendingAction(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white border border-slate-200 rounded-[24px] max-w-[740px] w-full overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-[42%_58%]">
            <div className="editorial-grid-panel p-6 flex flex-col justify-between gap-5 border-b md:border-b-0 md:border-r border-slate-200/80">
              <div className="space-y-3">
                <div className="inline-block bg-[#F5C52C] text-[#0F2249] text-[10px] font-extrabold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md">
                  Google Meet · Confirmación
                </div>
                <h4 className="font-editorial text-2xl leading-tight text-[#0F2249]">
                  {pendingAction.type === 'end_conference'
                    ? '¿Finalizar llamada activa?'
                    : pendingAction.type === 'update_config'
                    ? '¿Actualizar acceso de sala?'
                    : '¿Crear nueva sala Meet?'}
                </h4>
              </div>
              <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-slate-500">
                GOOGLE WORKSPACE  /  MEET API V2
              </div>
            </div>

            <div className="bg-white p-6 space-y-4 relative">
              <button
                type="button"
                disabled={isExecutingAction}
                onClick={() => setPendingAction(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-xs text-slate-600 space-y-2 leading-relaxed pt-2">
                {pendingAction.type === 'create_space' && (
                  <>
                    <p>
                      Se creará una nueva sala de Google Meet en tu cuenta para{' '}
                      <strong className="text-[#0F2249]">{pendingAction.label}</strong>:
                    </p>
                    <div className="p-3 rounded-xl bg-[#F4F6FA] border border-slate-200 text-[#0F2249] space-y-1">
                      <div>
                        <strong>Acceso:</strong> {ACCESS_LABELS[pendingAction.accessType].label}
                      </div>
                      <div>
                        <strong>Puntos de entrada:</strong>{' '}
                        {pendingAction.entryPointAccess === 'ALL' ? 'Todos' : 'Solo esta app'}
                      </div>
                    </div>
                  </>
                )}

                {pendingAction.type === 'update_config' && (
                  <>
                    <p>
                      Se modificará la configuración de la sala{' '}
                      <strong className="text-[#0F2249]">
                        {pendingAction.meetingCode || pendingAction.spaceName}
                      </strong>
                      :
                    </p>
                    <div className="p-3 rounded-xl bg-[#F4F6FA] border border-slate-200 text-[#0F2249] space-y-1">
                      <div>
                        <strong>Nuevo acceso:</strong> {ACCESS_LABELS[pendingAction.accessType].label}
                      </div>
                      <div>
                        <strong>Puntos de entrada:</strong>{' '}
                        {pendingAction.entryPointAccess === 'ALL' ? 'Todos' : 'Solo esta app'}
                      </div>
                    </div>
                  </>
                )}

                {pendingAction.type === 'end_conference' && (
                  <p>
                    Esta acción finalizará de inmediato la conferencia en curso en{' '}
                    <strong className="text-[#0F2249]">
                      {pendingAction.meetingCode || pendingAction.spaceName}
                    </strong>{' '}
                    y desconectará a todos los participantes activos.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isExecutingAction}
                  onClick={() => setPendingAction(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isExecutingAction}
                  onClick={executeConfirmedAction}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 ${
                    pendingAction.type === 'end_conference'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-[#0F2249] hover:bg-[#19346b] text-white'
                  }`}
                >
                  {isExecutingAction ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
