import type { Handle } from '@sveltejs/kit';
import { validateSession, SESSION_COOKIE } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const userId = await validateSession(token);
		if (userId) {
			event.locals.userId = userId;
		}
	}

	// Protect dashboard and child routes
	if (!event.locals.userId && event.url.pathname.startsWith('/dashboard')) {
		return new Response(null, { status: 302, headers: { location: '/login' } });
	}
	if (!event.locals.userId && event.url.pathname.startsWith('/child')) {
		return new Response(null, { status: 302, headers: { location: '/login' } });
	}

	return resolve(event);
};
