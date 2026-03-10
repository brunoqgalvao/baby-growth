import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { children, measurements } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.userId) redirect(303, '/login');

	const userChildren = await db
		.select()
		.from(children)
		.where(eq(children.userId, locals.userId))
		.orderBy(children.name);

	// Get latest measurement for each child
	const childrenWithLatest = await Promise.all(
		userChildren.map(async (child) => {
			const [latest] = await db
				.select()
				.from(measurements)
				.where(eq(measurements.childId, child.id))
				.orderBy(desc(measurements.date))
				.limit(1);
			return { ...child, latestMeasurement: latest ?? null };
		})
	);

	return { children: childrenWithLatest };
};

export const actions: Actions = {
	addChild: async ({ request, locals }) => {
		if (!locals.userId) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const name = form.get('name') as string;
		const sex = form.get('sex') as string;
		const dateOfBirth = form.get('dateOfBirth') as string;

		if (!name || !sex || !dateOfBirth) {
			return fail(400, { error: 'Name, sex, and date of birth are required' });
		}

		const [child] = await db
			.insert(children)
			.values({ userId: locals.userId, name, sex: sex as 'boy' | 'girl', dateOfBirth })
			.returning();

		// If birth measurements provided, add them
		const weightKg = parseFloat(form.get('birthWeight') as string);
		const heightCm = parseFloat(form.get('birthHeight') as string);
		const headCircCm = parseFloat(form.get('birthHeadCirc') as string);

		if (weightKg || heightCm || headCircCm) {
			await db.insert(measurements).values({
				childId: child.id,
				date: dateOfBirth,
				weightKg: weightKg || null,
				heightCm: heightCm || null,
				headCircCm: headCircCm || null
			});
		}

		return { success: true };
	},

	deleteChild: async ({ request, locals }) => {
		if (!locals.userId) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const childId = form.get('childId') as string;

		// Verify ownership
		const [child] = await db
			.select()
			.from(children)
			.where(eq(children.id, childId))
			.limit(1);

		if (!child || child.userId !== locals.userId) {
			return fail(404, { error: 'Child not found' });
		}

		await db.delete(children).where(eq(children.id, childId));
		return { success: true };
	}
};
