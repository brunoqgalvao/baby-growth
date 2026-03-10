import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createUser, createSession, SESSION_COOKIE } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = form.get('email') as string;
		const password = form.get('password') as string;
		const name = form.get('name') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', email, name });
		}
		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters', email, name });
		}

		try {
			const user = await createUser(email, password, name || undefined);
			const token = createSession(user.id);
			cookies.set(SESSION_COOKIE, token, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60
			});
		} catch (e) {
			return fail(400, { error: (e as Error).message, email, name });
		}

		redirect(303, '/dashboard');
	}
};
