import { getUser } from '@netlify/identity';
import type { Config } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { getDatabase } from '../../db/index.js';
import { profiles, type ProfileDetails } from '../../db/schema.js';
import { checkOrigin } from '../lib/security.js';

export default async (request: Request) => {
  const user = await getUser();
  if (!user || !user.confirmedAt) return Response.json({ error: 'Please log in to access your profile.' }, { status: 401 });
  if (!['GET', 'PUT'].includes(request.method)) return new Response(null, { status: 405 });
  const originError = checkOrigin(request);
  if (originError) return originError;
  try {
    const db = getDatabase();
    await db.insert(profiles).values({ id: user.id, details: { name: user.name || user.email?.split('@')[0] || 'Student', photoURL: user.pictureUrl } }).onConflictDoNothing();
    let [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
    if (request.method === 'PUT') {
      const input = await request.json();
      if (!input || typeof input !== 'object') return Response.json({ error: 'Invalid profile.' }, { status: 400 });
      const details: ProfileDetails = { ...profile.details };
      for (const field of ['name', 'bio', 'university', 'major', 'semester', 'learningGoal', 'photoURL'] as const) {
        if (input[field] !== undefined) {
          if (typeof input[field] !== 'string' || input[field].length > (field === 'bio' || field === 'learningGoal' ? 2000 : 500)) return Response.json({ error: 'One of the profile fields is invalid.' }, { status: 400 });
          details[field] = input[field].trim();
        }
      }
      if (!details.name) return Response.json({ error: 'Name is required.' }, { status: 400 });
      if (details.photoURL && !/^https:\/\//i.test(details.photoURL)) return Response.json({ error: 'Please use an HTTPS URL for your photo.' }, { status: 400 });
      if (input.targetSubjects !== undefined) {
        if (!Array.isArray(input.targetSubjects) || input.targetSubjects.length > 30 || input.targetSubjects.some((subject: unknown) => typeof subject !== 'string' || subject.length > 100)) return Response.json({ error: 'The subject list is invalid.' }, { status: 400 });
        details.targetSubjects = input.targetSubjects.map((subject: string) => subject.trim()).filter(Boolean);
      }
      for (const field of ['emailNotifications', 'sessionReminders'] as const) {
        if (input[field] !== undefined) {
          if (typeof input[field] !== 'boolean') return Response.json({ error: 'Invalid preference.' }, { status: 400 });
          details[field] = input[field];
        }
      }
      if (input.aiExplanationStyle !== undefined) {
        if (!['quick', 'detailed'].includes(input.aiExplanationStyle)) return Response.json({ error: 'Invalid preference.' }, { status: 400 });
        details.aiExplanationStyle = input.aiExplanationStyle;
      }
      [profile] = await db.update(profiles).set({ details, updatedAt: new Date() }).where(eq(profiles.id, user.id)).returning();
    }
    const daysLeft = Math.max(0, 3 - Math.floor((Date.now() - profile.createdAt.getTime()) / 86400000));
    return Response.json({ ...profile.details, uid: user.id, email: user.email, plan: '3-Day Free Trial', daysLeft, streakDays: 0, xpPoints: 0 }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Your profile could not be loaded or saved. Please try again.' }, { status: 503 });
  }
};

export const config: Config = { path: '/api/account' };
