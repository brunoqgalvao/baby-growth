import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE = 'session';

// Simple token-based sessions stored in memory (for production, use DB or Redis)
const sessions = new Map<string, { userId: string; expiresAt: Date }>();

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

export function createSession(userId: string): string {
	const token = uuidv4();
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
	sessions.set(token, { userId, expiresAt });
	return token;
}

export function validateSession(token: string): string | null {
	const session = sessions.get(token);
	if (!session) return null;
	if (session.expiresAt < new Date()) {
		sessions.delete(token);
		return null;
	}
	return session.userId;
}

export function deleteSession(token: string) {
	sessions.delete(token);
}

export { SESSION_COOKIE };
