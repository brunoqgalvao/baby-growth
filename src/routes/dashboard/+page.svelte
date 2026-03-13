<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showAddChild = $state(false);
	let selectedSex = $state<'boy' | 'girl'>('boy');
	let photoPreview = $state<string | null>(null);
	let photoFile = $state<File | null>(null);
	let uploadingPhoto = $state(false);
	let showPartnerPanel = $state(false);

	function handlePhotoSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		photoFile = file;
		const reader = new FileReader();
		reader.onload = () => { photoPreview = reader.result as string; };
		reader.readAsDataURL(file);
	}

	function clearPhoto() {
		photoPreview = null;
		photoFile = null;
	}

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

	function getGreeting(): string {
		const h = new Date().getHours();
		if (h < 12) return 'Good morning';
		if (h < 18) return 'Good afternoon';
		return 'Good evening';
	}

	function getRelativeDate(dateStr: string): string {
		const d = parseLocalDate(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		if (days === 0) return 'today';
		if (days === 1) return 'yesterday';
		if (days < 7) return `${days} days ago`;
		if (days < 30) {
			const weeks = Math.floor(days / 7);
			return `${weeks}w ago`;
		}
		const months = Math.floor(days / 30);
		return `${months}mo ago`;
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
	<!-- Greeting -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-[var(--cream-700)]">
			{getGreeting()}{#if data.userName}, {data.userName}{/if}
		</h1>
		<p class="text-sm text-[var(--cream-500)] mt-0.5">
			{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
		</p>
	</div>

	<div class="flex justify-between items-center mb-6">
		<h2 class="text-lg font-bold text-[var(--cream-700)]">My Children</h2>
		<div class="flex gap-2">
			<button
				onclick={() => showPartnerPanel = !showPartnerPanel}
				class="btn-secondary px-4 py-2.5 text-sm flex items-center gap-1.5"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
				</svg>
				Partner
			</button>
			<button
				onclick={() => showAddChild = true}
				class="btn-primary px-5 py-2.5 text-sm flex items-center gap-1.5"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
				Add Child
			</button>
		</div>
	</div>

	<!-- Partner Panel -->
	{#if showPartnerPanel}
		<div class="card p-6 mb-6 animate-in">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 rounded-full bg-[var(--peach-100)] flex items-center justify-center">
					<svg class="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
					</svg>
				</div>
				<div>
					<h2 class="text-lg font-bold text-[var(--cream-700)]">Connected Partners</h2>
					<p class="text-sm text-[var(--cream-500)]">People you share children with</p>
				</div>
			</div>

			{#if data.partners && data.partners.length > 0}
				<div class="space-y-2">
					{#each data.partners as partner}
						<div class="flex items-center gap-3 p-3 bg-[var(--mint-50)] rounded-[var(--radius-sm)] border border-[var(--mint-200)]">
							<div class="w-8 h-8 rounded-full bg-[var(--mint-200)] flex items-center justify-center text-sm font-bold text-[var(--mint-500)]">
								{(partner.name || partner.email)[0].toUpperCase()}
							</div>
							<span class="text-sm text-[var(--cream-700)] font-medium">{partner.name || partner.email}</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-6">
					<p class="text-sm text-[var(--cream-500)]">No partners yet</p>
					<p class="text-xs text-[var(--cream-400)] mt-1">Share a child's profile to connect with your partner</p>
				</div>
			{/if}
		</div>
	{/if}

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
		{#each data.children as child, i}
			<div
				class="group card relative overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all"
				style="animation-delay: {i * 80}ms"
			>
				<!-- Top accent bar -->
				<div class="absolute top-0 left-0 right-0 h-1 {child.sex === 'boy' ? 'bg-[var(--boy)]' : 'bg-[var(--girl)]'}"></div>

				<!-- Main clickable area -->
				<a href="/child/{child.id}" class="block p-5 pb-3">
					<div class="flex items-start gap-3">
						<!-- Avatar -->
						{#if child.photoUrl}
							<img src={child.photoUrl} alt={child.name} class="w-12 h-12 rounded-full object-cover border-2 {child.sex === 'boy' ? 'border-[var(--boy)]' : 'border-[var(--girl)]'} transition-transform group-hover:scale-105 shrink-0" />
						{:else}
							<div class="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 {child.sex === 'boy' ? 'bg-[var(--boy-bg)]' : 'bg-[var(--girl-bg)]'} transition-transform group-hover:scale-105">
								{child.sex === 'boy' ? '👶' : '👧'}
							</div>
						{/if}

						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<span class="text-lg font-bold text-[var(--cream-700)] truncate">{child.name}</span>
								{#if child.isShared}
									<span class="shrink-0 px-1.5 py-0.5 bg-[var(--mint-50)] border border-[var(--mint-200)] rounded-full text-[9px] font-bold text-[var(--mint-500)] uppercase tracking-wider">
										Shared
									</span>
								{/if}
							</div>
							<div class="text-sm text-[var(--cream-500)]">{getAge(child.dateOfBirth)}</div>
						</div>

						<!-- Chevron -->
						<svg class="w-5 h-5 text-[var(--cream-300)] group-hover:text-[var(--cream-500)] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
					</div>

					<!-- Metrics -->
					{#if child.latestMeasurement}
						{@const m = child.latestMeasurement}
						{@const metrics = [
							m.weightKg ? { value: m.weightKg, unit: 'kg', label: 'Weight' } : null,
							m.heightCm ? { value: m.heightCm, unit: 'cm', label: 'Height' } : null,
							m.headCircCm ? { value: m.headCircCm, unit: 'cm', label: 'Head' } : null
						].filter(Boolean) as { value: number; unit: string; label: string }[]}

						<div class="mt-3 flex items-center gap-3">
							{#each metrics as metric, idx}
								{#if idx > 0}
									<div class="w-px h-6 bg-[var(--cream-200)]"></div>
								{/if}
								<div class="text-center">
									<span class="text-sm font-bold text-[var(--cream-700)]">{metric.value}</span>
									<span class="text-[10px] text-[var(--cream-500)] ml-0.5 uppercase font-semibold">{metric.unit}</span>
								</div>
							{/each}
						</div>

						<div class="mt-2 text-[11px] text-[var(--cream-400)]">
							Measured {getRelativeDate(m.date)}
						</div>
					{:else}
						<div class="mt-3 text-xs text-[var(--cream-400)] italic">No measurements yet</div>
					{/if}
				</a>

				<!-- Quick action footer -->
				<div class="px-5 pb-4 pt-1">
					<a
						href="/child/{child.id}?addMeasurement=1"
						class="flex items-center justify-center gap-1.5 w-full py-2 rounded-[var(--radius-sm)] text-xs font-bold text-[var(--primary)] bg-[var(--peach-50)] hover:bg-[var(--peach-100)] transition-colors"
					>
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
						Log Measurement
					</a>
				</div>
			</div>
		{/each}

		<!-- Add child placeholder — compact when children exist -->
		{#if data.children.length === 0}
			<button
				onclick={() => showAddChild = true}
				class="border-2 border-dashed border-[var(--cream-300)] rounded-[var(--radius)] flex flex-col items-center justify-center min-h-[240px] text-[var(--cream-400)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer bg-transparent group col-span-full"
			>
				<div class="w-14 h-14 rounded-full bg-[var(--cream-100)] group-hover:bg-[var(--peach-50)] flex items-center justify-center text-2xl mb-3 transition-colors">
					<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
				</div>
				<span class="font-bold text-sm">Add your first child</span>
				<span class="text-xs mt-1 text-[var(--cream-400)]">Start tracking their growth journey</span>
			</button>
		{:else}
			<button
				onclick={() => showAddChild = true}
				class="border-2 border-dashed border-[var(--cream-300)] rounded-[var(--radius)] flex items-center justify-center gap-2 min-h-[80px] text-[var(--cream-400)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer bg-transparent group"
			>
				<div class="w-8 h-8 rounded-full bg-[var(--cream-100)] group-hover:bg-[var(--peach-50)] flex items-center justify-center transition-colors">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
				</div>
				<span class="font-semibold text-sm">Add a child</span>
			</button>
		{/if}
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
				return async ({ result, update }) => {
					if (result.type === 'success' && photoFile && result.data?.childId) {
						const childId = result.data.childId;
						const formData = new FormData();
						formData.append('photo', photoFile);
						uploadingPhoto = true;
						try {
							await fetch(`/api/children/${childId}/photo`, {
								method: 'POST',
								body: formData
							});
						} finally {
							uploadingPhoto = false;
						}
						clearPhoto();
					}
					await update();
					showAddChild = false;
				};
			}}>
				<!-- Photo picker -->
				<div class="mb-5 flex flex-col items-center">
					<label class="block text-sm font-semibold mb-2 text-[var(--cream-600)] self-start">Photo <span class="font-normal text-[var(--cream-400)]">(optional)</span></label>
					<div class="relative">
						{#if photoPreview}
							<img src={photoPreview} alt="Preview" class="w-24 h-24 rounded-full object-cover border-3 border-[var(--cream-200)]" />
							<button
								type="button"
								onclick={clearPhoto}
								class="absolute -top-1 -right-1 w-6 h-6 bg-red-400 text-white rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-red-500 transition-colors shadow"
							>
								<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
							</button>
						{:else}
							<label class="w-24 h-24 rounded-full bg-[var(--cream-100)] border-2 border-dashed border-[var(--cream-300)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--peach-50)] transition-all">
								<svg class="w-7 h-7 text-[var(--cream-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
								<span class="text-[10px] text-[var(--cream-400)] mt-0.5 font-medium">Add photo</span>
								<input type="file" accept="image/*" class="hidden" onchange={handlePhotoSelect} />
							</label>
						{/if}
					</div>
				</div>

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
