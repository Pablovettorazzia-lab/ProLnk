import firebaseConfig from '../../firebase-applet-config.json';

const CHAT_API_BASE = 'https://chat.googleapis.com/v1';

export const CHAT_CONSOLE_CONFIG_URL = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${firebaseConfig.projectId}`;

export interface GoogleChatSpace {
  name: string;
  displayName?: string;
  type?: string;
  spaceType?: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE' | 'TYPE_UNSPECIFIED';
  singleUserBotDm?: boolean;
  spaceThreadingState?: string;
}

export interface GoogleChatEmojiReactionSummary {
  emoji?: {
    unicode?: string;
  };
  reactionCount?: number;
}

export interface GoogleChatMessage {
  name: string;
  sender?: {
    name?: string;
    displayName?: string;
    type?: 'HUMAN' | 'BOT' | 'TYPE_UNSPECIFIED';
  };
  createTime?: string;
  text?: string;
  formattedText?: string;
  thread?: {
    name?: string;
  };
  emojiReactionSummaries?: GoogleChatEmojiReactionSummary[];
}

export interface GoogleChatMembership {
  name: string;
  role?: string;
  state?: string;
  member?: {
    name?: string;
    displayName?: string;
    type?: 'HUMAN' | 'BOT';
  };
}

export class GoogleChatApiError extends Error {
  status: number;
  isAppNotConfigured: boolean;
  isAuthError: boolean;
  isConsumerAccountError: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GoogleChatApiError';
    this.status = status;
    const lower = message.toLowerCase();
    this.isAppNotConfigured =
      status === 404 &&
      (lower.includes('google chat app not found') ||
        lower.includes('configure the app') ||
        lower.includes('hangouts-chat'));
    this.isAuthError = status === 401;
    this.isConsumerAccountError =
      status === 403 ||
      lower.includes('workspace account') ||
      lower.includes('google chat is not enabled') ||
      lower.includes('consumer');
  }
}

async function chatFetch<T>(path: string, accessToken: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${CHAT_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!res.ok) {
    let errorMessage = `Google Chat API error (${res.status})`;
    try {
      const errData = await res.json();
      if (errData?.error?.message) {
        errorMessage = errData.error.message;
      }
    } catch {
      // ignore JSON parse failure
    }
    throw new GoogleChatApiError(errorMessage, res.status);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function listChatSpaces(accessToken: string): Promise<GoogleChatSpace[]> {
  const data = await chatFetch<{ spaces?: GoogleChatSpace[] }>(
    '/spaces?pageSize=50',
    accessToken
  );
  return data.spaces || [];
}

export async function createChatSpace(
  accessToken: string,
  displayName: string
): Promise<GoogleChatSpace> {
  return chatFetch<GoogleChatSpace>('/spaces', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      spaceType: 'SPACE',
      displayName: displayName.trim()
    })
  });
}

export async function listSpaceMessages(
  accessToken: string,
  spaceName: string
): Promise<GoogleChatMessage[]> {
  const data = await chatFetch<{ messages?: GoogleChatMessage[] }>(
    `/${spaceName}/messages?pageSize=30&orderBy=createTime%20desc`,
    accessToken
  );
  return (data.messages || []).slice().reverse();
}

export async function sendChatMessage(
  accessToken: string,
  spaceName: string,
  text: string
): Promise<GoogleChatMessage> {
  return chatFetch<GoogleChatMessage>(`/${spaceName}/messages`, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      text: text.trim()
    })
  });
}

export async function deleteChatMessage(
  accessToken: string,
  messageName: string
): Promise<void> {
  await chatFetch<Record<string, never>>(`/${messageName}`, accessToken, {
    method: 'DELETE'
  });
}

export async function addMessageReaction(
  accessToken: string,
  messageName: string,
  unicode: string
): Promise<void> {
  await chatFetch(`/${messageName}/reactions`, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      emoji: { unicode }
    })
  });
}

export async function listSpaceMembers(
  accessToken: string,
  spaceName: string
): Promise<GoogleChatMembership[]> {
  const data = await chatFetch<{ memberships?: GoogleChatMembership[] }>(
    `/${spaceName}/memberships?pageSize=50`,
    accessToken
  );
  return data.memberships || [];
}
