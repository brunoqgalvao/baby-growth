<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<title>BabyGrowth</title>
	<meta name="description" content="Track your little one's growth with real WHO & CDC charts" />
</svelte:head>

{#if $navigating}
	<div class="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center" style="animation: fadeIn 0.15s ease-out">
		<img src="/favicon.png" alt="" class="w-12 h-12 mb-4" style="animation: pulse 1.2s ease-in-out infinite" />
		<div class="flex items-center gap-2 text-sm text-[var(--cream-500)] font-medium">
			<svg class="w-4 h-4 animate-spin text-[var(--primary)]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
			Loading...
		</div>
	</div>
{/if}

{@render children()}
