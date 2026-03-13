import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { authenticateUser, createSession, SESSION_COOKIE } from '$lib/server/auth';
import { redeemInvite } from '$lib/server/access';

export const load: PageServerLoad = async ({ url }) => {
	const invite = url.searchParams.get('invite') || '';
	return { invite };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = form.get('email') as string;
		const password = form.get('password') as string;
		const inviteToken = (form.get('inviteToken') as string)?.trim();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', email });
		}

		let userId: string;
		try {
			const user = await authenticateUser(email, password);
			userId = user.id;
			const token = await createSession(user.id);
			cookies.set(SESSION_COOKIE, token, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60
			});
		} catch (e) {
			return fail(401, { error: (e as Error).message, email });
		}

		// Auto-redeem invite token if provided
		if (inviteToken) {
			try {
				const result = await redeemInvite(inviteToken, userId);
				redirect(303, `/child/${result.childId}?joined=1`);
			} catch {
				redirect(303, '/dashboard');
			}
		}

		redirect(303, '/dashboard');
	}
};
