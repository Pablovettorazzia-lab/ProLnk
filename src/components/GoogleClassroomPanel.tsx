import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  RefreshCw,
  Plus,
  Users,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  X,
  BookOpen,
  ClipboardList,
  Megaphone,
  FolderOpen,
  Send,
  LogOut,
  Tag,
  Calendar,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  initGoogleWorkspaceAuth,
  googleWorkspaceSignIn,
  getWorkspaceAccessToken,
  clearWorkspaceAccessToken
} from '../firebase/authService';
import {
  ClassroomCourse,
  ClassroomAnnouncement,
  ClassroomCourseWork,
  ClassroomCourseWorkMaterial,
  ClassroomTopic,
  ClassroomStudentSubmission,
  ClassroomRosterMember,
  GoogleClassroomApiError,
  listCourses,
  createCourse,
  listCourseAnnouncements,
  postAnnouncement,
  deleteAnnouncement,
  listCourseWork,
  createCourseWork,
  deleteCourseWork,
  listCourseWorkMaterials,
  listCourseTopics,
  createTopic,
  listMySubmissions,
  turnInSubmission,
  reclaimSubmission,
  listCourseRoster
} from '../services/googleClassroomService';

interface GoogleClassroomPanelProps {
  onNotify?: (msg: string) => void;
}

type CourseSubTab = 'stream' | 'coursework' | 'materials' | 'people';

type PendingAction =
  | {
      type: 'create_course';
      name: string;
      section?: string;
      room?: string;
    }
  | {
      type: 'post_announcement';
      courseId: string;
      courseName: string;
      text: string;
    }
  | {
      type: 'delete_announcement';
      courseId: string;
      announcementId: string;
      preview: string;
    }
  | {
      type: 'create_coursework';
      courseId: string;
      courseName: string;
      title: string;
      description?: string;
      maxPoints?: number;
      topicId?: string;
    }
  | {
      type: 'delete_coursework';
      courseId: string;
      courseWorkId: string;
      title: string;
    }
  | {
      type: 'create_topic';
      courseId: string;
      courseName: string;
      name: string;
    }
  | {
      type: 'turn_in_submission';
      courseId: string;
      courseWorkId: string;
      submissionId: string;
      title: string;
    }
  | {
      type: 'reclaim_submission';
      courseId: string;
      courseWorkId: string;
      submissionId: string;
      title: string;
    };

