<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import GrowthChart from '$lib/components/GrowthChart.svelte';
	import AiMeasurementInput from '$lib/components/AiMeasurementInput.svelte';
	import { getPercentile, interpolateLMS, getLMSData } from '$lib/growth-data';
	import type { MeasurementType, Standard } from '$lib/growth-data/types';

	let { data }: { data: PageData } = $props();
	let showAddMeasurement = $state(false);
	let editingMeasurement = $state<typeof data.measurements[number] | null>(null);

	// AI-prefillable form state
	let addDate = $state('');
	let addWeight = $state('');
	let addHeight = $state('');
	let addHead = $state('');
	let aiTranscript = $state('');

	function resetAddForm() {
		addDate = new Date().toISOString().split('T')[0];
		addWeight = '';
		addHeight = '';
		addHead = '';
		aiTranscript = '';
	}

	function handleAiParsed(values: { date?: string | null; weightKg?: number | null; heightCm?: number | null; headCircCm?: number | null; transcript?: string }) {
		if (values.date) addDate = values.date;
		if (values.weightKg != null) addWeight = String(values.weightKg);
		if (values.heightCm != null) addHeight = String(values.heightCm);
		if (values.headCircCm != null) addHead = String(values.headCircCm);
		if (values.transcript) aiTranscript = values.transcript;
	}
	let activeChart = $state<MeasurementType>('weight');
	let standard = $state<Standard>('who');

	const child = $derived(data.child);
	const sex = $derived(child.sex as 'boy' | 'girl');

	function parseLocalDate(s: string): Date {
		const [y, m, d] = s.split('-').map(Number);
		return new Date(y, m - 1, d);
	}

	function getAgeMonths(date: string): number {
		const birth = parseLocalDate(child.dateOfBirth);
		const d = parseLocalDate(date);
		return (d.getFullYear() - birth.getFullYear()) * 12 + (d.getMonth() - birth.getMonth()) + (d.getDate() - birth.getDate()) / 30;
	}

	function getAgeLabel(date: string): string {
		const months = Math.round(getAgeMonths(date));
		if (months === 0) return 'Birth';
		if (months < 24) return `${months} mo`;
		const y = Math.floor(months / 12);
		const m = months % 12;
		return m > 0 ? `${y}y ${m}m` : `${y}y`;
	}

	function getAge(): string {
		const birth = parseLocalDate(child.dateOfBirth);
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

	function makeChartData(type: MeasurementType) {
		return data.measurements
			.filter((m) => {
				if (type === 'weight') return m.weightKg != null;
				if (type === 'height') return m.heightCm != null;
				return m.headCircCm != null;
			})
			.map((m) => ({
				month: Math.max(0, getAgeMonths(m.date)),
				value: type === 'weight' ? m.weightKg! : type === 'height' ? m.heightCm! : m.headCircCm!,
				id: m.id
			}));
	}

	function handlePointDblClick(id: string) {
		const m = data.measurements.find((m) => m.id === id);
		if (m) editingMeasurement = m;
	}

	function getLatestPercentile(type: MeasurementType): string | null {
		const points = makeChartData(type);
		if (points.length === 0) return null;
		const last = points[points.length - 1];
		const lmsData = getLMSData(standard, sex, type);
		const lms = interpolateLMS(last.month, lmsData);
		if (!lms) return null;
		return `P${Math.round(getPercentile(last.value, lms))}`;
	}

	function getLatestValue(type: MeasurementType): string | null {
		const ms = data.measurements;
		if (ms.length === 0) return null;
		const latest = ms[ms.length - 1];
		if (type === 'weight') return latest.weightKg ? `${latest.weightKg} kg` : null;
		if (type === 'height') return latest.heightCm ? `${latest.heightCm} cm` : null;
		return latest.headCircCm ? `${latest.headCircCm} cm` : null;
	}

	function formatDate(d: string): string {
		return parseLocalDate(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	const statIcons = {
		weight: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 7.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
		height: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>`,
		head: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18"/></svg>`
	};
</script>

<!-- Nav -->
<nav class="bg-white/80 backdrop-blur-md border-b border-[var(--cream-200)] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
	<a href="/dashboard" class="flex items-center gap-2.5">
		<img src="/favicon.png" alt="" class="w-8 h-8" />
		<span class="text-xl font-bold text-[var(--cream-700)]">Baby<span class="text-[var(--primary)]">Growth</span></span>
	</a>
	<a href="/dashboard" class="text-sm text-[var(--cream-500)] hover:text-[var(--cream-700)] font-medium transition-colors flex items-center gap-1">
		<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
		Back
	</a>
</nav>

<div class="max-w-4xl mx-auto px-4 py-8 pb-24 sm:pb-8 animate-in">
	<!-- Child header -->
	<div class="flex items-center gap-4 mb-8 flex-wrap">
		<div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-[var(--shadow-sm)] {sex === 'boy' ? 'bg-[var(--boy-bg)]' : 'bg-[var(--girl-bg)]'}">
			{sex === 'boy' ? '👶' : '👧'}
		</div>
		<div>
			<h1 class="text-2xl font-bold text-[var(--cream-700)]">{child.name}</h1>
			<p class="text-sm text-[var(--cream-500)]">
				{getAge()}
				<span class="mx-1 text-[var(--cream-300)]">&middot;</span>
				{sex === 'boy' ? 'Boy' : 'Girl'}
				<span class="mx-1 text-[var(--cream-300)]">&middot;</span>
				Born {formatDate(child.dateOfBirth)}
			</p>
		</div>
		<div class="ml-auto hidden sm:flex gap-2 flex-wrap">
			<button
				onclick={() => { resetAddForm(); showAddMeasurement = true; }}
				class="btn-primary px-4 py-2.5 text-sm flex items-center gap-1.5"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
				Log Measurement
			</button>
		</div>
	</div>

	<!-- Summary stats (hidden on mobile) -->
	<div class="hidden sm:grid sm:grid-cols-3 gap-4 mb-8">
		{#each [
			{ type: 'weight' as MeasurementType, label: 'Weight', color: 'var(--peach-100)', accent: 'var(--peach-500)' },
			{ type: 'height' as MeasurementType, label: 'Height', color: 'var(--mint-100)', accent: 'var(--mint-500)' },
			{ type: 'head' as MeasurementType, label: 'Head Circ.', color: 'var(--boy-bg)', accent: 'var(--boy)' }
		] as stat}
			<div class="card p-5 text-center relative overflow-hidden group hover:shadow-[var(--shadow-md)] transition-all">
				<div class="absolute top-0 left-0 right-0 h-0.5" style="background: {stat.accent}; opacity: 0.4"></div>
				<div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style="background: {stat.color}; color: {stat.accent}">
					{@html statIcons[stat.type]}
				</div>
				<div class="text-2xl font-bold text-[var(--cream-700)]">{getLatestValue(stat.type) ?? '---'}</div>
				<div class="text-xs text-[var(--cream-500)] mt-1 font-semibold uppercase tracking-wider">{stat.label}</div>
				{#if getLatestPercentile(stat.type)}
					<div class="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold" style="background: {stat.color}; color: {stat.accent}">
						{getLatestPercentile(stat.type)}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Growth Chart -->
	<div class="card p-6 mb-5">
		<div class="flex items-center justify-between mb-5 flex-wrap gap-3">
			<h2 class="text-lg font-bold text-[var(--cream-700)]">Growth Chart</h2>
			<div class="flex gap-2 items-center">
				<!-- Standard toggle -->
				<div class="flex bg-[var(--cream-100)] rounded-[var(--radius-sm)] p-1 text-xs">
					<button
						onclick={() => standard = 'who'}
						class="px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer {standard === 'who' ? 'bg-white shadow-sm text-[var(--cream-700)]' : 'text-[var(--cream-500)]'}"
					>
						WHO
					</button>
					<button
						onclick={() => standard = 'cdc'}
						class="px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer {standard === 'cdc' ? 'bg-white shadow-sm text-[var(--cream-700)]' : 'text-[var(--cream-500)]'}"
					>
						CDC
					</button>
				</div>
				<!-- Measurement type toggle -->
				<div class="flex bg-[var(--cream-100)] rounded-[var(--radius-sm)] p-1 text-xs">
					{#each [
						{ key: 'weight' as MeasurementType, label: 'Weight' },
						{ key: 'height' as MeasurementType, label: 'Height' },
						{ key: 'head' as MeasurementType, label: 'Head' }
					] as tab}
						<button
							onclick={() => activeChart = tab.key}
							class="px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer {activeChart === tab.key ? 'bg-white shadow-sm text-[var(--cream-700)]' : 'text-[var(--cream-500)]'}"
						>
							{tab.label}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<GrowthChart
			{sex}
			{standard}
			measurementType={activeChart}
			dataPoints={makeChartData(activeChart)}
			onpointdblclick={handlePointDblClick}
		/>

		<!-- Legend -->
		<div class="flex gap-5 mt-4 flex-wrap text-xs text-[var(--cream-500)]">
			<div class="flex items-center gap-1.5"><div class="w-5 h-0.5 bg-[var(--cream-300)] rounded"></div> 3rd / 97th</div>
			<div class="flex items-center gap-1.5"><div class="w-5 h-0.5 bg-[var(--boy)] rounded opacity-60"></div> 15th / 85th</div>
			<div class="flex items-center gap-1.5"><div class="w-5 h-[2px] bg-[var(--boy)] rounded"></div> 50th</div>
			<div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"></div> {child.name}</div>
		</div>

		{#if standard === 'cdc'}
			<p class="text-xs text-amber-600 mt-3 flex items-center gap-1">
				<svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
				CDC charts cover 0-36 months. For ages beyond 3 years, switch to WHO.
			</p>
		{/if}
	</div>

	<!-- Measurements table -->
	<div class="card p-6">
		<div class="flex items-center justify-between mb-5">
			<h2 class="text-lg font-bold text-[var(--cream-700)]">Measurement History</h2>
			<button
				onclick={() => { resetAddForm(); showAddMeasurement = true; }}
				class="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
			>
				<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
				Add
			</button>
		</div>

		{#if data.measurements.length === 0}
			<div class="text-center py-12">
				<div class="w-16 h-16 mx-auto rounded-full bg-[var(--cream-100)] flex items-center justify-center text-2xl mb-3">📏</div>
				<p class="text-[var(--cream-500)] text-sm">No measurements yet</p>
				<p class="text-[var(--cream-400)] text-xs mt-1">Add one to get started!</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b-2 border-[var(--cream-200)]">
							<th class="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-[var(--cream-500)]">Date</th>
							<th class="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-[var(--cream-500)]">Age</th>
							<th class="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-[var(--cream-500)]">Weight</th>
							<th class="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-[var(--cream-500)]">Height</th>
							<th class="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-[var(--cream-500)]">Head</th>
							<th class="py-2.5 px-3"></th>
						</tr>
					</thead>
					<tbody>
						{#each [...data.measurements].reverse() as m}
							<tr class="border-b border-[var(--cream-100)] hover:bg-[var(--cream-50)] transition-colors">
								<td class="py-3 px-3 font-medium text-[var(--cream-700)]">{formatDate(m.date)}</td>
								<td class="py-3 px-3 text-[var(--cream-500)]">{getAgeLabel(m.date)}</td>
								<td class="py-3 px-3">{m.weightKg ? `${m.weightKg} kg` : '---'}</td>
								<td class="py-3 px-3">{m.heightCm ? `${m.heightCm} cm` : '---'}</td>
								<td class="py-3 px-3">{m.headCircCm ? `${m.headCircCm} cm` : '---'}</td>
								<td class="py-3 px-3 flex gap-1">
									<button
										onclick={() => editingMeasurement = m}
										class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--cream-400)] hover:text-[var(--boy)] hover:bg-[var(--boy-bg)] cursor-pointer transition-all"
										title="Edit"
									>
										<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
									</button>
									<form method="POST" action="?/deleteMeasurement" use:enhance>
										<input type="hidden" name="measurementId" value={m.id} />
										<button type="submit" class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--cream-400)] hover:text-red-400 hover:bg-red-50 cursor-pointer transition-all" title="Delete">
											<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Mobile bottom bar -->
<div class="fixed bottom-0 left-0 right-0 sm:hidden z-40 bg-white/90 backdrop-blur-md border-t border-[var(--cream-200)] px-4 py-3 flex items-center justify-between">
	<div class="flex gap-4 text-xs text-[var(--cream-600)]">
		{#each [
			{ type: 'weight' as MeasurementType, label: 'Wt', accent: 'var(--peach-500)' },
			{ type: 'height' as MeasurementType, label: 'Ht', accent: 'var(--mint-500)' },
			{ type: 'head' as MeasurementType, label: 'Hd', accent: 'var(--boy)' }
		] as stat}
			<div class="text-center">
				<div class="font-bold text-sm text-[var(--cream-700)]">{getLatestValue(stat.type)?.replace(' kg', '').replace(' cm', '') ?? '—'}</div>
				<div class="text-[10px] uppercase tracking-wider" style="color: {stat.accent}">{stat.label}</div>
			</div>
		{/each}
	</div>
	<button
		onclick={() => { resetAddForm(); showAddMeasurement = true; }}
		class="btn-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
	>
		<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
	</button>
