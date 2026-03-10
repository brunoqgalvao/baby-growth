<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
	<div class="text-center max-w-md">
		<div class="text-5xl mb-4">👶</div>
		<h1 class="text-4xl font-bold text-[var(--primary)] mb-2">BabyGrowth</h1>
		<p class="text-stone-500 mb-8">Track your little one's growth with real WHO & CDC charts</p>

		{#if data.userId}
			<a
				href="/dashboard"
				class="inline-block px-8 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary-hover)] transition-all"
			>
				Go to Dashboard
			</a>
		{:else}
			<div class="flex gap-3 justify-center">
				<a
					href="/login"
					class="px-8 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary-hover)] transition-all"
				>
					Sign In
				</a>
				<a
					href="/signup"
					class="px-8 py-3 bg-stone-100 text-stone-700 rounded-lg font-semibold border border-stone-200 hover:bg-stone-200 transition-all"
				>
					Sign Up
				</a>
			</div>
		{/if}
	</div>
</div>