export const GoogleClassroomPanel: React.FC<GoogleClassroomPanelProps> = ({ onNotify }) => {
  const [needsAuth, setNeedsAuth] = useState<boolean>(() => !getWorkspaceAccessToken());
  const [accessToken, setAccessToken] = useState<string | null>(() => getWorkspaceAccessToken());
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  const [courseSubTab, setCourseSubTab] = useState<CourseSubTab>('stream');

  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [courseWork, setCourseWork] = useState<ClassroomCourseWork[]>([]);
  const [materials, setMaterials] = useState<ClassroomCourseWorkMaterial[]>([]);
  const [topics, setTopics] = useState<ClassroomTopic[]>([]);
  const [submissions, setSubmissions] = useState<ClassroomStudentSubmission[]>([]);
  const [teachers, setTeachers] = useState<ClassroomRosterMember[]>([]);
  const [students, setStudents] = useState<ClassroomRosterMember[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Forms
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSection, setNewCourseSection] = useState('');
  const [newCourseRoom, setNewCourseRoom] = useState('');

  const [announcementText, setAnnouncementText] = useState('');

  const [showCreateCourseWork, setShowCreateCourseWork] = useState(false);
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDescription, setNewWorkDescription] = useState('');
  const [newWorkPoints, setNewWorkPoints] = useState('100');
  const [newWorkTopicId, setNewWorkTopicId] = useState('');

  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const notify = useCallback(
    (msg: string) => {
      onNotify?.(msg);
    },
    [onNotify]
  );

  const handleApiError = useCallback((err: unknown) => {
    if (err instanceof GoogleClassroomApiError) {
      if (err.isAuthError) {
        clearWorkspaceAccessToken();
        setAccessToken(null);
        setNeedsAuth(true);
      }
      setApiError(err.message);
    } else if (err instanceof Error) {
      setApiError(err.message);
    } else {
      setApiError('Ocurrió un error al comunicarse con Google Classroom.');
    }
  }, []);

  const fetchCourses = useCallback(
    async (token: string) => {
      setLoadingCourses(true);
      setApiError(null);
      try {
        const list = await listCourses(token);
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourse(prev => (prev && list.some(c => c.id === prev.id) ? prev : list[0]));
        } else {
          setSelectedCourse(null);
        }
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoadingCourses(false);
      }
    },
    [handleApiError]
  );

  const fetchCourseDetails = useCallback(
    async (token: string, course: ClassroomCourse) => {
      setLoadingDetails(true);
      setApiError(null);
      try {
        const [ann, work, mats, tps, subs, roster] = await Promise.all([
          listCourseAnnouncements(token, course.id).catch(() => []),
          listCourseWork(token, course.id).catch(() => []),
          listCourseWorkMaterials(token, course.id).catch(() => []),
          listCourseTopics(token, course.id).catch(() => []),
          listMySubmissions(token, course.id).catch(() => []),
          listCourseRoster(token, course.id).catch(() => ({ teachers: [], students: [] }))
        ]);
        setAnnouncements(ann);
        setCourseWork(work);
        setMaterials(mats);
        setTopics(tps);
        setSubmissions(subs);
        setTeachers(roster.teachers);
        setStudents(roster.students);
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoadingDetails(false);
      }
    },
    [handleApiError]
  );

  useEffect(() => {
    const unsubscribe = initGoogleWorkspaceAuth(
      (firebaseUser, token) => {
        setAccessToken(token);
        setConnectedEmail(firebaseUser.email);
        setNeedsAuth(false);
      },
      () => {
        if (!getWorkspaceAccessToken()) {
          setAccessToken(null);
          setNeedsAuth(true);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchCourses(accessToken);
    }
  }, [accessToken, fetchCourses]);

  useEffect(() => {
    if (accessToken && selectedCourse) {
      fetchCourseDetails(accessToken, selectedCourse);
    }
  }, [accessToken, selectedCourse, fetchCourseDetails]);

  const handleGoogleLogin = async () => {
    setIsConnecting(true);
    setApiError(null);
    try {
      const { user, accessToken: token } = await googleWorkspaceSignIn();
      setAccessToken(token);
      setConnectedEmail(user.email);
      setNeedsAuth(false);
      notify('Conectado con Google Classroom.');
    } catch (err: any) {
      setApiError(err?.message || 'No se pudo completar el inicio de sesión con Google.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearWorkspaceAccessToken();
    setAccessToken(null);
    setNeedsAuth(true);
    setCourses([]);
    setSelectedCourse(null);
    setAnnouncements([]);
    setCourseWork([]);
    setMaterials([]);
    setTopics([]);
    setSubmissions([]);
    setTeachers([]);
    setStudents([]);
    setApiError(null);
  };

  const executeConfirmedAction = async () => {
    if (!pendingAction || !accessToken) return;
    setIsExecutingAction(true);
    setApiError(null);

    try {
      if (pendingAction.type === 'create_course') {
        const created = await createCourse(accessToken, {
          name: pendingAction.name,
          section: pendingAction.section,
          room: pendingAction.room
        });
        setNewCourseName('');
        setNewCourseSection('');
        setNewCourseRoom('');
        setShowCreateCourse(false);
        await fetchCourses(accessToken);
        setSelectedCourse(created);
        notify(`Clase "${created.name}" creada en Google Classroom.`);
      } else if (pendingAction.type === 'post_announcement') {
        await postAnnouncement(accessToken, pendingAction.courseId, pendingAction.text);
        setAnnouncementText('');
        if (selectedCourse) {
          await fetchCourseDetails(accessToken, selectedCourse);
        }
        notify('Anuncio publicado en Google Classroom.');
      } else if (pendingAction.type === 'delete_announcement') {
        await deleteAnnouncement(
          accessToken,
          pendingAction.courseId,
          pendingAction.announcementId
        );
        if (selectedCourse) {
          await fetchCourseDetails(accessToken, selectedCourse);
        }
        notify('Anuncio eliminado de Google Classroom.');
      } else if (pendingAction.type === 'create_coursework') {
        await createCourseWork(accessToken, pendingAction.courseId, {
          title: pendingAction.title,
          description: pendingAction.description,
          maxPoints: pendingAction.maxPoints,
          topicId: pendingAction.topicId
        });
        setNewWorkTitle('');
        setNewWorkDescription('');
        setNewWorkPoints('100');
        setNewWorkTopicId('');
        setShowCreateCourseWork(false);
        if (selectedCourse) {
          await fetchCourseDetails(accessToken, selectedCourse);
        }
        notify(`Tarea "${pendingAction.title}" creada.`);
      } else if (pendingAction.type === 'delete_coursework') {
        await deleteCourseWork(
          accessToken,
          pendingAction.courseId,
          pendingAction.courseWorkId
        );
        if (selectedCourse) {
          await fetchCourseDetails(accessToken, selectedCourse);
        }
        notify('Tarea eliminada de Google Classroom.');
      } else if (pendingAction.type === 'create_topic') {
        await createTopic(accessToken, pendingAction.courseId, pendingAction.name);
        setNewTopicName('');
        setShowCreateTopic(false);
        if (selectedCourse) {
          await fetchCourseDetails(accessToken, selectedCourse);
        }
        notify(`Tema "${pendingAction.name}" creado.`);
      } else if (pendingAction.type === 'turn_in_submission') {
        await turnInSubmission(
          accessToken,
          pendingAction.courseId,
          pendingAction.courseWorkId,
          pendingAction.submissionId
        );
        if (selectedCourse) {
          await fetchCourseDetails(accessToken, selectedCourse);
        }
        notify(`Tarea "${pendingAction.title}" entregada.`);
      } else if (pendingAction.type === 'reclaim_submission') {
        await reclaimSubmission(
          accessToken,
          pendingAction.courseId,
          pendingAction.courseWorkId,
          pendingAction.submissionId
        );
        if (selectedCourse) {
          await fetchCourseDetails(accessToken, selectedCourse);
        }
        notify(`Entrega de "${pendingAction.title}" anulada.`);
      }
      setPendingAction(null);
    } catch (err) {
      setPendingAction(null);
      handleApiError(err);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const formatDueDate = (work: ClassroomCourseWork) => {
    if (!work.dueDate) return null;
    const { year, month, day } = work.dueDate;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getSubmissionForWork = (courseWorkId: string) =>
    submissions.find(s => s.courseWorkId === courseWorkId);

  const getSubmissionLabel = (state?: ClassroomStudentSubmission['state']) => {
    switch (state) {
      case 'TURNED_IN':
        return { text: 'Entregada', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'RETURNED':
        return { text: 'Calificada', cls: 'bg-sky-500/20 text-sky-400 border-sky-500/30' };
      case 'RECLAIMED_BY_STUDENT':
        return { text: 'Entrega anulada', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      default:
        return { text: 'Asignada', cls: 'bg-slate-800 text-slate-300 border-slate-700' };
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
          <h2 className="text-2xl font-bold text-white font-display">
            Google Classroom · Cursos y Tareas
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Consulta tus clases, anuncios, tareas, materiales, calificaciones y participantes con confirmación previa antes de realizar cambios.
          </p>
        </div>

        {accessToken && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => fetchCourses(accessToken)}
              disabled={loadingCourses}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCourses ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Desconectar sesión de Google Classroom"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desconectar</span>
            </button>
          </div>
        )}
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-4 text-xs text-rose-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-rose-300">No se pudo completar la solicitud en Google Classroom</div>
              <p className="leading-relaxed">{apiError}</p>
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
      )}

      {/* Unauthenticated / Token Missing View */}
      {needsAuth || !accessToken ? (
        <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-8 sm:p-10 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2249] border border-[#F6C62B]/40 text-[#F6C62B] flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">Conecta tu cuenta de Google Classroom</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Inicia sesión con tu cuenta de Google para ver tus cursos, anuncios, tareas pendientes, materiales y entregas directamente en tu portal de ProLnk.
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
        /* Connected Courses Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
          {/* Left Courses List */}
          <div className="lg:col-span-4 bg-[#0c162e] border border-slate-700/80 rounded-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3.5 bg-[#080f21] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Cursos ({courses.length})
              </span>
              <button
                type="button"
                onClick={() => setShowCreateCourse(prev => !prev)}
                className="px-2.5 py-1 rounded-lg bg-[#F6C62B] text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-[#ffd744]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva clase</span>
              </button>
            </div>

            {showCreateCourse && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newCourseName.trim()) return;
                  setPendingAction({
                    type: 'create_course',
                    name: newCourseName.trim(),
                    section: newCourseSection.trim() || undefined,
                    room: newCourseRoom.trim() || undefined
                  });
                }}
                className="p-3 bg-[#080f21] border-b border-slate-800 space-y-2"
              >
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  placeholder="Nombre de la clase (ej. Cálculo II)"
                  className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCourseSection}
                    onChange={e => setNewCourseSection(e.target.value)}
                    placeholder="Sección (opcional)"
                    className="w-full bg-[#122144] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                  />
                  <input
                    type="text"
                    value={newCourseRoom}
                    onChange={e => setNewCourseRoom(e.target.value)}
                    placeholder="Aula (opcional)"
                    className="w-full bg-[#122144] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateCourse(false)}
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

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {loadingCourses ? (
                <div className="p-6 text-center text-xs text-slate-400">Cargando cursos...</div>
              ) : courses.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No se encontraron cursos en esta cuenta de Google Classroom.
                </div>
              ) : (
                courses.map(course => {
                  const active = selectedCourse?.id === course.id;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#0F2249] text-white border border-[#F6C62B]/40'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-[#F6C62B] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{course.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {[course.section, course.room].filter(Boolean).join(' · ') ||
                            course.courseState ||
                            'ACTIVE'}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Course Workspace */}
          <div className="lg:col-span-8 bg-[#0c162e] border border-slate-700/80 rounded-2xl flex flex-col overflow-hidden">
            {selectedCourse ? (
              <>
                {/* Course Header & Subtabs */}
                <div className="px-5 py-4 bg-[#080f21] border-b border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white truncate">
                          {selectedCourse.name}
                        </h3>
                        {selectedCourse.courseState && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                            {selectedCourse.courseState}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        {selectedCourse.section && <span>Sección: {selectedCourse.section}</span>}
                        {selectedCourse.room && <span>Aula: {selectedCourse.room}</span>}
                        {selectedCourse.enrollmentCode && (
                          <span>Código: {selectedCourse.enrollmentCode}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {selectedCourse.alternateLink && (
                        <a
                          href={selectedCourse.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <span>Abrir</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => fetchCourseDetails(accessToken, selectedCourse)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                        title="Recargar curso"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingDetails ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Course Navigation Tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'stream', label: `Novedades (${announcements.length})`, icon: Megaphone },
                      { id: 'coursework', label: `Tareas (${courseWork.length})`, icon: ClipboardList },
                      { id: 'materials', label: `Materiales (${materials.length})`, icon: FolderOpen },
                      {
                        id: 'people',
                        label: `Personas (${teachers.length + students.length})`,
                        icon: Users
                      }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCourseSubTab(tab.id as CourseSubTab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          courseSubTab === tab.id
                            ? 'bg-[#F6C62B] text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Tab Body */}
                <div className="flex-1 p-5 overflow-y-auto max-h-[480px] space-y-4">
                  {loadingDetails ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Cargando contenido del curso...
                    </div>
                  ) : courseSubTab === 'stream' ? (
                    <>
                      {/* Post Announcement Form */}
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          if (!announcementText.trim()) return;
                          setPendingAction({
                            type: 'post_announcement',
                            courseId: selectedCourse.id,
                            courseName: selectedCourse.name,
                            text: announcementText.trim()
                          });
                        }}
                        className="bg-[#122144] border border-slate-700 rounded-xl p-3.5 space-y-2.5"
                      >
                        <textarea
                          rows={2}
                          value={announcementText}
                          onChange={e => setAnnouncementText(e.target.value)}
                          placeholder={`Publicar un anuncio en ${selectedCourse.name}...`}
                          className="w-full bg-[#080f21] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={!announcementText.trim()}
                            className="px-3.5 py-1.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] disabled:opacity-50 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Publicar anuncio</span>
                          </button>
                        </div>
                      </form>

                      {announcements.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">
                          No hay anuncios publicados en este curso todavía.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {announcements.map(ann => (
                            <div
                              key={ann.id}
                              className="bg-[#122144] border border-slate-700/80 rounded-xl p-4 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] text-slate-400">
                                  {ann.creationTime
                                    ? new Date(ann.creationTime).toLocaleString('es-ES', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                      })
                                    : 'Publicado'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {ann.alternateLink && (
                                    <a
                                      href={ann.alternateLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded text-slate-400 hover:text-white"
                                      title="Ver en Google Classroom"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPendingAction({
                                        type: 'delete_announcement',
                                        courseId: selectedCourse.id,
                                        announcementId: ann.id,
                                        preview: ann.text.slice(0, 90)
                                      })
                                    }
                                    className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                                    title="Eliminar anuncio"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                                {ann.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : courseSubTab === 'coursework' ? (
                    <>
                      {/* Topics & Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {topics.map(t => (
                            <span
                              key={t.topicId}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-200"
                            >
                              <Tag className="w-3 h-3 text-[#F6C62B]" />
                              <span>{t.name}</span>
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowCreateTopic(prev => !prev)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Nuevo tema</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateCourseWork(prev => !prev)}
                            className="px-3 py-1.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Nueva tarea</span>
                          </button>
                        </div>
                      </div>

                      {showCreateTopic && (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            if (!newTopicName.trim()) return;
                            setPendingAction({
                              type: 'create_topic',
                              courseId: selectedCourse.id,
                              courseName: selectedCourse.name,
                              name: newTopicName.trim()
                            });
                          }}
                          className="bg-[#122144] border border-slate-700 rounded-xl p-3 flex items-center gap-2"
                        >
                          <input
                            type="text"
                            required
                            value={newTopicName}
                            onChange={e => setNewTopicName(e.target.value)}
                            placeholder="Nombre del tema (ej. Unidad 3: Integrales)"
                            className="flex-1 bg-[#080f21] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCreateTopic(false)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-[#F6C62B] text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            Crear tema
                          </button>
                        </form>
                      )}

                      {showCreateCourseWork && (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            if (!newWorkTitle.trim()) return;
                            const parsedPoints = Number(newWorkPoints);
                            setPendingAction({
                              type: 'create_coursework',
                              courseId: selectedCourse.id,
                              courseName: selectedCourse.name,
                              title: newWorkTitle.trim(),
                              description: newWorkDescription.trim() || undefined,
                              maxPoints:
                                Number.isFinite(parsedPoints) && parsedPoints > 0
                                  ? parsedPoints
                                  : 100,
                              topicId: newWorkTopicId || undefined
                            });
                          }}
                          className="bg-[#122144] border border-slate-700 rounded-xl p-4 space-y-2.5"
                        >
                          <input
                            type="text"
                            required
                            value={newWorkTitle}
                            onChange={e => setNewWorkTitle(e.target.value)}
                            placeholder="Título de la tarea"
                            className="w-full bg-[#080f21] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                          />
                          <textarea
                            rows={2}
                            value={newWorkDescription}
                            onChange={e => setNewWorkDescription(e.target.value)}
                            placeholder="Instrucciones (opcional)"
                            className="w-full bg-[#080f21] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="number"
                              min={1}
                              max={1000}
                              value={newWorkPoints}
                              onChange={e => setNewWorkPoints(e.target.value)}
                              placeholder="Puntos (ej. 100)"
                              className="bg-[#080f21] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F6C62B]"
                            />
                            <select
                              value={newWorkTopicId}
                              onChange={e => setNewWorkTopicId(e.target.value)}
                              className="bg-[#080f21] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F6C62B]"
                            >
                              <option value="">Sin tema</option>
                              {topics.map(t => (
                                <option key={t.topicId} value={t.topicId}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowCreateCourseWork(false)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 rounded-lg bg-[#F6C62B] text-slate-950 text-xs font-bold cursor-pointer"
                            >
                              Publicar tarea
                            </button>
                          </div>
                        </form>
                      )}

                      {courseWork.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">
                          No hay tareas asignadas en este curso.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {courseWork.map(work => {
                            const sub = getSubmissionForWork(work.id);
                            const badge = getSubmissionLabel(sub?.state);
                            const due = formatDueDate(work);
                            const topicName = topics.find(t => t.topicId === work.topicId)?.name;

                            return (
                              <div
                                key={work.id}
                                className="bg-[#122144] border border-slate-700/80 rounded-xl p-4 space-y-2.5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-sm font-bold text-white">{work.title}</h4>
                                      {sub && (
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}
                                        >
                                          {badge.text}
                                        </span>
                                      )}
                                      {topicName && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                          {topicName}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                                      {due && (
                                        <span className="inline-flex items-center gap-1">
                                          <Calendar className="w-3 h-3 text-[#F6C62B]" />
                                          <span>Entrega: {due}</span>
                                        </span>
                                      )}
                                      {work.maxPoints !== undefined && (
                                        <span>{work.maxPoints} pts</span>
                                      )}
                                      {sub?.assignedGrade !== undefined && (
                                        <span className="text-emerald-400 font-bold">
                                          Nota: {sub.assignedGrade}/{work.maxPoints ?? 100}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {work.alternateLink && (
                                      <a
                                        href={work.alternateLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                                        title="Abrir tarea en Google Classroom"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingAction({
                                          type: 'delete_coursework',
                                          courseId: selectedCourse.id,
                                          courseWorkId: work.id,
                                          title: work.title
                                        })
                                      }
                                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                                      title="Eliminar tarea"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {work.description && (
                                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                                    {work.description}
                                  </p>
                                )}

                                {sub && (sub.state === 'CREATED' || sub.state === 'NEW' || sub.state === 'RECLAIMED_BY_STUDENT' || sub.state === 'TURNED_IN') && (
                                  <div className="pt-1 flex justify-end">
                                    {sub.state === 'TURNED_IN' ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPendingAction({
                                            type: 'reclaim_submission',
                                            courseId: selectedCourse.id,
                                            courseWorkId: work.id,
                                            submissionId: sub.id,
                                            title: work.title
                                          })
                                        }
                                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Anular entrega</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPendingAction({
                                            type: 'turn_in_submission',
                                            courseId: selectedCourse.id,
                                            courseWorkId: work.id,
                                            submissionId: sub.id,
                                            title: work.title
                                          })
                                        }
                                        className="px-3 py-1.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Marcar como entregada</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : courseSubTab === 'materials' ? (
                    materials.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-400">
                        No hay materiales publicados en este curso.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {materials.map(mat => (
                          <div
                            key={mat.id}
                            className="bg-[#122144] border border-slate-700/80 rounded-xl p-4 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-white">{mat.title}</h4>
                              {mat.description && (
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {mat.description}
                                </p>
                              )}
                            </div>
                            {mat.alternateLink && (
                              <a
                                href={mat.alternateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#F6C62B] border border-slate-700 text-xs font-semibold inline-flex items-center gap-1 shrink-0"
                              >
                                <span>Abrir</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    /* People (Teachers & Students) */
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Profesores ({teachers.length})
                        </h4>
                        {teachers.length === 0 ? (
                          <p className="text-xs text-slate-400">No hay profesores disponibles.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {teachers.map(t => (
                              <div
                                key={t.userId}
                                className="bg-[#122144] border border-slate-700/80 rounded-xl p-3 flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-[#0F2249] border border-[#F6C62B]/40 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                  {(t.profile?.name?.fullName || 'P')[0]}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white truncate">
                                    {t.profile?.name?.fullName || t.userId}
                                  </div>
                                  {t.profile?.emailAddress && (
                                    <div className="text-[11px] text-slate-400 truncate">
                                      {t.profile.emailAddress}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Estudiantes ({students.length})
                        </h4>
                        {students.length === 0 ? (
                          <p className="text-xs text-slate-400">No hay estudiantes visibles en esta clase.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {students.map(s => (
                              <div
                                key={s.userId}
                                className="bg-[#122144] border border-slate-700/80 rounded-xl p-3 flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                                  {(s.profile?.name?.fullName || 'E')[0]}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white truncate">
                                    {s.profile?.name?.fullName || s.userId}
                                  </div>
                                  {s.profile?.emailAddress && (
                                    <div className="text-[11px] text-slate-400 truncate">
                                      {s.profile.emailAddress}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
                Selecciona una clase de la izquierda para ver anuncios, tareas, materiales y participantes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANDATORY Confirmation Modal for All Mutating/Destructive Google Classroom Actions */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0a1329] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#F6C62B] shrink-0" />
                <h4 className="text-base font-bold text-white">
                  {pendingAction.type === 'delete_announcement' ||
                  pendingAction.type === 'delete_coursework'
                    ? '¿Eliminar elemento de Google Classroom?'
                    : pendingAction.type === 'create_course'
                    ? '¿Crear nueva clase en Google Classroom?'
                    : pendingAction.type === 'post_announcement'
                    ? '¿Publicar anuncio en Google Classroom?'
                    : pendingAction.type === 'create_coursework'
                    ? '¿Crear tarea en Google Classroom?'
                    : pendingAction.type === 'create_topic'
                    ? '¿Crear tema en Google Classroom?'
                    : pendingAction.type === 'turn_in_submission'
                    ? '¿Entregar tarea en Google Classroom?'
                    : '¿Anular entrega en Google Classroom?'}
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
              {pendingAction.type === 'create_course' && (
                <p>
                  Se creará la clase{' '}
                  <strong className="text-white">“{pendingAction.name}”</strong> en tu cuenta de Google Classroom.
                </p>
              )}
              {pendingAction.type === 'post_announcement' && (
                <>
                  <p>
                    Se publicará este anuncio en{' '}
                    <strong className="text-white">{pendingAction.courseName}</strong>:
                  </p>
                  <div className="p-3 rounded-xl bg-[#080f21] border border-slate-800 text-slate-200 italic">
                    “{pendingAction.text}”
                  </div>
                </>
              )}
              {pendingAction.type === 'delete_announcement' && (
                <>
                  <p>Esta acción eliminará permanentemente este anuncio de Google Classroom:</p>
                  <div className="p-3 rounded-xl bg-[#080f21] border border-slate-800 text-slate-200 italic">
                    “{pendingAction.preview}”
                  </div>
                </>
              )}
              {pendingAction.type === 'create_coursework' && (
                <p>
                  Se creará la tarea{' '}
                  <strong className="text-white">“{pendingAction.title}”</strong> en{' '}
                  <strong className="text-white">{pendingAction.courseName}</strong> ({pendingAction.maxPoints} pts).
                </p>
              )}
              {pendingAction.type === 'delete_coursework' && (
                <p>
                  Se eliminará permanentemente la tarea{' '}
                  <strong className="text-white">“{pendingAction.title}”</strong> de Google Classroom.
                </p>
              )}
              {pendingAction.type === 'create_topic' && (
                <p>
                  Se agregará el tema{' '}
                  <strong className="text-white">“{pendingAction.name}”</strong> a{' '}
                  <strong className="text-white">{pendingAction.courseName}</strong>.
                </p>
              )}
              {pendingAction.type === 'turn_in_submission' && (
                <p>
                  Se marcará como entregada tu tarea{' '}
                  <strong className="text-white">“{pendingAction.title}”</strong> en Google Classroom.
                </p>
              )}
              {pendingAction.type === 'reclaim_submission' && (
                <p>
                  Se anulará la entrega de tu tarea{' '}
                  <strong className="text-white">“{pendingAction.title}”</strong> para que puedas editarla.
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
                  pendingAction.type === 'delete_announcement' ||
                  pendingAction.type === 'delete_coursework'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950'
                }`}
              >
                {isExecutingAction
                  ? 'Procesando...'
                  : pendingAction.type === 'delete_announcement' ||
                    pendingAction.type === 'delete_coursework'
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
