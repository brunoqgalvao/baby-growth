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

export type User = typeof users.$inferSelect;
export type Child = typeof children.$inferSelect;
export type Measurement = typeof measurements.$inferSelect;
export type NewMeasurement = typeof measurements.$inferInsert;
