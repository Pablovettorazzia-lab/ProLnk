const CLASSROOM_API_BASE = 'https://classroom.googleapis.com/v1';

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  courseState?: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink?: string;
  enrollmentCode?: string;
  updateTime?: string;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  text: string;
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  creatorUserId?: string;
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
  };
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  topicId?: string;
}

export interface ClassroomCourseWorkMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  topicId?: string;
}

export interface ClassroomTopic {
  courseId: string;
  topicId: string;
  name: string;
  updateTime?: string;
}

export interface ClassroomStudentSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId?: string;
  state?: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  assignedGrade?: number;
  draftGrade?: number;
  late?: boolean;
  alternateLink?: string;
}

export interface ClassroomProfile {
  id: string;
  name?: {
    fullName?: string;
  };
  emailAddress?: string;
  photoUrl?: string;
}

export interface ClassroomRosterMember {
  courseId: string;
  userId: string;
  profile?: ClassroomProfile;
}

export class GoogleClassroomApiError extends Error {
  status: number;
  isAuthError: boolean;
  isPermissionError: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GoogleClassroomApiError';
    this.status = status;
    this.isAuthError = status === 401;
    this.isPermissionError = status === 403;
  }
}

async function classroomFetch<T>(
  path: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${CLASSROOM_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!res.ok) {
    let errorMessage = `Google Classroom API error (${res.status})`;
    try {
      const errData = await res.json();
      if (errData?.error?.message) {
        errorMessage = errData.error.message;
      }
    } catch {
      // ignore JSON parse failure
    }
    throw new GoogleClassroomApiError(errorMessage, res.status);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function listCourses(accessToken: string): Promise<ClassroomCourse[]> {
  const data = await classroomFetch<{ courses?: ClassroomCourse[] }>(
    '/courses?pageSize=50',
    accessToken
  );
  return data.courses || [];
}

export async function createCourse(
  accessToken: string,
  payload: {
    name: string;
    section?: string;
    room?: string;
    descriptionHeading?: string;
  }
): Promise<ClassroomCourse> {
  return classroomFetch<ClassroomCourse>('/courses', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name.trim(),
      section: payload.section?.trim() || undefined,
      room: payload.room?.trim() || undefined,
      descriptionHeading: payload.descriptionHeading?.trim() || undefined,
      ownerId: 'me'
    })
  });
}

export async function listCourseAnnouncements(
  accessToken: string,
  courseId: string
): Promise<ClassroomAnnouncement[]> {
  const data = await classroomFetch<{ announcements?: ClassroomAnnouncement[] }>(
    `/courses/${encodeURIComponent(courseId)}/announcements?pageSize=20`,
    accessToken
  );
  return data.announcements || [];
}

export async function postAnnouncement(
  accessToken: string,
  courseId: string,
  text: string
): Promise<ClassroomAnnouncement> {
  return classroomFetch<ClassroomAnnouncement>(
    `/courses/${encodeURIComponent(courseId)}/announcements`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        text: text.trim(),
        state: 'PUBLISHED'
      })
    }
  );
}

export async function deleteAnnouncement(
  accessToken: string,
  courseId: string,
  announcementId: string
): Promise<void> {
  await classroomFetch<Record<string, never>>(
    `/courses/${encodeURIComponent(courseId)}/announcements/${encodeURIComponent(announcementId)}`,
    accessToken,
    { method: 'DELETE' }
  );
}

export async function listCourseWork(
  accessToken: string,
  courseId: string
): Promise<ClassroomCourseWork[]> {
  const data = await classroomFetch<{ courseWork?: ClassroomCourseWork[] }>(
    `/courses/${encodeURIComponent(courseId)}/courseWork?pageSize=30`,
    accessToken
  );
  return data.courseWork || [];
}

