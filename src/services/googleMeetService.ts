import firebaseConfig from '../../firebase-applet-config.json';

const MEET_API_BASE = 'https://meet.googleapis.com/v2';

export const MEET_CONSOLE_CONFIG_URL = `https://console.cloud.google.com/apis/api/meet.googleapis.com/overview?project=${firebaseConfig.projectId}`;

export type MeetAccessType = 'ACCESS_TYPE_UNSPECIFIED' | 'OPEN' | 'TRUSTED' | 'RESTRICTED';
export type MeetEntryPointAccess = 'ENTRY_POINT_ACCESS_UNSPECIFIED' | 'ALL' | 'CREATOR_APP_ONLY';

export interface MeetSpaceConfig {
  accessType?: MeetAccessType;
  entryPointAccess?: MeetEntryPointAccess;
}

export interface MeetSpace {
  name: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: MeetSpaceConfig;
  activeConference?: {
    conferenceRecord?: string;
  };
}

export interface MeetConferenceRecord {
  name: string;
  startTime?: string;
  endTime?: string;
  expireTime?: string;
  space?: string;
}

export interface MeetParticipant {
  name: string;
  earliestStartTime?: string;
  latestEndTime?: string;
  signedinUser?: {
    user?: string;
    displayName?: string;
  };
  anonymousUser?: {
    displayName?: string;
  };
  phoneUser?: {
    displayName?: string;
  };
}

export interface MeetRecording {
  name: string;
  state?: 'STATE_UNSPECIFIED' | 'STARTED' | 'ENDED' | 'FILE_GENERATED';
  startTime?: string;
  endTime?: string;
  driveDestination?: {
    file?: string;
    exportUri?: string;
  };
}

export class GoogleMeetApiError extends Error {
  status: number;
  isAuthError: boolean;
  isPermissionError: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GoogleMeetApiError';
    this.status = status;
    this.isAuthError = status === 401;
    this.isPermissionError = status === 403;
  }
}

async function meetFetch<T>(path: string, accessToken: string, options?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${MEET_API_BASE}${normalizedPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!res.ok) {
    let errorMessage = `Google Meet API error (${res.status})`;
    try {
      const errData = await res.json();
      if (errData?.error?.message) {
        errorMessage = errData.error.message;
      }
    } catch {
      // keep default error message
    }
    throw new GoogleMeetApiError(errorMessage, res.status);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export function normalizeMeetIdentifier(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const urlMatch = trimmed.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i);
  if (urlMatch?.[1]) {
    return `spaces/${urlMatch[1].toLowerCase()}`;
  }
  if (trimmed.startsWith('spaces/')) {
    return trimmed;
  }
  return `spaces/${trimmed}`;
}

export interface ParsedMeetLink {
  meetingCode: string;
  meetingUri: string;
  spaceName: string;
}

export function extractMeetLinkInfo(input: string): ParsedMeetLink | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlCodeMatch = trimmed.match(/(?:https?:\/\/)?meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})(?:[/?#].*)?$/i);
  if (urlCodeMatch?.[1]) {
    const code = urlCodeMatch[1].toLowerCase();
    return {
      meetingCode: code,
      meetingUri: `https://meet.google.com/${code}`,
      spaceName: `spaces/${code}`
    };
  }

  const rawCodeMatch = trimmed.match(/^(?:spaces\/)?([a-z]{3}-[a-z]{4}-[a-z]{3})$/i);
  if (rawCodeMatch?.[1]) {
    const code = rawCodeMatch[1].toLowerCase();
    return {
      meetingCode: code,
      meetingUri: `https://meet.google.com/${code}`,
      spaceName: `spaces/${code}`
    };
  }

  // Fallback for custom Google Meet vanity / nickname links
  if (/^https:\/\/meet\.google\.com\/[a-z0-9_-]{3,}$/i.test(trimmed)) {
    const slug = trimmed.replace(/^https:\/\/meet\.google\.com\//i, '').split(/[/?#]/)[0];
    return {
      meetingCode: slug,
      meetingUri: `https://meet.google.com/${slug}`,
      spaceName: `spaces/${slug}`
    };
  }

  return null;
}

export async function createMeetSpace(
  accessToken: string,
  config?: MeetSpaceConfig
): Promise<MeetSpace> {
  const body: { config?: MeetSpaceConfig } = {};
  if (config && (config.accessType || config.entryPointAccess)) {
    body.config = config;
  }
  return meetFetch<MeetSpace>('/spaces', accessToken, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function getMeetSpace(accessToken: string, spaceNameOrCode: string): Promise<MeetSpace> {
  const normalized = normalizeMeetIdentifier(spaceNameOrCode);
  return meetFetch<MeetSpace>(`/${normalized}`, accessToken);
}

export async function updateMeetSpaceConfig(
  accessToken: string,
  spaceName: string,
  config: MeetSpaceConfig
): Promise<MeetSpace> {
  const maskFields: string[] = [];
  if (config.accessType) maskFields.push('config.accessType');
  if (config.entryPointAccess) maskFields.push('config.entryPointAccess');
  const updateMask = maskFields.join(',') || 'config.accessType,config.entryPointAccess';

  return meetFetch<MeetSpace>(
    `/${spaceName}?updateMask=${encodeURIComponent(updateMask)}`,
    accessToken,
    {
      method: 'PATCH',
      body: JSON.stringify({
        name: spaceName,
        config
      })
    }
  );
}

export async function endActiveConference(accessToken: string, spaceName: string): Promise<void> {
  await meetFetch<Record<string, never>>(`/${spaceName}:endActiveConference`, accessToken, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export async function listConferenceRecords(
  accessToken: string,
  pageSize = 15
): Promise<MeetConferenceRecord[]> {
  const data = await meetFetch<{ conferenceRecords?: MeetConferenceRecord[] }>(
    `/conferenceRecords?pageSize=${pageSize}`,
    accessToken
  );
  return data.conferenceRecords || [];
}

export async function listConferenceParticipants(
  accessToken: string,
  conferenceRecordName: string
): Promise<MeetParticipant[]> {
  const data = await meetFetch<{ participants?: MeetParticipant[] }>(
    `/${conferenceRecordName}/participants?pageSize=25`,
    accessToken
  );
  return data.participants || [];
}

export async function listConferenceRecordings(
  accessToken: string,
  conferenceRecordName: string
): Promise<MeetRecording[]> {
  const data = await meetFetch<{ recordings?: MeetRecording[] }>(
    `/${conferenceRecordName}/recordings?pageSize=10`,
    accessToken
  );
  return data.recordings || [];
}