</div>

<!-- Add Measurement Modal -->
{#if showAddMeasurement}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) showAddMeasurement = false }}
		role="dialog"
	>
		<div class="card p-8 w-[90%] max-w-md shadow-[var(--shadow-lg)] animate-in max-h-[90vh] overflow-y-auto">
			<h2 class="text-xl font-bold text-[var(--cream-700)] mb-5">Log Measurement</h2>

			<!-- AI Input -->
			<div class="mb-5 pb-5 border-b border-[var(--cream-200)]">
				<p class="text-xs text-[var(--cream-500)] mb-2 font-bold uppercase tracking-wider">AI Input</p>
				<AiMeasurementInput onparsed={handleAiParsed} />
				{#if aiTranscript}
					<p class="text-xs text-[var(--cream-400)] mt-2 italic">Heard: "{aiTranscript}"</p>
				{/if}
			</div>

			<!-- Manual form (pre-filled by AI) -->
			<form method="POST" action="?/addMeasurement" use:enhance={() => {
				return async ({ update }) => {
					await update();
					showAddMeasurement = false;
				};
			}}>
				<p class="text-xs text-[var(--cream-500)] mb-3 font-bold uppercase tracking-wider">Review & Save</p>

				<div class="mb-3">
					<label for="date" class="block text-xs font-semibold mb-1 text-[var(--cream-600)]">Date</label>
					<input
						id="date"
						name="date"
						type="date"
						bind:value={addDate}
						required
						class="input"
					/>
				</div>

				<div class="grid grid-cols-3 gap-3 mb-3">
					<div>
						<label for="weight" class="block text-xs font-semibold mb-1 text-[var(--cream-600)]">Weight (kg)</label>
						<input
							id="weight"
							name="weightKg"
							type="number"
							step="0.001"
							min="1"
							max="99"
							bind:value={addWeight}
							placeholder="8.25"
							class="input {addWeight ? '!border-[var(--mint-300)] !bg-[var(--mint-50)]' : ''}"
						/>
					</div>
					<div>
						<label for="height" class="block text-xs font-semibold mb-1 text-[var(--cream-600)]">Height (cm)</label>
						<input
							id="height"
							name="heightCm"
							type="number"
							step="0.1"
							bind:value={addHeight}
							placeholder="70"
							class="input {addHeight ? '!border-[var(--mint-300)] !bg-[var(--mint-50)]' : ''}"
						/>
					</div>
					<div>
						<label for="head" class="block text-xs font-semibold mb-1 text-[var(--cream-600)]">Head (cm)</label>
						<input
							id="head"
							name="headCircCm"
							type="number"
							step="0.1"
							bind:value={addHead}
							placeholder="44.5"
							class="input {addHead ? '!border-[var(--mint-300)] !bg-[var(--mint-50)]' : ''}"
						/>
					</div>
				</div>

				<p class="text-xs text-[var(--cream-400)] mb-5">AI-filled fields are highlighted. Edit anything before saving.</p>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={() => showAddMeasurement = false}
						class="btn-secondary px-5 py-2.5 text-sm"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn-primary px-5 py-2.5 text-sm"
					>
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Measurement Modal -->
{#if editingMeasurement}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) editingMeasurement = null }}
		role="dialog"
	>
		<div class="card p-8 w-[90%] max-w-md shadow-[var(--shadow-lg)] animate-in">
			<h2 class="text-xl font-bold text-[var(--cream-700)] mb-6">Edit Measurement</h2>

			<form method="POST" action="?/updateMeasurement" use:enhance={() => {
				return async ({ update }) => {
					await update();
					editingMeasurement = null;
				};
			}}>
				<input type="hidden" name="measurementId" value={editingMeasurement.id} />

				<div class="mb-4">
					<label for="edit-date" class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Date</label>
					<input
						id="edit-date"
						name="date"
						type="date"
						value={editingMeasurement.date}
						required
						class="input"
					/>
				</div>

				<div class="mb-4">
					<label for="edit-weight" class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Weight (kg)</label>
					<input
						id="edit-weight"
						name="weightKg"
						type="number"
						step="0.001"
						min="1"
						max="99"
						value={editingMeasurement.weightKg ?? ''}
						placeholder="e.g. 8.250"
						class="input"
					/>
				</div>

				<div class="mb-4">
					<label for="edit-height" class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Height (cm)</label>
					<input
						id="edit-height"
						name="heightCm"
						type="number"
						step="0.1"
						value={editingMeasurement.heightCm ?? ''}
						placeholder="e.g. 70"
						class="input"
					/>
				</div>

				<div class="mb-4">
					<label for="edit-head" class="block text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Head Circumference (cm)</label>
					<input
						id="edit-head"
						name="headCircCm"
						type="number"
						step="0.1"
						value={editingMeasurement.headCircCm ?? ''}
						placeholder="e.g. 44.5"
						class="input"
					/>
				</div>

				<p class="text-xs text-[var(--cream-400)] mb-5">You don't need to fill all fields --- log what you have!</p>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={() => editingMeasurement = null}
						class="btn-secondary px-5 py-2.5 text-sm"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn-primary px-5 py-2.5 text-sm"
					>
						Update
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