export async function createCourseWork(
  accessToken: string,
  courseId: string,
  payload: {
    title: string;
    description?: string;
    maxPoints?: number;
    topicId?: string;
  }
): Promise<ClassroomCourseWork> {
  return classroomFetch<ClassroomCourseWork>(
    `/courses/${encodeURIComponent(courseId)}/courseWork`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title.trim(),
        description: payload.description?.trim() || undefined,
        maxPoints: payload.maxPoints ?? 100,
        topicId: payload.topicId || undefined,
        workType: 'ASSIGNMENT',
        state: 'PUBLISHED'
      })
    }
  );
}

export async function deleteCourseWork(
  accessToken: string,
  courseId: string,
  courseWorkId: string
): Promise<void> {
  await classroomFetch<Record<string, never>>(
    `/courses/${encodeURIComponent(courseId)}/courseWork/${encodeURIComponent(courseWorkId)}`,
    accessToken,
    { method: 'DELETE' }
  );
}

export async function listCourseWorkMaterials(
  accessToken: string,
  courseId: string
): Promise<ClassroomCourseWorkMaterial[]> {
  const data = await classroomFetch<{ courseWorkMaterial?: ClassroomCourseWorkMaterial[] }>(
    `/courses/${encodeURIComponent(courseId)}/courseWorkMaterials?pageSize=30`,
    accessToken
  );
  return data.courseWorkMaterial || [];
}

export async function listCourseTopics(
  accessToken: string,
  courseId: string
): Promise<ClassroomTopic[]> {
  const data = await classroomFetch<{ topic?: ClassroomTopic[] }>(
    `/courses/${encodeURIComponent(courseId)}/topics?pageSize=30`,
    accessToken
  );
  return data.topic || [];
}

export async function createTopic(
  accessToken: string,
  courseId: string,
  name: string
): Promise<ClassroomTopic> {
  return classroomFetch<ClassroomTopic>(
    `/courses/${encodeURIComponent(courseId)}/topics`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() })
    }
  );
}

export async function listMySubmissions(
  accessToken: string,
  courseId: string
): Promise<ClassroomStudentSubmission[]> {
  const data = await classroomFetch<{ studentSubmissions?: ClassroomStudentSubmission[] }>(
    `/courses/${encodeURIComponent(courseId)}/courseWork/-/studentSubmissions?userId=me&pageSize=30`,
    accessToken
  );
  return data.studentSubmissions || [];
}

export async function turnInSubmission(
  accessToken: string,
  courseId: string,
  courseWorkId: string,
  submissionId: string
): Promise<void> {
  await classroomFetch<Record<string, never>>(
    `/courses/${encodeURIComponent(courseId)}/courseWork/${encodeURIComponent(courseWorkId)}/studentSubmissions/${encodeURIComponent(submissionId)}:turnIn`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({})
    }
  );
}

export async function reclaimSubmission(
  accessToken: string,
  courseId: string,
  courseWorkId: string,
  submissionId: string
): Promise<void> {
  await classroomFetch<Record<string, never>>(
    `/courses/${encodeURIComponent(courseId)}/courseWork/${encodeURIComponent(courseWorkId)}/studentSubmissions/${encodeURIComponent(submissionId)}:reclaim`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({})
    }
  );
}

export async function listCourseRoster(
  accessToken: string,
  courseId: string
): Promise<{
  teachers: ClassroomRosterMember[];
  students: ClassroomRosterMember[];
}> {
  const [teachersRes, studentsRes] = await Promise.all([
    classroomFetch<{ teachers?: ClassroomRosterMember[] }>(
      `/courses/${encodeURIComponent(courseId)}/teachers?pageSize=30`,
      accessToken
    ).catch(() => ({ teachers: [] })),
    classroomFetch<{ students?: ClassroomRosterMember[] }>(
      `/courses/${encodeURIComponent(courseId)}/students?pageSize=50`,
      accessToken
    ).catch(() => ({ students: [] }))
  ]);

  return {
    teachers: teachersRes.teachers || [],
    students: studentsRes.students || []
  };
}
