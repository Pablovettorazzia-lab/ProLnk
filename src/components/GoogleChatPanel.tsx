import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Send,
  Plus,
  Users,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  X,
  Hash,
  UserCircle2,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import {
  initGoogleChatAuth,
  googleChatSignIn,
  getChatAccessToken,
  clearChatAccessToken
} from '../firebase/authService';
import {
  GoogleChatSpace,
  GoogleChatMessage,
  GoogleChatMembership,
  GoogleChatApiError,
  CHAT_CONSOLE_CONFIG_URL,
  listChatSpaces,
  createChatSpace,
  listSpaceMessages,
  sendChatMessage,
  deleteChatMessage,
  addMessageReaction,
  listSpaceMembers
} from '../services/googleChatService';

interface GoogleChatPanelProps {
  onNotify?: (msg: string) => void;
}

type PendingAction =
  | {
      type: 'send_message';
      spaceName: string;
      spaceDisplay: string;
      text: string;
    }
  | {
      type: 'create_space';
      displayName: string;
    }
  | {
      type: 'delete_message';
      messageName: string;
      preview: string;
    }
  | {
      type: 'add_reaction';
      messageName: string;
      emoji: string;
      preview: string;
    };

export const GoogleChatPanel: React.FC<GoogleChatPanelProps> = ({ onNotify }) => {
  const [needsAuth, setNeedsAuth] = useState<boolean>(() => !getChatAccessToken());
  const [accessToken, setAccessToken] = useState<string | null>(() => getChatAccessToken());
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<GoogleChatSpace | null>(null);
  const [messages, setMessages] = useState<GoogleChatMessage[]>([]);
  const [members, setMembers] = useState<GoogleChatMembership[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  const [composerText, setComposerText] = useState('');
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');

  const [apiError, setApiError] = useState<{
    message: string;
    isAppNotConfigured?: boolean;
    isConsumerAccountError?: boolean;
  } | null>(null);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const notify = useCallback(
    (msg: string) => {
      onNotify?.(msg);
    },
    [onNotify]
  );

  const handleApiError = useCallback((err: unknown) => {
    if (err instanceof GoogleChatApiError) {
      if (err.isAuthError) {
        clearChatAccessToken();
        setAccessToken(null);
        setNeedsAuth(true);
      }
      setApiError({
        message: err.message,
        isAppNotConfigured: err.isAppNotConfigured,
        isConsumerAccountError: err.isConsumerAccountError
      });
    } else if (err instanceof Error) {
      setApiError({ message: err.message });
    } else {
      setApiError({ message: 'Ocurrió un error al comunicarse con Google Chat.' });
    }
  }, []);

  const fetchSpaces = useCallback(
    async (token: string) => {
      setLoadingSpaces(true);
      setApiError(null);
      try {
        const list = await listChatSpaces(token);
        setSpaces(list);
        if (list.length > 0) {
          setSelectedSpace(prev => (prev && list.some(s => s.name === prev.name) ? prev : list[0]));
        } else {
          setSelectedSpace(null);
        }
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoadingSpaces(false);
      }
    },
    [handleApiError]
  );

  const fetchSpaceDetails = useCallback(
    async (token: string, space: GoogleChatSpace) => {
      setLoadingMessages(true);
      setApiError(null);
      try {
        const [msgs, mems] = await Promise.all([
          listSpaceMessages(token, space.name),
          listSpaceMembers(token, space.name).catch(() => [])
        ]);
        setMessages(msgs);
        setMembers(mems);
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [handleApiError]
  );

  useEffect(() => {
    const unsubscribe = initGoogleChatAuth(
      (firebaseUser, token) => {
        setAccessToken(token);
        setConnectedEmail(firebaseUser.email);
        setNeedsAuth(false);
      },
      () => {
        if (!getChatAccessToken()) {
          setAccessToken(null);
          setNeedsAuth(true);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchSpaces(accessToken);
    }
  }, [accessToken, fetchSpaces]);

  useEffect(() => {
    if (accessToken && selectedSpace) {
      fetchSpaceDetails(accessToken, selectedSpace);
    }
  }, [accessToken, selectedSpace, fetchSpaceDetails]);

  const handleGoogleLogin = async () => {
    setIsConnecting(true);
    setApiError(null);
    try {
      const { user, accessToken: token } = await googleChatSignIn();
      setAccessToken(token);
      setConnectedEmail(user.email);
      setNeedsAuth(false);
      notify('Conectado con Google Chat.');
    } catch (err: any) {
      setApiError({
        message: err?.message || 'No se pudo completar el inicio de sesión con Google.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectChat = () => {
    clearChatAccessToken();
    setAccessToken(null);
    setNeedsAuth(true);
    setSpaces([]);
    setSelectedSpace(null);
    setMessages([]);
    setMembers([]);
    setApiError(null);
  };

  const getSpaceTitle = (space: GoogleChatSpace) => {
    if (space.displayName) return space.displayName;
    if (space.spaceType === 'DIRECT_MESSAGE') return 'Mensaje directo';
    if (space.spaceType === 'GROUP_CHAT') return 'Chat grupal';
    return space.name.replace('spaces/', 'Espacio ');
  };

  const executeConfirmedAction = async () => {
    if (!pendingAction || !accessToken) return;
    setIsExecutingAction(true);
    setApiError(null);

    try {
      if (pendingAction.type === 'send_message') {
        await sendChatMessage(accessToken, pendingAction.spaceName, pendingAction.text);
        setComposerText('');
        if (selectedSpace) {
          await fetchSpaceDetails(accessToken, selectedSpace);
        }
        notify('Mensaje enviado a Google Chat.');
      } else if (pendingAction.type === 'create_space') {
        const created = await createChatSpace(accessToken, pendingAction.displayName);
        setNewSpaceName('');
        setShowCreateSpace(false);
        await fetchSpaces(accessToken);
        setSelectedSpace(created);
        notify(`Espacio "${created.displayName || pendingAction.displayName}" creado.`);
      } else if (pendingAction.type === 'delete_message') {
        await deleteChatMessage(accessToken, pendingAction.messageName);
        if (selectedSpace) {
          await fetchSpaceDetails(accessToken, selectedSpace);
        }
        notify('Mensaje eliminado de Google Chat.');
      } else if (pendingAction.type === 'add_reaction') {
        await addMessageReaction(accessToken, pendingAction.messageName, pendingAction.emoji);
        if (selectedSpace) {
          await fetchSpaceDetails(accessToken, selectedSpace);
        }
        notify(`Reacción ${pendingAction.emoji} agregada.`);
      }
      setPendingAction(null);
    } catch (err) {
      setPendingAction(null);
      handleApiError(err);
    } finally {
      setIsExecutingAction(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] text-[10px] font-extrabold uppercase tracking-wide">
              Google Workspace
            </span>
            {connectedEmail && accessToken && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{connectedEmail}</span>
              </span>
            )}
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-white">
            Google Chat · Espacios de Estudio
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Consulta tus espacios, lee mensajes con compañeros o tutores y envía mensajes con confirmación previa.
          </p>
        </div>

        {accessToken && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => fetchSpaces(accessToken)}
              disabled={loadingSpaces}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSpaces ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              onClick={handleDisconnectChat}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Desconectar sesión de Google Chat"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desconectar</span>
            </button>
          </div>
        )}
      </div>

      {/* Prerequisite Info Notice */}
      <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#F6C62B] shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <div className="font-semibold text-white">Requisitos de Google Chat API</div>
            <p className="text-slate-300">
              Requiere una cuenta <strong>Google Workspace Business o Enterprise</strong> (las cuentas personales @gmail.com no están soportadas) y tener configurada la app de Chat en Google Cloud Console.
            </p>
          </div>
        </div>
        <a
          href={CHAT_CONSOLE_CONFIG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#F6C62B] border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center"
        >
          <span>Configurar Chat App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-4 text-xs text-rose-200 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <div className="font-bold text-rose-300">No se pudo completar la solicitud en Google Chat</div>
                <p className="leading-relaxed">{apiError.message}</p>
                {apiError.isAppNotConfigured && (
                  <p className="text-amber-300 font-medium">
                    Paso pendiente: Abre la página de Configuración de Google Chat API en Google Cloud Console, completa el nombre de la app, avatar y descripción, guarda y vuelve a intentar.
                  </p>
                )}
                {apiError.isConsumerAccountError && (
                  <p className="text-amber-300 font-medium">
                    Asegúrate de iniciar sesión con una cuenta de Google Workspace con Google Chat habilitado (no @gmail.com).
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-rose-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {(apiError.isAppNotConfigured || apiError.isConsumerAccountError) && (
            <div className="pl-6">
              <a
                href={CHAT_CONSOLE_CONFIG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F6C62B] text-slate-950 font-bold text-xs"
              >
                <span>Abrir configuración de Google Chat API en Cloud Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Unauthenticated / Token Missing View */}
      {needsAuth || !accessToken ? (
        <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-8 sm:p-10 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2249] border border-[#F6C62B]/40 text-[#F6C62B] flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-editorial text-2xl text-white">Conecta tu cuenta de Google Workspace</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Inicia sesión con tu cuenta de Google Workspace para ver tus espacios, miembros y mensajes de Google Chat directamente desde tu portal de ProLnk.
            </p>
          </div>

          <div className="flex justify-center pt-1">
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
          </div>
        </div>
      ) : (
        /* Connected Workspace Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[540px]">
          {/* Left Spaces Sidebar */}
          <div className="lg:col-span-4 bg-[#0c162e] border border-slate-700/80 rounded-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3.5 bg-[#080f21] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Espacios ({spaces.length})
              </span>
              <button
                type="button"
                onClick={() => setShowCreateSpace(prev => !prev)}
                className="px-2.5 py-1 rounded-lg bg-[#F6C62B] text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-[#ffd744]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo espacio</span>
              </button>
            </div>

            {showCreateSpace && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newSpaceName.trim()) return;
                  setPendingAction({
                    type: 'create_space',
                    displayName: newSpaceName.trim()
                  });
                }}
                className="p-3 bg-[#080f21] border-b border-slate-800 space-y-2"
              >
                <input
                  type="text"
                  required
                  value={newSpaceName}
                  onChange={e => setNewSpaceName(e.target.value)}
                  placeholder="Ej. Grupo Cálculo II"
                  className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateSpace(false)}
                    className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-md bg-[#F6C62B] text-slate-950 text-[11px] font-bold cursor-pointer"
                  >
                    Crear
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingSpaces ? (
                <div className="p-6 text-center text-xs text-slate-400">Cargando espacios...</div>
              ) : spaces.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No se encontraron espacios disponibles. Crea uno nuevo o verifica tu cuenta Workspace.
                </div>
              ) : (
                spaces.map(space => {
                  const active = selectedSpace?.name === space.name;
                  return (
                    <button
                      key={space.name}
                      type="button"
                      onClick={() => setSelectedSpace(space)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#0F2249] text-white border border-[#F6C62B]/40'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <Hash className="w-4 h-4 text-[#F6C62B] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{getSpaceTitle(space)}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {space.spaceType || space.type || 'SPACE'}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Conversation Area */}
          <div className="lg:col-span-8 bg-[#0c162e] border border-slate-700/80 rounded-2xl flex flex-col overflow-hidden">
            {selectedSpace ? (
              <>
                {/* Space Header */}
                <div className="px-5 py-3.5 bg-[#080f21] border-b border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-sans text-sm font-semibold text-white truncate">
                      {getSpaceTitle(selectedSpace)}
                    </h3>
                    <div className="text-[11px] text-slate-400 truncate">
                      {selectedSpace.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowMembers(prev => !prev)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        showMembers
                          ? 'bg-[#F6C62B] text-slate-950 border-[#F6C62B]'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Miembros ({members.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchSpaceDetails(accessToken, selectedSpace)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                      title="Recargar mensajes"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Members Drawer if toggled */}
                {showMembers && (
                  <div className="px-5 py-3 bg-[#080f21]/80 border-b border-slate-800 flex flex-wrap gap-2">
                    {members.length === 0 ? (
                      <span className="text-xs text-slate-400">No hay lista de miembros disponible.</span>
                    ) : (
                      members.map(m => (
                        <span
                          key={m.name}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-200"
                        >
                          <UserCircle2 className="w-3.5 h-3.5 text-[#F6C62B]" />
                          <span>{m.member?.displayName || m.member?.name || 'Miembro'}</span>
                        </span>
                      ))
                    )}
                  </div>
                )}

                {/* Messages Feed */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3 max-h-[420px]">
                  {loadingMessages ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Cargando mensajes del espacio...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Aún no hay mensajes en este espacio. Envía el primero abajo.
                    </div>
                  ) : (
                    messages.map(msg => {
                      const timeLabel = msg.createTime
                        ? new Date(msg.createTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '';
                      const previewText = (msg.text || msg.formattedText || '').slice(0, 80);

                      return (
                        <div
                          key={msg.name}
                          className="bg-[#122144] border border-slate-700/70 rounded-xl p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-white">
                                {msg.sender?.displayName || msg.sender?.name || 'Usuario'}
                              </span>
                              {timeLabel && (
                                <span className="text-[10px] text-slate-400 font-mono-nums">
                                  {timeLabel}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {['👍', '✅'].map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() =>
                                    setPendingAction({
                                      type: 'add_reaction',
                                      messageName: msg.name,
                                      emoji,
                                      preview: previewText
                                    })
                                  }
                                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] cursor-pointer"
                                  title={`Reaccionar con ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingAction({
                                    type: 'delete_message',
                                    messageName: msg.name,
                                    preview: previewText
                                  })
                                }
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                                title="Eliminar mensaje"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                            {msg.text || msg.formattedText || '(Mensaje sin texto)'}
                          </p>

                          {msg.emojiReactionSummaries && msg.emojiReactionSummaries.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.emojiReactionSummaries.map((r, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-200"
                                >
                                  <span>{r.emoji?.unicode || '👍'}</span>
                                  <span className="font-mono-nums text-[10px]">
                                    {r.reactionCount || 1}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Compose Form (requires confirmation dialog before sending) */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!composerText.trim() || !selectedSpace) return;
                    setPendingAction({
                      type: 'send_message',
                      spaceName: selectedSpace.name,
                      spaceDisplay: getSpaceTitle(selectedSpace),
                      text: composerText.trim()
                    });
                  }}
                  className="p-3.5 bg-[#080f21] border-t border-slate-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={composerText}
                    onChange={e => setComposerText(e.target.value)}
                    placeholder={`Enviar mensaje a ${getSpaceTitle(selectedSpace)}...`}
                    className="flex-1 bg-[#122144] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                  />
                  <button
                    type="submit"
                    disabled={!composerText.trim()}
                    className="px-4 py-2.5 bg-[#F6C62B] hover:bg-[#ffd744] disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>Enviar</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
                Selecciona un espacio de la izquierda para ver mensajes y participar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANDATORY User Confirmation Modal for All Mutating/Destructive Google Chat Actions */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0a1329] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#F6C62B] shrink-0" />
                <h4 className="text-base font-bold text-white">
                  {pendingAction.type === 'delete_message'
                    ? '¿Eliminar mensaje en Google Chat?'
                    : pendingAction.type === 'create_space'
                    ? '¿Crear espacio en Google Chat?'
                    : pendingAction.type === 'add_reaction'
                    ? '¿Agregar reacción en Google Chat?'
                    : '¿Enviar mensaje a Google Chat?'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              {pendingAction.type === 'send_message' && (
                <>
                  <p>
                    Se publicará este mensaje en el espacio{' '}
                    <strong className="text-white">{pendingAction.spaceDisplay}</strong> en tu nombre:
                  </p>
                  <div className="p-3 rounded-xl bg-[#080f21] border border-slate-800 text-slate-200 italic">
                    “{pendingAction.text}”
                  </div>
                </>
              )}
              {pendingAction.type === 'create_space' && (
                <p>
                  Se creará un nuevo espacio en Google Chat llamado{' '}
                  <strong className="text-white">“{pendingAction.displayName}”</strong> en tu cuenta.
                </p>
              )}
              {pendingAction.type === 'delete_message' && (
                <>
                  <p>Esta acción eliminará permanentemente el siguiente mensaje de Google Chat:</p>
                  <div className="p-3 rounded-xl bg-[#080f21] border border-slate-800 text-slate-200 italic">
                    “{pendingAction.preview || '(Mensaje)'}”
                  </div>
                </>
              )}
              {pendingAction.type === 'add_reaction' && (
                <p>
                  Se agregará la reacción <strong className="text-white">{pendingAction.emoji}</strong> al mensaje “{pendingAction.preview}”.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={isExecutingAction}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                disabled={isExecutingAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  pendingAction.type === 'delete_message'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950'
                }`}
              >
                {isExecutingAction
                  ? 'Procesando...'
                  : pendingAction.type === 'delete_message'
                  ? 'Eliminar'
                  : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
