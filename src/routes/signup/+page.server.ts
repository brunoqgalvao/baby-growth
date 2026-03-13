import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createUser, createSession, SESSION_COOKIE } from '$lib/server/auth';
import { redeemInvite, getInvite } from '$lib/server/access';

export const load: PageServerLoad = async ({ url }) => {
	const invite = url.searchParams.get('invite') || '';
	let inviteInfo = null;

	if (invite) {
		const info = await getInvite(invite);
		if (info) {
			inviteInfo = {
				childName: info.childName,
				inviterName: info.inviterName || info.inviterEmail || 'Someone'
			};
		}
	}

	return { invite, inviteInfo };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = form.get('email') as string;
		const password = form.get('password') as string;
		const name = form.get('name') as string;
		const inviteToken = (form.get('inviteToken') as string)?.trim();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', email, name });
		}
		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters', email, name });
		}

		let userId: string;
		try {
			const user = await createUser(email, password, name || undefined);
			userId = user.id;
			const token = await createSession(user.id);
			cookies.set(SESSION_COOKIE, token, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60
			});
		} catch (e) {
			return fail(400, { error: (e as Error).message, email, name });
		}

		// Auto-redeem invite token if provided
		if (inviteToken) {
			try {
				const result = await redeemInvite(inviteToken, userId);
				redirect(303, `/child/${result.childId}?joined=1`);
			} catch {
				// Invite failed but account was created — just go to dashboard
				redirect(303, '/dashboard');
			}
		}

		redirect(303, '/dashboard');
	}
};
