import OpenAI from 'openai';
import { createHash } from 'node:crypto';
import { getUser } from '@netlify/identity';
import type { Config, Context } from '@netlify/functions';
import { eq, and, desc, sql, lt } from 'drizzle-orm';
import { getDatabase } from '../../db/index.js';
import { chatMessages, aiRateLimits, profiles } from '../../db/schema.js';
import { checkOrigin } from '../lib/security.js';

export default async (request: Request, context: Context) => {
  if (!['GET', 'POST'].includes(request.method)) return new Response(null, { status: 405 });
  const originError = checkOrigin(request);
  if (originError) return originError;
  const identityUser = await getUser();
  const user = identityUser?.confirmedAt ? identityUser : null;
  try {
    const db = getDatabase();
    if (request.method === 'GET') {
      if (!user) return Response.json({ error: 'Please log in to view your chat history.' }, { status: 401 });
      const surface = new URL(request.url).searchParams.get('surface');
      if (!['hero', 'dashboard'].includes(surface || '')) return Response.json({ error: 'Invalid chat.' }, { status: 400 });
      const rows = await db.select().from(chatMessages).where(and(eq(chatMessages.userId, user.id), eq(chatMessages.surface, surface!))).orderBy(desc(chatMessages.createdAt), desc(chatMessages.id)).limit(100);
      return Response.json(rows.reverse().map(row => ({ id: row.id, sender: row.role === 'user' ? 'user' : 'ai', text: row.content })), { headers: { 'Cache-Control': 'no-store' } });
    }
    if (Number(request.headers.get('content-length') || 0) > 60000) return Response.json({ error: 'The message is too long.' }, { status: 413 });
    const body = await request.text();
    if (body.length > 60000) return Response.json({ error: 'The message is too long.' }, { status: 413 });
    let input;
    try { input = JSON.parse(body); }
    catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
    if (!input || typeof input.question !== 'string' || !input.question.trim() || input.question.length > 6000 || !['hero', 'dashboard'].includes(input.surface)) return Response.json({ error: 'Please enter a question with no more than 6,000 characters.' }, { status: 400 });
    const bucket = Math.floor(Date.now() / 3600000);
    const actor = user?.id || createHash('sha256').update(context.ip || 'anonymous').digest('hex');
    const rateId = `${user ? 'user' : 'guest'}:${actor}:${bucket}`;
    await db.delete(aiRateLimits).where(lt(aiRateLimits.expiresAt, new Date()));
    const [rate] = await db.insert(aiRateLimits).values({ id: rateId, expiresAt: new Date((bucket + 1) * 3600000) }).onConflictDoUpdate({ target: aiRateLimits.id, set: { count: sql`${aiRateLimits.count} + 1` } }).returning();
    if (rate.count > (user ? 60 : 10)) return Response.json({ error: 'You have reached the hourly question limit. Please try again later.' }, { status: 429 });
    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    let preference = 'detailed';
    if (user) {
      const rows = await db.select().from(chatMessages).where(and(eq(chatMessages.userId, user.id), eq(chatMessages.surface, input.surface))).orderBy(desc(chatMessages.createdAt), desc(chatMessages.id)).limit(12);
      history = rows.reverse().map(row => ({ role: row.role, content: row.content }));
      const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
      preference = profile?.details.aiExplanationStyle || 'detailed';
    } else if (Array.isArray(input.history)) {
      history = input.history.slice(-12).filter((message: { role?: unknown; content?: unknown }) => ['user', 'assistant'].includes(String(message?.role)) && typeof message?.content === 'string' && message.content.length <= 6000).map((message: { role: 'user' | 'assistant'; content: string }) => ({ role: message.role, content: message.content }));
    }
    const client = new OpenAI({ timeout: 40000, maxRetries: 0 });
    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      max_tokens: 1200,
      messages: [
        { role: 'system', content: `You are ProLnk, an academic tutor. Always respond in English, even when the student writes in another language. Use the conversation history for follow-up questions and solve the specific problem with clear steps and a verification. ${preference === 'quick' ? 'Give a brief explanation.' : 'Explain the steps clearly and include examples when helpful.'} If information is missing, ask for clarification in English. Do not invent sources, citations, chapters, or certainty levels. Include a Source: line only when you know a real, relevant reference. Do not claim access to external books or databases.` },
        ...history,
        { role: 'user', content: input.question.trim() },
      ],
    });
    const reply = completion.choices[0]?.message.content?.trim();
    if (!reply) throw new Error('empty');
    if (user) {
      await db.insert(chatMessages).values([
        { userId: user.id, surface: input.surface, role: 'user', content: input.question.trim(), createdAt: new Date() },
        { userId: user.id, surface: input.surface, role: 'assistant', content: reply, createdAt: new Date(Date.now() + 1) },
      ]);
    }
    return Response.json({ reply }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'The assistant could not respond. Please try again in a few moments.' }, { status: 503 });
  }
};

export const config: Config = { path: '/api/ai/ask' };
