<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import GrowthChart from '$lib/components/GrowthChart.svelte';
	import AiMeasurementInput from '$lib/components/AiMeasurementInput.svelte';
	import { getPercentile, interpolateLMS, getLMSData } from '$lib/growth-data';
	import type { MeasurementType, Standard } from '$lib/growth-data/types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showAddMeasurement = $state(false);
	let showManualForm = $state(false);
	let editingMeasurement = $state<typeof data.measurements[number] | null>(null);
	let inviteUrl = $state('');
	let inviteCopied = $state(false);
	let showInvitePanel = $state(false);
	let savingMeasurement = $state(false);
	let updatingMeasurement = $state(false);
	let deletingMeasurementId = $state<string | null>(null);
	let generatingInvite = $state(false);
	let showHistory = $state(false);

	$effect(() => {
		if (form?.inviteToken) {
			inviteUrl = `${window.location.origin}/invite/${form.inviteToken}`;
			inviteCopied = false;
			showInvitePanel = true;
		}
	});

	async function copyInviteUrl() {
		await navigator.clipboard.writeText(inviteUrl);
		inviteCopied = true;
		setTimeout(() => inviteCopied = false, 2000);
	}

	function getWhatsAppShareUrl() {
		const text = `Hey! I want to share ${data.child.name}'s growth journey with you on BabyGrowth. Click here to join:\n\n${inviteUrl}`;
		return `https://wa.me/?text=${encodeURIComponent(text)}`;
	}

	// Auto-open measurement modal if ?addMeasurement=1
	$effect(() => {
		const url = $page.url;
		if (url.searchParams.get('addMeasurement') === '1') {
			resetAddForm();
			showAddMeasurement = true;
			// Clean up the URL
			const newUrl = new URL(url);
			newUrl.searchParams.delete('addMeasurement');
			history.replaceState({}, '', newUrl.pathname + newUrl.search);
		}
	});
	let childPhoto = $state<string | null>(data.child.photoUrl ?? null);
	let uploadingPhoto = $state(false);

	async function handlePhotoChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => { childPhoto = reader.result as string; };
		reader.readAsDataURL(file);

		const formData = new FormData();
		formData.append('photo', file);
		uploadingPhoto = true;
		try {
			const res = await fetch(`/api/children/${data.child.id}/photo`, {
				method: 'POST',
				body: formData
			});
			if (res.ok) {
				const json = await res.json();
				childPhoto = json.photoUrl;
			}
		} finally {
			uploadingPhoto = false;
		}
		input.value = '';
	}

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
		showManualForm = false;
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

	function handlePointClick(id: string) {
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
		return `${Math.round(getPercentile(last.value, lms))}%`;
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
		<label class="relative group cursor-pointer">
			{#if childPhoto}
				<img src={childPhoto} alt={child.name} class="w-16 h-16 rounded-full object-cover border-2 {sex === 'boy' ? 'border-[var(--boy)]' : 'border-[var(--girl)]'} shadow-[var(--shadow-sm)]" />
			{:else}
				<div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-[var(--shadow-sm)] {sex === 'boy' ? 'bg-[var(--boy-bg)]' : 'bg-[var(--girl-bg)]'}">
					{sex === 'boy' ? '👶' : '👧'}
				</div>
			{/if}
			<div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
				{#if uploadingPhoto}
					<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				{:else}
					<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
				{/if}
			</div>
			<input type="file" accept="image/*" class="hidden" onchange={handlePhotoChange} />
		</label>
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
				onclick={() => showInvitePanel = !showInvitePanel}
				class="btn-secondary px-4 py-2.5 text-sm flex items-center gap-1.5"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
				</svg>
				Share
			</button>
			<button
				onclick={() => { resetAddForm(); showAddMeasurement = true; }}
				class="btn-primary px-4 py-2.5 text-sm flex items-center gap-1.5"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
				Log Measurement
			</button>
		</div>
	</div>

	<!-- Joined success banner -->
	{#if $page.url.searchParams.get('joined') === '1'}
		<div class="mb-6 p-4 bg-[var(--mint-50)] border border-[var(--mint-200)] rounded-[var(--radius-sm)] flex items-center gap-3 animate-in">
			<span class="text-2xl">🎉</span>
			<div>
				<p class="font-bold text-[var(--cream-700)]">You're in!</p>
				<p class="text-sm text-[var(--cream-600)]">
					You now have access to {child.name}'s growth data. You can view charts and add measurements.
				</p>
			</div>
		</div>
	{/if}

	<!-- Share / Invite panel -->
	{#if showInvitePanel}
		<div class="card p-5 mb-6 animate-in">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-full bg-[var(--peach-100)] flex items-center justify-center">
						<svg class="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-bold text-[var(--cream-700)]">Share {child.name}'s profile</h3>
						<p class="text-xs text-[var(--cream-500)]">Send an invite link to your partner or caregiver</p>
					</div>
				</div>
				<button
					onclick={() => showInvitePanel = false}
					class="w-7 h-7 rounded-full flex items-center justify-center text-[var(--cream-400)] hover:bg-[var(--cream-100)] transition-all cursor-pointer"
				>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
				</button>
			</div>

			{#if inviteUrl}
				<div class="flex items-center gap-2 p-3 bg-[var(--cream-50)] rounded-[var(--radius-sm)] border border-[var(--cream-200)] mb-3">
					<input
						type="text"
						readonly
						value={inviteUrl}
						class="flex-1 bg-transparent text-sm text-[var(--cream-700)] outline-none truncate font-mono"
					/>
					<button
						onclick={copyInviteUrl}
						class="shrink-0 p-2 rounded-[var(--radius-sm)] hover:bg-[var(--cream-100)] transition-colors cursor-pointer"
						title="Copy link"
					>
						{#if inviteCopied}
							<svg class="w-4 h-4 text-[var(--mint-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
						{:else}
							<svg class="w-4 h-4 text-[var(--cream-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
						{/if}
					</button>
				</div>
				<div class="flex gap-2">
					<a
						href={getWhatsAppShareUrl()}
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[var(--radius-sm)] text-sm font-bold text-white transition-all hover:opacity-90 cursor-pointer"
						style="background: #25D366;"
					>
						<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
						</svg>
						WhatsApp
					</a>
					<button
						onclick={copyInviteUrl}
						class="flex-1 btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
					>
						{#if inviteCopied}
							<svg class="w-4 h-4 text-[var(--mint-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
							Copied!
						{:else}
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
							Copy Link
						{/if}
					</button>
				</div>
				<p class="text-xs text-[var(--cream-400)] mt-3 text-center">Link expires in 48 hours. One-time use.</p>
			{:else}
				{#if form?.error && !form?.inviteToken}
					<div class="mb-3 p-3 bg-red-50 border border-red-200 rounded-[var(--radius-sm)] text-sm text-red-600">
						{form.error}
					</div>
				{/if}
				<form method="POST" action="?/createInvite" use:enhance={() => {
					generatingInvite = true;
					return async ({ update }) => {
						await update();
						generatingInvite = false;
					};
				}}>
					<button type="submit" disabled={generatingInvite} class="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
						{#if generatingInvite}
							<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
							Generating...
						{:else}
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
							</svg>
							Generate Invite Link
						{/if}
					</button>
				</form>
			{/if}
		</div>
	{/if}

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
			onpointclick={handlePointClick}
		/>

		<!-- Legend -->
		<div class="flex gap-5 mt-4 flex-wrap text-xs text-[var(--cream-500)]">
			<div class="flex items-center gap-1.5"><div class="w-5 h-0.5 rounded" style="background: #e2dbd0"></div> 3% / 97%</div>
			<div class="flex items-center gap-1.5"><div class="w-5 h-0.5 rounded" style="background: #a8e0c8"></div> 15% / 85%</div>
			<div class="flex items-center gap-1.5"><div class="w-5 h-[2px] rounded" style="background: #5bb890"></div> 50%</div>
			<div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"></div> {child.name}</div>
		</div>

		{#if standard === 'cdc'}
			<p class="text-xs text-amber-600 mt-3 flex items-center gap-1">
				<svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
				CDC charts cover 0-36 months. For ages beyond 3 years, switch to WHO.
			</p>
		{/if}
	</div>

	<!-- Share with partner CTA -->
	<div class="card p-5 mb-5 flex items-center gap-4">
		<div class="w-10 h-10 rounded-full bg-[var(--peach-50)] flex items-center justify-center shrink-0">
			<svg class="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
			</svg>
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-sm font-bold text-[var(--cream-700)]">Share with your partner</p>
			<p class="text-xs text-[var(--cream-500)]">Let them view and log {child.name}'s measurements too</p>
		</div>
		<button
			onclick={() => showInvitePanel = !showInvitePanel}
			class="btn-primary px-4 py-2 text-sm shrink-0 flex items-center gap-1.5"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
			</svg>
			Share
		</button>
	</div>

	<!-- Measurements table (collapsible) -->
	<div class="card">
		<button
			onclick={() => showHistory = !showHistory}
			class="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-[var(--cream-50)] transition-colors rounded-[var(--radius)]"
		>
			<div class="flex items-center gap-2">
				<h2 class="text-lg font-bold text-[var(--cream-700)]">Measurement History</h2>
				{#if data.measurements.length > 0}
					<span class="px-2 py-0.5 bg-[var(--cream-100)] rounded-full text-xs font-bold text-[var(--cream-500)]">{data.measurements.length}</span>
				{/if}
			</div>
			<svg class="w-5 h-5 text-[var(--cream-400)] transition-transform {showHistory ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
		</button>

		{#if showHistory}
			<div class="px-6 pb-6">
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
											<form method="POST" action="?/deleteMeasurement" use:enhance={() => {
												deletingMeasurementId = m.id;
												return async ({ update }) => {
													await update();
													deletingMeasurementId = null;
												};
											}}>
												<input type="hidden" name="measurementId" value={m.id} />
												<button type="submit" disabled={deletingMeasurementId === m.id} class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--cream-400)] hover:text-red-400 hover:bg-red-50 cursor-pointer transition-all disabled:opacity-50" title="Delete">
													{#if deletingMeasurementId === m.id}
														<svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
													{:else}
														<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
													{/if}
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
		{/if}
	</div>
</div>

<!-- Mobile bottom bar -->
<div class="fixed bottom-0 left-0 right-0 sm:hidden z-40 bg-white/95 backdrop-blur-md border-t border-[var(--cream-200)] flex items-center px-5 py-3">
	<button
		onclick={() => showInvitePanel = !showInvitePanel}
		class="w-9 h-9 rounded-full flex items-center justify-center text-[var(--cream-400)] hover:text-[var(--cream-600)] transition-colors cursor-pointer"
	>
		<svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
		</svg>
	</button>
	<div class="flex-1 flex justify-center">
		<button
			onclick={() => { resetAddForm(); showAddMeasurement = true; }}
			class="btn-primary w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(232,120,92,0.35)]"
		>
			<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
		</button>
	</div>
	<div class="w-9"></div>
</div>

<!-- Add Measurement: Bottom Sheet (mobile) / Centered Modal (desktop) -->
{#if showAddMeasurement}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 bg-black/20 z-50 backdrop-blur-[2px] sm:flex sm:items-center sm:justify-center"
		onclick={(e) => { if (e.target === e.currentTarget) showAddMeasurement = false }}
		role="dialog"
		style="animation: fadeOverlay 0.2s ease-out"
	>
		<!-- Mobile: bottom sheet / Desktop: centered card -->
		<div class="measurement-sheet absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] max-h-[85vh] overflow-y-auto sm:static sm:w-full sm:max-w-md sm:rounded-[var(--radius)] sm:shadow-[var(--shadow-lg)] sm:max-h-[80vh]" style="animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)">
			<!-- Drag handle (mobile only) -->
			<div class="flex justify-center pt-3 pb-1 sm:hidden">
				<div class="w-10 h-1 rounded-full bg-[var(--cream-300)]"></div>
			</div>

			<div class="px-5 pb-6 pt-2 sm:p-7">
				<!-- Header row -->
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-bold text-[var(--cream-700)]">Log Measurement</h2>
					<button
						type="button"
						onclick={() => showAddMeasurement = false}
						class="w-8 h-8 rounded-full flex items-center justify-center text-[var(--cream-400)] hover:bg-[var(--cream-100)] transition-all cursor-pointer"
					>
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
					</button>
				</div>

				<!-- AI Input bar -->
				<AiMeasurementInput onparsed={handleAiParsed} />
				{#if aiTranscript}
					<p class="text-xs text-[var(--cream-400)] mt-2 px-1 italic">Heard: "{aiTranscript}"</p>
				{/if}

				<!-- Parsed values as editable chips -->
				{#if addWeight || addHeight || addHead}
					<form method="POST" action="?/addMeasurement" use:enhance={() => {
						savingMeasurement = true;
						return async ({ update }) => {
							await update();
							savingMeasurement = false;
							showAddMeasurement = false;
						};
					}}>
						<input type="hidden" name="date" value={addDate} />
						<input type="hidden" name="weightKg" value={addWeight} />
						<input type="hidden" name="heightCm" value={addHeight} />
						<input type="hidden" name="headCircCm" value={addHead} />

						<div class="mt-4 p-4 bg-[var(--cream-50)] rounded-[var(--radius)] border border-[var(--cream-200)]" style="animation: fadeIn 0.3s ease-out">
							<!-- Date chip -->
							<div class="flex items-center gap-2 mb-3">
								<span class="text-xs text-[var(--cream-500)]">Date</span>
								<input
									type="date"
									bind:value={addDate}
									class="text-sm font-medium text-[var(--cream-700)] bg-white border border-[var(--cream-200)] rounded-lg px-2.5 py-1 cursor-pointer"
								/>
							</div>

							<!-- Value chips -->
							<div class="flex flex-wrap gap-2 mb-4">
								{#if addWeight}
									<div class="flex items-center gap-1.5 bg-white border border-[var(--peach-200)] rounded-full pl-3 pr-1 py-1">
										<span class="text-xs text-[var(--cream-500)]">Weight</span>
										<input
											type="number"
											step="0.001"
											min="1"
											max="99"
											bind:value={addWeight}
											class="w-16 text-sm font-bold text-[var(--cream-700)] bg-transparent outline-none text-center"
										/>
										<span class="text-xs text-[var(--cream-500)] pr-1.5">kg</span>
										<button type="button" onclick={() => addWeight = ''} class="w-5 h-5 rounded-full flex items-center justify-center text-[var(--cream-400)] hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer text-xs">&times;</button>
									</div>
								{/if}
								{#if addHeight}
									<div class="flex items-center gap-1.5 bg-white border border-[var(--mint-200)] rounded-full pl-3 pr-1 py-1">
										<span class="text-xs text-[var(--cream-500)]">Height</span>
										<input
											type="number"
											step="0.1"
											bind:value={addHeight}
											class="w-14 text-sm font-bold text-[var(--cream-700)] bg-transparent outline-none text-center"
										/>
										<span class="text-xs text-[var(--cream-500)] pr-1.5">cm</span>
										<button type="button" onclick={() => addHeight = ''} class="w-5 h-5 rounded-full flex items-center justify-center text-[var(--cream-400)] hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer text-xs">&times;</button>
									</div>
								{/if}
								{#if addHead}
									<div class="flex items-center gap-1.5 bg-white border border-[var(--boy)] border-opacity-30 rounded-full pl-3 pr-1 py-1" style="border-color: color-mix(in srgb, var(--boy) 30%, transparent)">
										<span class="text-xs text-[var(--cream-500)]">Head</span>
										<input
											type="number"
											step="0.1"
											bind:value={addHead}
											class="w-14 text-sm font-bold text-[var(--cream-700)] bg-transparent outline-none text-center"
										/>
										<span class="text-xs text-[var(--cream-500)] pr-1.5">cm</span>
										<button type="button" onclick={() => addHead = ''} class="w-5 h-5 rounded-full flex items-center justify-center text-[var(--cream-400)] hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer text-xs">&times;</button>
									</div>
								{/if}
							</div>

							<!-- Save button -->
							<button
								type="submit"
								disabled={savingMeasurement}
								class="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
							>
								{#if savingMeasurement}
									<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
									Saving...
								{:else}
									<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
									Save Measurement
								{/if}
							</button>
						</div>
					</form>
				{/if}

				<!-- Manual entry toggle -->
				{#if !showManualForm && !addWeight && !addHeight && !addHead}
					<button
						type="button"
						onclick={() => showManualForm = true}
						class="mt-3 text-xs text-[var(--cream-400)] hover:text-[var(--cream-600)] transition-colors cursor-pointer w-full text-center py-2"
					>
						or enter manually
					</button>
				{/if}

				<!-- Manual form (hidden by default) -->
				{#if showManualForm && !addWeight && !addHeight && !addHead}
					<form method="POST" action="?/addMeasurement" use:enhance={() => {
						savingMeasurement = true;
						return async ({ update }) => {
							await update();
							savingMeasurement = false;
							showAddMeasurement = false;
							showManualForm = false;
						};
					}} class="mt-4" style="animation: fadeIn 0.3s ease-out">
						<div class="mb-3">
							<label for="date" class="block text-xs font-semibold mb-1 text-[var(--cream-600)]">Date</label>
							<input id="date" name="date" type="date" bind:value={addDate} required class="input" />
						</div>

						<div class="grid grid-cols-3 gap-3 mb-4">
							<div>
								<label for="weight" class="block text-xs font-semibold mb-1 text-[var(--cream-600)]">Weight</label>
								<div class="relative">
									<input id="weight" name="weightKg" type="number" step="0.001" min="1" max="99" bind:value={addWeight} placeholder="8.25" class="input pr-8" />
									<span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--cream-400)]">kg</span>
								</div>
							</div>
							<div>
								<label for="height" class="block text-xs font-semibold mb-1 text-[var(--cream-600)]">Height</label>
								<div class="relative">
									<input id="height" name="heightCm" type="number" step="0.1" bind:value={addHeight} placeholder="70" class="input pr-8" />
									<span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--cream-400)]">cm</span>
								</div>
							</div>
							<div>
								<label for="head" class="block text-xs font-semibold mb-1 text-[var(--cream-600)]">Head</label>
								<div class="relative">
									<input id="head" name="headCircCm" type="number" step="0.1" bind:value={addHead} placeholder="44.5" class="input pr-8" />
									<span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--cream-400)]">cm</span>
								</div>
							</div>
						</div>

						<button type="submit" disabled={savingMeasurement} class="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
							{#if savingMeasurement}
								<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
								Saving...
							{:else}
								Save Measurement
							{/if}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Edit Measurement: Bottom drawer (mobile) / Modal (desktop) -->
{#if editingMeasurement}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 bg-black/20 sm:bg-black/30 z-50 sm:flex sm:items-center sm:justify-center sm:backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) editingMeasurement = null }}
		role="dialog"
		style="animation: fadeOverlay 0.2s ease-out"
	>
		<!-- Mobile: bottom drawer / Desktop: centered card -->
		<div class="measurement-sheet absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] max-h-[85vh] overflow-y-auto sm:static sm:rounded-[var(--radius)] sm:w-[90%] sm:max-w-md sm:shadow-[var(--shadow-lg)]" style="animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)">
			<!-- Drag handle (mobile only) -->
			<div class="flex justify-center pt-3 pb-1 sm:hidden">
				<div class="w-10 h-1 rounded-full bg-[var(--cream-300)]"></div>
			</div>

			<div class="px-5 pb-6 pt-2 sm:p-8">
				<!-- Header -->
				<div class="flex items-center justify-between mb-5">
					<h2 class="text-lg sm:text-xl font-bold text-[var(--cream-700)]">Edit Measurement</h2>
					<button
						type="button"
						onclick={() => editingMeasurement = null}
						class="w-8 h-8 rounded-full flex items-center justify-center text-[var(--cream-400)] hover:bg-[var(--cream-100)] transition-all cursor-pointer"
					>
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
					</button>
				</div>

				<form method="POST" action="?/updateMeasurement" use:enhance={() => {
					updatingMeasurement = true;
					return async ({ update }) => {
						await update();
						updatingMeasurement = false;
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

					<div class="grid grid-cols-3 gap-3 mb-4 sm:grid-cols-1 sm:gap-4">
						<div>
							<label for="edit-weight" class="block text-xs sm:text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Weight</label>
							<div class="relative">
								<input
									id="edit-weight"
									name="weightKg"
									type="number"
									step="0.001"
									min="1"
									max="99"
									value={editingMeasurement.weightKg ?? ''}
									placeholder="8.25"
									class="input pr-8"
								/>
								<span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--cream-400)]">kg</span>
							</div>
						</div>

						<div>
							<label for="edit-height" class="block text-xs sm:text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Height</label>
							<div class="relative">
								<input
									id="edit-height"
									name="heightCm"
									type="number"
									step="0.1"
									value={editingMeasurement.heightCm ?? ''}
									placeholder="70"
									class="input pr-8"
								/>
								<span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--cream-400)]">cm</span>
							</div>
						</div>

						<div>
							<label for="edit-head" class="block text-xs sm:text-sm font-semibold mb-1.5 text-[var(--cream-600)]">Head</label>
							<div class="relative">
								<input
									id="edit-head"
									name="headCircCm"
									type="number"
									step="0.1"
									value={editingMeasurement.headCircCm ?? ''}
									placeholder="44.5"
									class="input pr-8"
								/>
								<span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--cream-400)]">cm</span>
							</div>
						</div>
					</div>

					<p class="text-xs text-[var(--cream-400)] mb-4">Log what you have — no need to fill everything!</p>

					<!-- Mobile: stacked buttons / Desktop: inline -->
					<div class="flex flex-col sm:flex-row sm:justify-end gap-2">
						<button
							type="submit"
							disabled={updatingMeasurement}
							class="w-full sm:w-auto btn-primary px-5 py-3 sm:py-2.5 text-sm flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-60"
						>
							{#if updatingMeasurement}
								<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
								Updating...
							{:else}
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
								Update
							{/if}
						</button>
						<button
							type="button"
							onclick={() => editingMeasurement = null}
							class="w-full sm:w-auto btn-secondary px-5 py-3 sm:py-2.5 text-sm order-2 sm:order-1"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
