import { db } from '$lib/server/db';
import { children, childAccess, invites, users } from '$lib/server/db/schema';
import { eq, and, or, gt } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * Check if a user can access a child (owner OR shared via invite).
 */
export async function hasChildAccess(userId: string, childId: string) {
	const [child] = await db
		.select()
		.from(children)
		.where(and(eq(children.id, childId), eq(children.userId, userId)))
		.limit(1);

	if (child) return child;

	// Check shared access
	const [access] = await db
		.select({ child: children })
		.from(childAccess)
		.innerJoin(children, eq(children.id, childAccess.childId))
		.where(and(eq(childAccess.childId, childId), eq(childAccess.userId, userId)))
		.limit(1);

	return access?.child ?? null;
}

/**
 * Get all children a user can see: their own + shared ones.
 */
export async function getAccessibleChildren(userId: string) {
	const owned = await db
		.select()
		.from(children)
		.where(eq(children.userId, userId))
		.orderBy(children.name);

	const shared = await db
		.select({ child: children })
		.from(childAccess)
		.innerJoin(children, eq(children.id, childAccess.childId))
		.where(eq(childAccess.userId, userId))
		.orderBy(children.name);

	const sharedChildren = shared.map((r) => r.child);

	// Deduplicate (shouldn't happen, but just in case)
	const seenIds = new Set(owned.map((c) => c.id));
	const uniqueShared = sharedChildren.filter((c) => !seenIds.has(c.id));

	return { owned, shared: uniqueShared };
}

/**
 * Create an invite URL token for a specific child. Expires in 48 hours.
 */
export async function createInvite(inviterId: string, childId: string) {
	// Verify the inviter has access to this child
	const child = await hasChildAccess(inviterId, childId);
	if (!child) throw new Error('Child not found');

	const code = randomUUID();
	const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

	const [invite] = await db
		.insert(invites)
		.values({ code, childId, inviterId, expiresAt })
		.returning();

	return invite;
}

/**
 * Get invite details by token (without redeeming).
 */
export async function getInvite(token: string) {
	const [invite] = await db
		.select({
			invite: invites,
			childName: children.name,
			inviterName: users.name,
			inviterEmail: users.email
		})
		.from(invites)
		.innerJoin(children, eq(children.id, invites.childId))
		.innerJoin(users, eq(users.id, invites.inviterId))
		.where(
			and(
				eq(invites.code, token),
				gt(invites.expiresAt, new Date())
			)
		)
		.limit(1);

	return invite ?? null;
}

/**
 * Redeem an invite token. Grants the accepting user access to the specific child.
 */
export async function redeemInvite(token: string, acceptingUserId: string) {
	const [invite] = await db
		.select()
		.from(invites)
		.where(
			and(
				eq(invites.code, token),
				gt(invites.expiresAt, new Date())
			)
		)
		.limit(1);

	if (!invite) {
		throw new Error('Invalid or expired invite link');
	}

	if (invite.acceptedAt) {
		throw new Error('This invite has already been used');
	}

	if (invite.inviterId === acceptingUserId) {
		throw new Error("You can't accept your own invite, silly");
	}

	if (!invite.childId) {
		throw new Error('Invalid invite — no child associated');
	}

	// Mark invite as accepted
	await db
		.update(invites)
		.set({ acceptedById: acceptingUserId, acceptedAt: new Date() })
		.where(eq(invites.id, invite.id));

	// Grant access to the specific child (skip if already has access)
	const [existing] = await db
		.select()
		.from(childAccess)
		.where(and(eq(childAccess.childId, invite.childId), eq(childAccess.userId, acceptingUserId)))
		.limit(1);

	if (!existing) {
		await db.insert(childAccess).values({
			childId: invite.childId,
			userId: acceptingUserId,
			grantedBy: invite.inviterId
		});
	}

	// Get child name for redirect
	const [child] = await db
		.select({ name: children.name })
		.from(children)
		.where(eq(children.id, invite.childId))
		.limit(1);

	// Get the inviter's name for the success message
	const [inviter] = await db
		.select({ name: users.name, email: users.email })
		.from(users)
		.where(eq(users.id, invite.inviterId))
		.limit(1);

	return {
		childId: invite.childId,
		childName: child?.name || 'your baby',
		inviterName: inviter?.name || inviter?.email || 'your partner'
	};
}

/**
 * Get users who have shared access to a specific child (excluding the owner).
 */
export async function getChildSharedWith(childId: string) {
	const rows = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			sharedAt: childAccess.createdAt
		})
		.from(childAccess)
		.innerJoin(users, eq(users.id, childAccess.userId))
		.where(eq(childAccess.childId, childId));

	return rows;
}

/**
 * Get partners who share children with this user.
 */
export async function getPartners(userId: string) {
	// Users who granted access to this user
	const granters = await db
		.select({ userId: childAccess.grantedBy })
		.from(childAccess)
		.where(eq(childAccess.userId, userId));

	// Users this user granted access to
	const grantees = await db
		.select({ userId: childAccess.userId })
		.from(childAccess)
		.where(eq(childAccess.grantedBy, userId));

	const partnerIds = new Set([
		...granters.map((r) => r.userId).filter(Boolean),
		...grantees.map((r) => r.userId).filter(Boolean)
	]);

	partnerIds.delete(userId);

	if (partnerIds.size === 0) return [];

	const partners = [];
	for (const id of partnerIds) {
		const [user] = await db
			.select({ id: users.id, name: users.name, email: users.email })
			.from(users)
			.where(eq(users.id, id as string))
			.limit(1);
		if (user) partners.push(user);
	}

	return partners;
}
