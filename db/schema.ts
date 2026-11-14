import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const accounts = sqliteTable('study_accounts', {
 userId: text('user_id').primaryKey(),
 displayName: text('display_name').notNull(),
 createdAt: integer('created_at').notNull(),
 fullName: text('full_name').notNull().default(''),
 email: text('email').notNull().default(''),
 consentVersion: text('consent_version').notNull().default(''),
 consentAt: integer('consent_at'),
 lastSeenAt: integer('last_seen_at'),
});
export const progress = sqliteTable('study_progress', {
 userId: text('user_id').primaryKey().references(() => accounts.userId),
 state: text('state').notNull(),
 version: integer('version').notNull().default(1),
 updatedAt: integer('updated_at').notNull(),
});

export const events = sqliteTable('study_events', {
 id: text('id').primaryKey(),
 userId: text('user_id').notNull().references(() => accounts.userId),
 type: text('type').notNull(),
 questionId: integer('question_id'),
 occurredAt: integer('occurred_at').notNull(),
 receivedAt: integer('received_at').notNull(),
 path: text('path').notNull(),
 details: text('details').notNull(),
}, table => [index('events_user_time').on(table.userId,table.receivedAt),index('events_time').on(table.receivedAt),index('events_question').on(table.questionId)]);
