import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/db/schema';
import { eq, lt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE = 'session';

export async function createUser(email: string, password: string, name?: string) {
	const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
	if (existing.length > 0) {
		throw new Error('Email already registered');
	}

	const passwordHash = await bcrypt.hash(password, 12);
	const [user] = await db
		.insert(users)
		.values({ email, passwordHash, name })
		.returning({ id: users.id, email: users.email, name: users.name });

	return user;
}

export async function authenticateUser(email: string, password: string) {
	const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
	if (!user) {
		throw new Error('Invalid email or password');
	}

	const valid = await bcrypt.compare(password, user.passwordHash);
	if (!valid) {
		throw new Error('Invalid email or password');
	}

	return { id: user.id, email: user.email, name: user.name };
}

export async function createSession(userId: string): Promise<string> {
	const token = uuidv4();
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
	await db.insert(sessions).values({ token, userId, expiresAt });
	return token;
}

export async function validateSession(token: string): Promise<string | null> {
	const [session] = await db
		.select()
		.from(sessions)
		.where(eq(sessions.token, token))
		.limit(1);

	if (!session) return null;

	if (session.expiresAt < new Date()) {
		await db.delete(sessions).where(eq(sessions.token, token));
		return null;
	}

	return session.userId;
}

export async function deleteSession(token: string) {
	await db.delete(sessions).where(eq(sessions.token, token));
}

export async function cleanExpiredSessions() {
	await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

export { SESSION_COOKIE };
