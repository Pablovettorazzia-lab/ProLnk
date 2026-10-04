import { getUser } from '@netlify/identity';
import type { Config } from '@netlify/functions';
import { eq, and, desc } from 'drizzle-orm';
import { getDatabase } from '../../db/index.js';
import { sessions, forumPosts, forumVotes } from '../../db/schema.js';
import { checkOrigin } from '../lib/security.js';

export default async (request: Request) => {
  const resource = new URL(request.url).searchParams.get('resource');
  if (!['sessions', 'posts'].includes(resource || '')) return Response.json({ error: 'Invalid resource.' }, { status: 400 });
  const user = await getUser();
  if (!(request.method === 'GET' && resource === 'posts') && (!user || !user.confirmedAt)) return Response.json({ error: 'Please log in to save this data.' }, { status: 401 });
  const originError = checkOrigin(request);
  if (originError) return originError;
  try {
    const db = getDatabase();
    if (request.method === 'GET') {
      const records = resource === 'sessions'
        ? await db.select().from(sessions).where(eq(sessions.userId, user!.id)).orderBy(desc(sessions.createdAt))
        : await db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt)).limit(100);
      const votes = resource === 'posts' && user ? await db.select().from(forumVotes).where(eq(forumVotes.userId, user.id)) : [];
      return Response.json(records.map(record => resource === 'posts' ? { ...record.details, userVoted: votes.some(vote => vote.postId === record.id) } : record.details), { headers: { 'Cache-Control': 'no-store' } });
    }
    const input = await request.json();
    if (!input || typeof input !== 'object' || JSON.stringify(input).length > 16000) return Response.json({ error: 'Invalid data.' }, { status: 400 });
    if (request.method === 'POST') {
      if (typeof input.id !== 'string' || input.id.length > 120) return Response.json({ error: 'Invalid identifier.' }, { status: 400 });
      if (resource === 'sessions') {
        if (typeof input.topic !== 'string' || typeof input.date !== 'string' || !['completed', 'upcoming'].includes(input.status)) return Response.json({ error: 'Invalid session.' }, { status: 400 });
        await db.insert(sessions).values({ id: `${user!.id}:${input.id}`, userId: user!.id, details: input });
      } else {
        if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 500 || typeof input.category !== 'string') return Response.json({ error: 'Invalid question.' }, { status: 400 });
        await db.insert(forumPosts).values({ id: input.id, userId: user!.id, details: { ...input, votes: 0, userVoted: false } });
      }
      return Response.json({ saved: true }, { status: 201 });
    }
    if (request.method === 'PATCH' && resource === 'posts') {
      if (typeof input.postId !== 'string') return Response.json({ error: 'Invalid vote.' }, { status: 400 });
      const result = await db.transaction(async transaction => {
        const [post] = await transaction.select().from(forumPosts).where(eq(forumPosts.id, input.postId)).for('update');
        if (!post) return null;
        const voteFilter = and(eq(forumVotes.postId, post.id), eq(forumVotes.userId, user!.id));
        const [existing] = await transaction.select().from(forumVotes).where(voteFilter);
        if (existing) await transaction.delete(forumVotes).where(voteFilter);
        else await transaction.insert(forumVotes).values({ postId: post.id, userId: user!.id });
        const votes = Math.max(0, post.details.votes + (existing ? -1 : 1));
        await transaction.update(forumPosts).set({ details: { ...post.details, votes } }).where(eq(forumPosts.id, post.id));
        return { votes, userVoted: !existing };
      });
      if (!result) return Response.json({ error: 'Votes cannot be saved for this example post.' }, { status: 404 });
      return Response.json(result);
    }
    return new Response(null, { status: 405 });
  } catch {
    return Response.json({ error: 'The data could not be saved or loaded.' }, { status: 503 });
  }
};

export const config: Config = { path: '/api/data' };
