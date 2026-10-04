import { pgTable, text, timestamp, jsonb, integer, uuid, index, primaryKey } from 'drizzle-orm/pg-core';
import type { DashboardSession, ForumPost } from '../src/types/index.js';

export interface ProfileDetails {
  name: string;
  photoURL?: string;
  bio?: string;
  university?: string;
  major?: string;
  semester?: string;
  targetSubjects?: string[];
  learningGoal?: string;
  emailNotifications?: boolean;
  sessionReminders?: boolean;
  aiExplanationStyle?: 'detailed' | 'quick';
}

export const profiles = pgTable('profiles', {
  id: text().primaryKey(),
  details: jsonb().$type<ProfileDetails>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text().primaryKey(),
  userId: text('user_id').notNull(),
  details: jsonb().$type<DashboardSession>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const forumPosts = pgTable('forum_posts', {
  id: text().primaryKey(),
  userId: text('user_id').notNull(),
  details: jsonb().$type<ForumPost>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const forumVotes = pgTable('forum_votes', {
  postId: text('post_id').notNull().references(() => forumPosts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
}, table => [primaryKey({ columns: [table.postId, table.userId] })]);

export const chatMessages = pgTable('chat_messages', {
  id: uuid().defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  surface: text().notNull(),
  role: text().$type<'user' | 'assistant'>().notNull(),
  content: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [index('chat_user_surface_idx').on(table.userId, table.surface, table.createdAt)]);

export const aiRateLimits = pgTable('ai_rate_limits', {
  id: text().primaryKey(),
  count: integer().default(1).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
