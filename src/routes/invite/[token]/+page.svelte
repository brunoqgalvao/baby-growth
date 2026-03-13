<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
	<!-- Decorative blobs -->
	<div class="absolute top-[-80px] right-[-60px] w-[200px] h-[200px] rounded-full bg-[var(--peach-100)] opacity-50 blur-3xl"></div>
	<div class="absolute bottom-[-80px] left-[-60px] w-[200px] h-[200px] rounded-full bg-[var(--mint-100)] opacity-50 blur-3xl"></div>

	<div class="w-full max-w-sm card p-8 relative z-10 animate-in text-center">
		<a href="/" class="inline-block">
			<img src="/favicon.png" alt="BabyGrowth" class="w-14 h-14 mx-auto mb-3" />
		</a>

		<div class="w-16 h-16 mx-auto rounded-full bg-[var(--peach-50)] flex items-center justify-center text-3xl mb-4">
			<svg class="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
			</svg>
		</div>

		<h1 class="text-2xl font-bold text-[var(--cream-700)] mb-2">You're invited!</h1>
		<p class="text-[var(--cream-500)] text-sm mb-6">
			<strong class="text-[var(--cream-700)]">{data.inviterName}</strong> wants to share
			<strong class="text-[var(--cream-700)]">{data.childName}</strong>'s growth journey with you.
		</p>

		<div class="flex flex-col gap-3">
			<a
				href="/signup?invite={data.token}"
				class="btn-primary w-full py-3 text-sm text-center inline-block"
			>
				Create Account
			</a>
			<a
				href="/login?invite={data.token}"
				class="btn-secondary w-full py-3 text-sm text-center inline-block"
			>
				I already have an account
			</a>
		</div>

		<p class="text-xs text-[var(--cream-400)] mt-5">
			After signing in, you'll be able to view and add measurements for {data.childName}.
		</p>
	</div>
</div>
