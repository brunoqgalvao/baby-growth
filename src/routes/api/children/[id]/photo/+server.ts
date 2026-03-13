import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { children } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.userId) error(401, 'Unauthorized');

	const [child] = await db
		.select()
		.from(children)
		.where(and(eq(children.id, params.id), eq(children.userId, locals.userId)))
		.limit(1);

	if (!child) error(404, 'Child not found');

	const formData = await request.formData();
	const file = formData.get('photo') as File | null;

	if (!file || !(file instanceof File)) {
		error(400, 'No photo provided');
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		error(400, 'Invalid file type. Use JPEG, PNG, WebP, or GIF');
	}

	if (file.size > MAX_SIZE) {
		error(400, 'Photo must be under 5MB');
	}

	const buffer = await file.arrayBuffer();
	const base64 = Buffer.from(buffer).toString('base64');
	const dataUri = `data:${file.type};base64,${base64}`;

	await db
		.update(children)
		.set({ photoUrl: dataUri })
		.where(eq(children.id, params.id));

	return json({ success: true, photoUrl: dataUri });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.userId) error(401, 'Unauthorized');

	const [child] = await db
		.select()
		.from(children)
		.where(and(eq(children.id, params.id), eq(children.userId, locals.userId)))
		.limit(1);

	if (!child) error(404, 'Child not found');

	await db
		.update(children)
		.set({ photoUrl: null })
		.where(eq(children.id, params.id));

	return json({ success: true });
};
