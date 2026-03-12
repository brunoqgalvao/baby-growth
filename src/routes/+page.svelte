<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
	<!-- Decorative background elements -->
	<div class="absolute inset-0 bg-pattern opacity-40"></div>
	<div class="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] rounded-full bg-[var(--peach-100)] opacity-60 blur-3xl"></div>
	<div class="absolute bottom-[-100px] left-[-60px] w-[250px] h-[250px] rounded-full bg-[var(--mint-100)] opacity-60 blur-3xl"></div>

	<div class="text-center max-w-md relative z-10 animate-in">
		<!-- Logo -->
		<div class="mb-6">
			<img src="/logo.png" alt="BabyGrowth" class="w-40 h-40 mx-auto drop-shadow-sm" />
		</div>

		<h1 class="text-4xl font-bold text-[var(--cream-700)] mb-2">
			Baby<span class="text-[var(--primary)]">Growth</span>
		</h1>
		<p class="text-[var(--cream-500)] mb-10 text-lg">
			Track your little one's growth with real WHO & CDC charts
		</p>

		{#if data.userId}
			<a
				href="/dashboard"
				class="btn-primary inline-block px-10 py-3.5 text-base"
			>
				Go to Dashboard
			</a>
		{:else}
			<div class="flex gap-3 justify-center">
				<a
					href="/login"
					class="btn-primary px-10 py-3.5 text-base"
				>
					Sign In
				</a>
				<a
					href="/signup"
					class="btn-secondary px-10 py-3.5 text-base"
				>
					Sign Up
				</a>
			</div>
		{/if}

		<!-- Trust badges -->
		<div class="mt-12 flex items-center justify-center gap-6 text-xs text-[var(--cream-400)]">
			<span class="flex items-center gap-1.5">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
				WHO Standards
			</span>
			<span class="flex items-center gap-1.5">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
				CDC Charts
			</span>
			<span class="flex items-center gap-1.5">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
				Private & Secure
			</span>
		</div>
	</div>
</div>
