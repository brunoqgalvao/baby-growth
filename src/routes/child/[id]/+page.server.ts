import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { children, measurements } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { hasChildAccess, createInvite } from '$lib/server/access';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.userId) redirect(303, '/login');

	const child = await hasChildAccess(locals.userId, params.id);
	if (!child) error(404, 'Child not found');

	const allMeasurements = await db
		.select()
		.from(measurements)
		.where(eq(measurements.childId, child.id))
		.orderBy(asc(measurements.date));

	return { child, measurements: allMeasurements };
};

export const actions: Actions = {
	addMeasurement: async ({ request, params, locals }) => {
		if (!locals.userId) return fail(401, { error: 'Unauthorized' });

		const child = await hasChildAccess(locals.userId, params.id);
		if (!child) return fail(404, { error: 'Child not found' });

		const form = await request.formData();
		const date = form.get('date') as string;
		const weightKg = parseFloat(form.get('weightKg') as string) || null;
		const heightCm = parseFloat(form.get('heightCm') as string) || null;
		const headCircCm = parseFloat(form.get('headCircCm') as string) || null;

		if (!date) return fail(400, { error: 'Date is required' });
		if (weightKg !== null && (weightKg < 1 || weightKg > 99)) {
			return fail(400, { error: 'Weight must be between 1 and 99 kg' });
		}
		if (!weightKg && !heightCm && !headCircCm) {
			return fail(400, { error: 'At least one measurement is required' });
		}

		await db.insert(measurements).values({
			childId: child.id,
			date,
			weightKg,
			heightCm,
			headCircCm
		});

		return { success: true };
	},

	updateMeasurement: async ({ request, params, locals }) => {
		if (!locals.userId) return fail(401, { error: 'Unauthorized' });

		const child = await hasChildAccess(locals.userId, params.id);
		if (!child) return fail(404, { error: 'Child not found' });

		const form = await request.formData();
		const measurementId = form.get('measurementId') as string;
		const date = form.get('date') as string;
		const weightKg = parseFloat(form.get('weightKg') as string) || null;
		const heightCm = parseFloat(form.get('heightCm') as string) || null;
		const headCircCm = parseFloat(form.get('headCircCm') as string) || null;

		if (!date) return fail(400, { error: 'Date is required' });
		if (weightKg !== null && (weightKg < 1 || weightKg > 99)) {
			return fail(400, { error: 'Weight must be between 1 and 99 kg' });
		}
		if (!weightKg && !heightCm && !headCircCm) {
			return fail(400, { error: 'At least one measurement is required' });
		}

		await db.update(measurements).set({
			date,
			weightKg,
			heightCm,
			headCircCm
		}).where(
			and(eq(measurements.id, measurementId), eq(measurements.childId, child.id))
		);

		return { success: true };
	},

	deleteMeasurement: async ({ request, params, locals }) => {
		if (!locals.userId) return fail(401, { error: 'Unauthorized' });

		const child = await hasChildAccess(locals.userId, params.id);
		if (!child) return fail(404, { error: 'Child not found' });

		const form = await request.formData();
		const measurementId = form.get('measurementId') as string;

		await db.delete(measurements).where(
			and(eq(measurements.id, measurementId), eq(measurements.childId, child.id))
		);

		return { success: true };
	},

	createInvite: async ({ params, locals }) => {
		if (!locals.userId) return fail(401, { error: 'Unauthorized' });

		try {
			const invite = await createInvite(locals.userId, params.id);
			return { inviteToken: invite.code };
		} catch (e) {
			console.error('createInvite failed:', e);
			return fail(500, { error: 'Failed to create invite link' });
		}
	}
};
