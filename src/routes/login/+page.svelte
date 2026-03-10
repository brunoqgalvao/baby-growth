<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen bg-stone-50 flex items-center justify-center px-4">
	<div class="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
		<div class="text-center mb-6">
			<h1 class="text-2xl font-bold text-[var(--primary)]">BabyGrowth</h1>
			<p class="text-stone-500 text-sm">Track your little one's milestones</p>
		</div>

		{#if form?.error}
			<div class="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold mb-1.5">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					value={form?.email ?? ''}
					placeholder="parent@email.com"
					required
					class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
				/>
			</div>

			<div class="mb-5">
				<label for="password" class="block text-sm font-semibold mb-1.5">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="Enter your password"
					required
					class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
				/>
			</div>

			<button
				type="submit"
				class="w-full py-2.5 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
			>
				Sign In
			</button>
		</form>

		<p class="text-center mt-5 text-sm text-stone-500">
			Don't have an account?
			<a href="/signup" class="text-[var(--primary)] font-semibold hover:underline">Sign up</a>
		</p>
	</div>
</div>
