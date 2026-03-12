<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import GrowthChart from '$lib/components/GrowthChart.svelte';
	import { getPercentile, interpolateLMS, getLMSData } from '$lib/growth-data';
	import type { MeasurementType, Standard } from '$lib/growth-data/types';

	let { data }: { data: PageData } = $props();
	let showAddMeasurement = $state(false);
	let editingMeasurement = $state<typeof data.measurements[number] | null>(null);
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

	const today = new Date().toISOString().split('T')[0];
</script>

<!-- Nav -->
<nav class="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
	<a href="/dashboard" class="text-xl font-bold text-[var(--primary)] flex items-center gap-2">
		👶 BabyGrowth
	</a>
	<a href="/dashboard" class="text-sm text-stone-500 hover:text-stone-700">&larr; Back</a>
</nav>

<div class="max-w-4xl mx-auto px-4 py-6">
	<!-- Child header -->
	<div class="flex items-center gap-4 mb-6 flex-wrap">
		<div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl {sex === 'boy' ? 'bg-blue-50' : 'bg-pink-50'}">
			{sex === 'boy' ? '👶' : '👧'}
		</div>
		<div>
			<h1 class="text-2xl font-bold">{child.name}</h1>
			<p class="text-sm text-stone-500">{getAge()} &middot; {sex === 'boy' ? 'Boy' : 'Girl'} &middot; Born {formatDate(child.dateOfBirth)}</p>
		</div>
		<div class="ml-auto flex gap-2 flex-wrap">
			<button
				onclick={() => showAddMeasurement = true}
				class="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
			>
				+ Log Measurement
			</button>
		</div>
	</div>

	<!-- Summary stats -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
		{#each [
			{ type: 'weight' as MeasurementType, icon: '⚖️', label: 'Weight' },
			{ type: 'height' as MeasurementType, icon: '📏', label: 'Height' },
			{ type: 'head' as MeasurementType, icon: '🧠', label: 'Head Circ.' }
		] as stat}
			<div class="text-center p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
				<div class="text-xl mb-1">{stat.icon}</div>
				<div class="text-xl font-bold">{getLatestValue(stat.type) ?? '—'}</div>
				<div class="text-xs text-stone-500 mt-0.5">{stat.label}</div>
				{#if getLatestPercentile(stat.type)}
					<div class="text-xs text-green-600 font-semibold mt-0.5">{getLatestPercentile(stat.type)}</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Growth Chart -->
	<div class="bg-white rounded-xl border border-stone-200 shadow-sm p-5 mb-4">
		<div class="flex items-center justify-between mb-4 flex-wrap gap-3">
			<h2 class="text-lg font-bold">Growth Chart</h2>
			<div class="flex gap-2 items-center">
				<!-- Standard toggle -->
				<div class="flex bg-stone-100 rounded-lg p-1 text-xs">
					<button
						onclick={() => standard = 'who'}
						class="px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer {standard === 'who' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}"
					>
						WHO
					</button>
					<button
						onclick={() => standard = 'cdc'}
						class="px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer {standard === 'cdc' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}"
					>
						CDC
					</button>
				</div>
				<!-- Measurement type toggle -->
				<div class="flex bg-stone-100 rounded-lg p-1 text-xs">
					{#each [
						{ key: 'weight' as MeasurementType, label: 'Weight' },
						{ key: 'height' as MeasurementType, label: 'Height' },
						{ key: 'head' as MeasurementType, label: 'Head' }
					] as tab}
						<button
							onclick={() => activeChart = tab.key}
							class="px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer {activeChart === tab.key ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}"
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
		<div class="flex gap-4 mt-3 flex-wrap text-xs text-stone-500">
			<div class="flex items-center gap-1.5"><div class="w-5 h-0.5 bg-stone-300 rounded"></div> 3rd / 97th</div>
			<div class="flex items-center gap-1.5"><div class="w-5 h-0.5 bg-blue-300 rounded"></div> 15th / 85th</div>
			<div class="flex items-center gap-1.5"><div class="w-5 h-[2px] bg-blue-400 rounded"></div> 50th</div>
			<div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"></div> {child.name}</div>
		</div>

		{#if standard === 'cdc'}
			<p class="text-xs text-amber-600 mt-2">CDC charts cover 0-36 months. For ages beyond 3 years, switch to WHO.</p>
		{/if}
	</div>

	<!-- Measurements table -->
	<div class="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-bold">Measurement History</h2>
			<button
				onclick={() => showAddMeasurement = true}
				class="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
			>
				+ Add
			</button>
		</div>

		{#if data.measurements.length === 0}
			<p class="text-stone-400 text-sm italic py-8 text-center">No measurements yet. Add one to get started!</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b-2 border-stone-200">
							<th class="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Date</th>
							<th class="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Age</th>
							<th class="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Weight</th>
							<th class="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Height</th>
							<th class="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Head</th>
							<th class="py-2 px-3"></th>
						</tr>
					</thead>
					<tbody>
						{#each [...data.measurements].reverse() as m}
							<tr class="border-b border-stone-100 hover:bg-stone-50">
								<td class="py-3 px-3">{formatDate(m.date)}</td>
								<td class="py-3 px-3 text-stone-500">{getAgeLabel(m.date)}</td>
								<td class="py-3 px-3">{m.weightKg ? `${m.weightKg} kg` : '—'}</td>
								<td class="py-3 px-3">{m.heightCm ? `${m.heightCm} cm` : '—'}</td>
								<td class="py-3 px-3">{m.headCircCm ? `${m.headCircCm} cm` : '—'}</td>
								<td class="py-3 px-3 flex gap-1">
									<button
										onclick={() => editingMeasurement = m}
										class="text-stone-400 hover:text-blue-500 cursor-pointer"
										title="Edit"
									>✏️</button>
									<form method="POST" action="?/deleteMeasurement" use:enhance>
										<input type="hidden" name="measurementId" value={m.id} />
										<button type="submit" class="text-stone-400 hover:text-red-500 cursor-pointer" title="Delete">🗑️</button>
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

<!-- Add Measurement Modal -->
{#if showAddMeasurement}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) showAddMeasurement = false }}
		role="dialog"
	>
		<div class="bg-white rounded-2xl p-7 w-[90%] max-w-md shadow-xl">
			<h2 class="text-xl font-bold mb-5">Log Measurement</h2>

			<form method="POST" action="?/addMeasurement" use:enhance={() => {
				return async ({ update }) => {
					await update();
					showAddMeasurement = false;
				};
			}}>
				<div class="mb-4">
					<label for="date" class="block text-sm font-semibold mb-1.5">Date</label>
					<input
						id="date"
						name="date"
						type="date"
						value={today}
						required
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<div class="mb-4">
					<label for="weight" class="block text-sm font-semibold mb-1.5">Weight (kg)</label>
					<input
						id="weight"
						name="weightKg"
						type="number"
						step="0.001"
						min="1"
						max="99"
						placeholder="e.g. 8.250"
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<div class="mb-4">
					<label for="height" class="block text-sm font-semibold mb-1.5">Height (cm)</label>
					<input
						id="height"
						name="heightCm"
						type="number"
						step="0.1"
						placeholder="e.g. 70"
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<div class="mb-4">
					<label for="head" class="block text-sm font-semibold mb-1.5">Head Circumference (cm)</label>
					<input
						id="head"
						name="headCircCm"
						type="number"
						step="0.1"
						placeholder="e.g. 44.5"
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<p class="text-xs text-stone-400 mb-4">You don't need to fill all fields — log what you have!</p>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={() => showAddMeasurement = false}
						class="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-lg font-semibold text-sm border border-stone-200 hover:bg-stone-200 transition-all cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
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
		class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) editingMeasurement = null }}
		role="dialog"
	>
		<div class="bg-white rounded-2xl p-7 w-[90%] max-w-md shadow-xl">
			<h2 class="text-xl font-bold mb-5">Edit Measurement</h2>

			<form method="POST" action="?/updateMeasurement" use:enhance={() => {
				return async ({ update }) => {
					await update();
					editingMeasurement = null;
				};
			}}>
				<input type="hidden" name="measurementId" value={editingMeasurement.id} />

				<div class="mb-4">
					<label for="edit-date" class="block text-sm font-semibold mb-1.5">Date</label>
					<input
						id="edit-date"
						name="date"
						type="date"
						value={editingMeasurement.date}
						required
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<div class="mb-4">
					<label for="edit-weight" class="block text-sm font-semibold mb-1.5">Weight (kg)</label>
					<input
						id="edit-weight"
						name="weightKg"
						type="number"
						step="0.001"
						min="1"
						max="99"
						value={editingMeasurement.weightKg ?? ''}
						placeholder="e.g. 8.250"
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<div class="mb-4">
					<label for="edit-height" class="block text-sm font-semibold mb-1.5">Height (cm)</label>
					<input
						id="edit-height"
						name="heightCm"
						type="number"
						step="0.1"
						value={editingMeasurement.heightCm ?? ''}
						placeholder="e.g. 70"
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<div class="mb-4">
					<label for="edit-head" class="block text-sm font-semibold mb-1.5">Head Circumference (cm)</label>
					<input
						id="edit-head"
						name="headCircCm"
						type="number"
						step="0.1"
						value={editingMeasurement.headCircCm ?? ''}
						placeholder="e.g. 44.5"
						class="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
					/>
				</div>

				<p class="text-xs text-stone-400 mb-4">You don't need to fill all fields — log what you have!</p>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={() => editingMeasurement = null}
						class="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-lg font-semibold text-sm border border-stone-200 hover:bg-stone-200 transition-all cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
					>
						Update
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
