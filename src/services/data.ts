import type { AuthUser } from '../App';
import type { ForumPost, DashboardSession } from '../types';
import { apiRequest } from './api';

export const getUserProfile = () => apiRequest<AuthUser>('/api/account');
export const saveUserProfile = (profile: Partial<AuthUser>) => apiRequest<AuthUser>('/api/account', { method: 'PUT', body: JSON.stringify(profile) });
export const getUserSessions = (_uid?: string) => apiRequest<DashboardSession[]>('/api/data?resource=sessions');
export const saveUserSession = (_uid: string, session: DashboardSession) => apiRequest('/api/data?resource=sessions', { method: 'POST', body: JSON.stringify(session) });
export const getForumPosts = () => apiRequest<ForumPost[]>('/api/data?resource=posts');
export const createForumPost = (post: ForumPost, _uid: string) => apiRequest('/api/data?resource=posts', { method: 'POST', body: JSON.stringify(post) });
export const updatePostVotes = (postId: string) => apiRequest<{ votes: number; userVoted: boolean }>('/api/data?resource=posts', { method: 'PATCH', body: JSON.stringify({ postId }) });
