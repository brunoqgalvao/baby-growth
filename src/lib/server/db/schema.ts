import { pgTable, text, timestamp, uuid, real, integer, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const children = pgTable('children', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	name: text('name').notNull(),
	sex: text('sex', { enum: ['boy', 'girl'] }).notNull(),
	dateOfBirth: date('date_of_birth').notNull(),
	photoUrl: text('photo_url'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const measurements = pgTable('measurements', {
	id: uuid('id').primaryKey().defaultRandom(),
	childId: uuid('child_id')
		.references(() => children.id, { onDelete: 'cascade' })
		.notNull(),
	date: date('date').notNull(),
	weightKg: real('weight_kg'),
	heightCm: real('height_cm'),
	headCircCm: real('head_circ_cm'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
	token: text('token').primaryKey(),
	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	expiresAt: timestamp('expires_at').notNull()
});

export const invites = pgTable('invites', {
	id: uuid('id').primaryKey().defaultRandom(),
	code: text('code').notNull().unique(),
	childId: uuid('child_id')
		.references(() => children.id, { onDelete: 'cascade' }),
	inviterId: uuid('inviter_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	acceptedById: uuid('accepted_by_id')
		.references(() => users.id, { onDelete: 'set null' }),
	expiresAt: timestamp('expires_at').notNull(),
	acceptedAt: timestamp('accepted_at'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const childAccess = pgTable('child_access', {
	id: uuid('id').primaryKey().defaultRandom(),
	childId: uuid('child_id')
		.references(() => children.id, { onDelete: 'cascade' })
		.notNull(),
	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	grantedBy: uuid('granted_by')
		.references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export type User = typeof users.$inferSelect;
export type Child = typeof children.$inferSelect;
export type Measurement = typeof measurements.$inferSelect;
export type NewMeasurement = typeof measurements.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Invite = typeof invites.$inferSelect;
export type ChildAccess = typeof childAccess.$inferSelect;
