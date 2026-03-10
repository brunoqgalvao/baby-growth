import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { authenticateUser, createSession, SESSION_COOKIE } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = form.get('email') as string;
		const password = form.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', email });
		}

		try {
			const user = await authenticateUser(email, password);
			const token = createSession(user.id);
			cookies.set(SESSION_COOKIE, token, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60
			});
		} catch (e) {
			return fail(401, { error: (e as Error).message, email });
		}

		redirect(303, '/dashboard');
	}
};
