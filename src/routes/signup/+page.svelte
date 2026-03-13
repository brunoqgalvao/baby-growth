<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
</script>

<div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
	<!-- Decorative blobs -->
	<div class="absolute top-[-80px] right-[-60px] w-[200px] h-[200px] rounded-full bg-[var(--peach-100)] opacity-50 blur-3xl"></div>
	<div class="absolute bottom-[-80px] left-[-60px] w-[200px] h-[200px] rounded-full bg-[var(--mint-100)] opacity-50 blur-3xl"></div>

	<div class="w-full max-w-sm card p-8 relative z-10 animate-in">
		<div class="text-center mb-7">
			<a href="/" class="inline-block">
				<img src="/favicon.png" alt="BabyGrowth" class="w-14 h-14 mx-auto mb-3" />
			</a>
			<h1 class="text-2xl font-bold text-[var(--cream-700)]">Create account</h1>
			{#if data.inviteInfo}
				<p class="text-[var(--cream-500)] text-sm mt-1">
					<strong class="text-[var(--cream-700)]">{data.inviteInfo.inviterName}</strong> invited you to follow
					<strong class="text-[var(--cream-700)]">{data.inviteInfo.childName}</strong>'s growth!
				</p>
			{:else}
				<p class="text-[var(--cream-500)] text-sm mt-1">Start tracking your baby's milestones</p>
			{/if}
		</div>

		{#if form?.error}
			<div class="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-[var(--radius-sm)] border border-red-200">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}>
			{#if data.invite}
				<input type="hidden" name="inviteToken" value={data.invite} />
			{/if}
			<div class="mb-4">
				<label for="name" class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Name</label>
				<input
					id="name"
					name="name"
					type="text"
					value={form?.name ?? ''}
					placeholder="Your name"
					class="input"
				/>
			</div>

			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					value={form?.email ?? ''}
					placeholder="parent@email.com"
					required
					class="input"
				/>
			</div>

			<div class="mb-6">
				<label for="password" class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="At least 6 characters"
					required
					minlength="6"
					class="input"
				/>
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
			>
				{#if submitting}
					<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
					Creating account...
				{:else}
					Create Account
				{/if}
			</button>
		</form>

		<p class="text-center mt-6 text-sm text-[var(--cream-500)]">
			Already have an account?
			<a href="/login{data.invite ? `?invite=${data.invite}` : ''}" class="text-[var(--primary)] font-bold hover:underline">Sign in</a>
		</p>
	</div>
</div>
