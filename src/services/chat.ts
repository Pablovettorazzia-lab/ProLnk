import { apiRequest } from './api';

export interface UiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  source?: string;
  expertId?: string;
}

export const getChatHistory = (surface: 'hero' | 'dashboard') => apiRequest<UiChatMessage[]>(`/api/ai/ask?surface=${surface}`);

export function parseAiReply(reply: string) {
  const source = reply.split('\n').find(line => /^source:/i.test(line));
  return {
    text: reply.split('\n').filter(line => !/^source:/i.test(line)).join('\n').trim(),
    source: source?.replace(/^source:\s*/i, '').trim(),
  };
}

export async function askAi(question: string, history: UiChatMessage[], surface: 'hero' | 'dashboard') {
  return apiRequest<{ reply: string }>('/api/ai/ask', {
    method: 'POST',
    body: JSON.stringify({ question, surface, history: history.filter(message => !message.id.startsWith('error-')).slice(-12).map(message => ({ role: message.sender === 'user' ? 'user' : 'assistant', content: message.text })) }),
  });
}
