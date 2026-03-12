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
<nav class="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
	<a href="/dashboard" class="text-xl font-bold text-[var(--primary)] flex items-center gap-2">
		👶 BabyGrowth
	</a>
	<form method="POST" action="/logout" use:enhance>
		<button type="submit" class="text-sm text-stone-500 hover:text-stone-700 cursor-pointer">Sign out</button>
	</form>
</nav>

<div class="max-w-4xl mx-auto px-4 py-6">
	<div class="flex justify-between items-center mb-5">
		<h1 class="text-2xl font-bold">My Children</h1>
		<button
			onclick={() => showAddChild = true}
			class="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
		>
			+ Add Child
		</button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each data.children as child}
			<a
				href="/child/{child.id}"
				class="block bg-white rounded-xl p-5 shadow-sm border border-stone-200 hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden"
			>
				<div class="absolute top-0 left-0 right-0 h-1 {child.sex === 'boy' ? 'bg-[var(--boy)]' : 'bg-[var(--girl)]'}"></div>
				<div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 {child.sex === 'boy' ? 'bg-blue-50' : 'bg-pink-50'}">
					{child.sex === 'boy' ? '👶' : '👧'}
				</div>
				<div class="text-lg font-bold">{child.name}</div>
				<div class="text-sm text-stone-500 mb-3">{getAge(child.dateOfBirth)}</div>

				{#if child.latestMeasurement}
					<div class="grid grid-cols-3 gap-2">
						{#if child.latestMeasurement.weightKg}
							<div class="text-center p-2 bg-stone-50 rounded-lg">
								<div class="text-sm font-bold">{child.latestMeasurement.weightKg}</div>
								<div class="text-[10px] text-stone-500 uppercase tracking-wide">kg</div>
							</div>
						{/if}
						{#if child.latestMeasurement.heightCm}
							<div class="text-center p-2 bg-stone-50 rounded-lg">
								<div class="text-sm font-bold">{child.latestMeasurement.heightCm}</div>
								<div class="text-[10px] text-stone-500 uppercase tracking-wide">cm</div>
							</div>
						{/if}
						{#if child.latestMeasurement.headCircCm}
							<div class="text-center p-2 bg-stone-50 rounded-lg">
								<div class="text-sm font-bold">{child.latestMeasurement.headCircCm}</div>
								<div class="text-[10px] text-stone-500 uppercase tracking-wide">hc</div>
							</div>
						{/if}
					</div>
				{:else}
					<p class="text-xs text-stone-400 italic">No measurements yet</p>
				{/if}
			</a>
		{/each}

		<!-- Add child placeholder -->
		<button
			onclick={() => showAddChild = true}
			class="border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center min-h-[200px] text-stone-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer bg-transparent"
		>
			<div class="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-2xl mb-2">+</div>
			Add a child
		</button>
	</div>
</div>

<!-- Add Child Modal -->
{#if showAddChild}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) showAddChild = false }}
		role="dialog"
	>
		<div class="bg-white rounded-2xl p-7 w-[90%] max-w-md shadow-xl">
			<h2 class="text-xl font-bold mb-5">Add a Child</h2>

			<form method="POST" action="?/addChild" use:enhance={() => {
				return async ({ update }) => {
					await update();
					showAddChild = false;
				};
			}}>
				<div class="mb-4">
					<label for="name" class="block text-sm font-semibold mb-1.5">Name</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						placeholder="Baby's name"
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<div class="mb-4">
					<label for="dob" class="block text-sm font-semibold mb-1.5">Date of Birth</label>
					<input
						id="dob"
						name="dateOfBirth"
						type="date"
						required
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<div class="mb-4">
					<label class="block text-sm font-semibold mb-1.5">Sex</label>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={() => selectedSex = 'boy'}
							class="flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer {selectedSex === 'boy' ? 'border-[var(--boy)] bg-blue-50 text-[var(--boy)]' : 'border-stone-200 text-stone-500'}"
						>
							👦 Boy
						</button>
						<button
							type="button"
							onclick={() => selectedSex = 'girl'}
							class="flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer {selectedSex === 'girl' ? 'border-[var(--girl)] bg-pink-50 text-[var(--girl)]' : 'border-stone-200 text-stone-500'}"
						>
							👧 Girl
						</button>
					</div>
					<input type="hidden" name="sex" value={selectedSex} />
				</div>

				<div class="mb-4">
					<label class="block text-sm font-semibold mb-1.5">Birth Measurements <span class="font-normal text-stone-400">(optional)</span></label>
					<div class="grid grid-cols-2 gap-3">
						<input name="birthWeight" type="number" step="0.1" placeholder="Weight (kg)" class="px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]" />
						<input name="birthHeight" type="number" step="0.1" placeholder="Height (cm)" class="px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]" />
					</div>
					<div class="mt-2">
						<input name="birthHeadCirc" type="number" step="0.1" placeholder="Head circumference (cm)" class="w-1/2 px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]" />
					</div>
				</div>

				<div class="flex justify-end gap-2 mt-6">
					<button
						type="button"
						onclick={() => showAddChild = false}
						class="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-lg font-semibold text-sm border border-stone-200 hover:bg-stone-200 transition-all cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
					>
						Add Child
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
