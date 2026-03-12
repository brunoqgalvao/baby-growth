<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let showAddChild = $state(false);
	let selectedSex = $state<'boy' | 'girl'>('boy');

	function parseLocalDate(s: string): Date {
		const [y, m, d] = s.split('-').map(Number);
		return new Date(y, m - 1, d);
	}

	function getAge(dob: string): string {
		const birth = parseLocalDate(dob);
		const now = new Date();
		const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
		if (months < 1) {
			const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
			return `${days} days old`;
		}
		if (months < 24) return `${months} month${months !== 1 ? 's' : ''} old`;
		const years = Math.floor(months / 12);
		const rem = months % 12;
		return rem > 0 ? `${years}y ${rem}m old` : `${years} years old`;
	}
</script>

<!-- Nav -->
<nav class="bg-white/80 backdrop-blur-md border-b border-[var(--cream-200)] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
	<a href="/dashboard" class="flex items-center gap-2.5">
		<img src="/favicon.png" alt="" class="w-8 h-8" />
		<span class="text-xl font-bold text-[var(--cream-700)]">Baby<span class="text-[var(--primary)]">Growth</span></span>
	</a>
	<form method="POST" action="/logout" use:enhance>
		<button type="submit" class="text-sm text-[var(--cream-500)] hover:text-[var(--cream-700)] cursor-pointer transition-colors font-medium">Sign out</button>
	</form>
</nav>

<div class="max-w-4xl mx-auto px-4 py-8 animate-in">
	<div class="flex justify-between items-center mb-6">
		<div>
			<h1 class="text-2xl font-bold text-[var(--cream-700)]">My Children</h1>
			<p class="text-sm text-[var(--cream-500)] mt-0.5">Track their growth journey</p>
		</div>
		<button
			onclick={() => showAddChild = true}
			class="btn-primary px-5 py-2.5 text-sm flex items-center gap-1.5"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
			Add Child
		</button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
		{#each data.children as child, i}
			<a
				href="/child/{child.id}"
				class="group block card p-5 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all relative overflow-hidden"
				style="animation-delay: {i * 80}ms"
			>
				<!-- Top accent bar -->
				<div class="absolute top-0 left-0 right-0 h-1 {child.sex === 'boy' ? 'bg-[var(--boy)]' : 'bg-[var(--girl)]'}"></div>

				<!-- Avatar -->
				<div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 {child.sex === 'boy' ? 'bg-[var(--boy-bg)]' : 'bg-[var(--girl-bg)]'} transition-transform group-hover:scale-105">
					{child.sex === 'boy' ? '👶' : '👧'}
				</div>

				<div class="text-lg font-bold text-[var(--cream-700)]">{child.name}</div>
				<div class="text-sm text-[var(--cream-500)] mb-3">{getAge(child.dateOfBirth)}</div>

				{#if child.latestMeasurement}
					<div class="grid grid-cols-3 gap-2">
						{#if child.latestMeasurement.weightKg}
							<div class="text-center p-2 bg-[var(--cream-100)] rounded-[var(--radius-sm)]">
								<div class="text-sm font-bold text-[var(--cream-700)]">{child.latestMeasurement.weightKg}</div>
								<div class="text-[10px] text-[var(--cream-500)] uppercase tracking-wider font-semibold">kg</div>
							</div>
						{/if}
						{#if child.latestMeasurement.heightCm}
							<div class="text-center p-2 bg-[var(--cream-100)] rounded-[var(--radius-sm)]">
								<div class="text-sm font-bold text-[var(--cream-700)]">{child.latestMeasurement.heightCm}</div>
								<div class="text-[10px] text-[var(--cream-500)] uppercase tracking-wider font-semibold">cm</div>
							</div>
						{/if}
						{#if child.latestMeasurement.headCircCm}
							<div class="text-center p-2 bg-[var(--cream-100)] rounded-[var(--radius-sm)]">
								<div class="text-sm font-bold text-[var(--cream-700)]">{child.latestMeasurement.headCircCm}</div>
								<div class="text-[10px] text-[var(--cream-500)] uppercase tracking-wider font-semibold">hc</div>
							</div>
						{/if}
					</div>
				{:else}
					<p class="text-xs text-[var(--cream-400)] italic">No measurements yet</p>
				{/if}
			</a>
		{/each}

		<!-- Add child placeholder -->
		<button
			onclick={() => showAddChild = true}
			class="border-2 border-dashed border-[var(--cream-300)] rounded-[var(--radius)] flex flex-col items-center justify-center min-h-[200px] text-[var(--cream-400)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer bg-transparent group"
		>
			<div class="w-12 h-12 rounded-full bg-[var(--cream-100)] group-hover:bg-[var(--peach-50)] flex items-center justify-center text-2xl mb-2 transition-colors">
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
			</div>
			<span class="font-semibold text-sm">Add a child</span>
		</button>
	</div>
</div>

<!-- Add Child Modal -->
{#if showAddChild}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) showAddChild = false }}
		role="dialog"
	>
		<div class="card p-8 w-[90%] max-w-md shadow-[var(--shadow-lg)] animate-in">
			<h2 class="text-xl font-bold text-[var(--cream-700)] mb-6">Add a Child</h2>

			<form method="POST" action="?/addChild" use:enhance={() => {
				return async ({ update }) => {
					await update();
					showAddChild = false;
				};
			}}>
				<div class="mb-4">
					<label for="name" class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Name</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						placeholder="Baby's name"
						class="input"
					/>
				</div>

				<div class="mb-4">
					<label for="dob" class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Date of Birth</label>
					<input
						id="dob"
						name="dateOfBirth"
						type="date"
						required
						class="input"
					/>
				</div>

				<div class="mb-4">
					<label class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Sex</label>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={() => selectedSex = 'boy'}
							class="flex-1 py-3 rounded-[var(--radius-sm)] text-sm font-bold border-2 transition-all cursor-pointer {selectedSex === 'boy' ? 'border-[var(--boy)] bg-[var(--boy-bg)] text-[var(--boy)]' : 'border-[var(--cream-200)] text-[var(--cream-500)]'}"
						>
							👦 Boy
						</button>
						<button
							type="button"
							onclick={() => selectedSex = 'girl'}
							class="flex-1 py-3 rounded-[var(--radius-sm)] text-sm font-bold border-2 transition-all cursor-pointer {selectedSex === 'girl' ? 'border-[var(--girl)] bg-[var(--girl-bg)] text-[var(--girl)]' : 'border-[var(--cream-200)] text-[var(--cream-500)]'}"
						>
							👧 Girl
						</button>
					</div>
					<input type="hidden" name="sex" value={selectedSex} />
				</div>

				<div class="mb-4">
					<label class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Birth Measurements <span class="font-normal text-[var(--cream-400)]">(optional)</span></label>
					<div class="grid grid-cols-2 gap-3">
						<input name="birthWeight" type="number" step="0.1" placeholder="Weight (kg)" class="input" />
						<input name="birthHeight" type="number" step="0.1" placeholder="Height (cm)" class="input" />
					</div>
					<div class="mt-2">
						<input name="birthHeadCirc" type="number" step="0.1" placeholder="Head circumference (cm)" class="input w-1/2" />
					</div>
				</div>

				<div class="flex justify-end gap-2 mt-7">
					<button
						type="button"
						onclick={() => showAddChild = false}
						class="btn-secondary px-5 py-2.5 text-sm"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn-primary px-5 py-2.5 text-sm"
					>
						Add Child
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
