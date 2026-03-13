import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getInvite, redeemInvite } from '$lib/server/access';

export const load: PageServerLoad = async ({ params, locals }) => {
	const token = params.token;
	const invite = await getInvite(token);

	if (!invite) {
		// Invalid or expired — just go to dashboard or login
		if (locals.userId) redirect(303, '/dashboard');
		redirect(303, '/login');
	}

	// If logged in, redeem immediately
	if (locals.userId) {
		try {
			const result = await redeemInvite(token, locals.userId);
			redirect(303, `/child/${result.childId}?joined=1`);
		} catch (e) {
			const msg = (e as Error).message;
			if (msg.includes('already been used') || msg.includes('own invite')) {
				// Already used or self-invite — just go to the child page
				redirect(303, `/child/${invite.invite.childId}`);
			}
			redirect(303, '/dashboard');
		}
	}

	// Not logged in — show a landing page with signup/login links
	return {
		childName: invite.childName,
		inviterName: invite.inviterName || invite.inviterEmail || 'Someone',
		token
	};
};
