<script lang="ts">
	type ParsedValues = {
		date?: string | null;
		weightKg?: number | null;
		heightCm?: number | null;
		headCircCm?: number | null;
		transcript?: string;
	};

	let { onparsed }: { onparsed: (values: ParsedValues) => void } = $props();

	type Mode = 'text' | 'voice' | 'image';
	let mode = $state<Mode>('text');
	let loading = $state(false);
	let error = $state('');
	let freeText = $state('');

	// Voice recording state
	let recording = $state(false);
	let mediaRecorder = $state<MediaRecorder | null>(null);
	let audioChunks = $state<Blob[]>([]);
	let recordingTime = $state(0);
	let recordingInterval = $state<ReturnType<typeof setInterval> | null>(null);

	// Image state
	let imagePreview = $state<string | null>(null);
	let imageFile = $state<File | null>(null);

	async function handleTextSubmit() {
		if (!freeText.trim()) return;
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/ai-parse', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: freeText })
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			onparsed(data);
			freeText = '';
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to parse text';
		} finally {
			loading = false;
		}
	}

	async function startRecording() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
			audioChunks = [];

			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) audioChunks.push(e.data);
			};

			recorder.onstop = async () => {
				stream.getTracks().forEach((t) => t.stop());
				if (recordingInterval) clearInterval(recordingInterval);
				recordingTime = 0;

				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				await sendAudio(audioBlob);
			};

			recorder.start();
			mediaRecorder = recorder;
			recording = true;
			recordingTime = 0;
			recordingInterval = setInterval(() => {
				recordingTime++;
			}, 1000);
		} catch {
			error = 'Could not access microphone. Please allow mic access.';
		}
	}

	function stopRecording() {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
			recording = false;
		}
	}

	async function sendAudio(blob: Blob) {
		loading = true;
		error = '';
		try {
			const formData = new FormData();
			formData.append('mode', 'voice');
			formData.append('audio', blob, 'recording.webm');

			const res = await fetch('/api/ai-parse', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			onparsed(data);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to process voice';
		} finally {
			loading = false;
		}
	}

	function handleImageSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		imageFile = file;
		const reader = new FileReader();
		reader.onload = () => {
			imagePreview = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function sendImage() {
		if (!imageFile) return;
		loading = true;
		error = '';
		try {
			const formData = new FormData();
			formData.append('mode', 'image');
			formData.append('image', imageFile);

			const res = await fetch('/api/ai-parse', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			onparsed(data);
			imagePreview = null;
			imageFile = null;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to process image';
		} finally {
			loading = false;
		}
	}

	function formatTime(s: number): string {
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
	}
</script>

<div class="space-y-3">
	<!-- Mode tabs -->
	<div class="flex bg-[var(--cream-100)] rounded-[var(--radius-sm)] p-1 text-xs">
		{#each [
			{ key: 'text' as Mode, label: 'Type' },
			{ key: 'voice' as Mode, label: 'Talk' },
			{ key: 'image' as Mode, label: 'Snap' }
		] as tab}
			<button
				type="button"
				onclick={() => { mode = tab.key; error = ''; }}
				class="flex-1 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer {mode === tab.key ? 'bg-white shadow-sm text-[var(--cream-700)]' : 'text-[var(--cream-500)] hover:text-[var(--cream-700)]'}"
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<!-- Text mode -->
	{#if mode === 'text'}
		<div>
			<textarea
				bind:value={freeText}
				placeholder={'e.g. "7.5 kg and 68 cm today"\nor "weight 16 lbs, height 27 inches"'}
				rows="2"
				class="input resize-none"
				onkeydown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						handleTextSubmit();
					}
				}}
			></textarea>
			<button
				type="button"
				onclick={handleTextSubmit}
				disabled={loading || !freeText.trim()}
				class="mt-2 w-full px-4 py-2.5 bg-[var(--accent)] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Parsing...' : 'Parse with AI'}
			</button>
		</div>
	{/if}

	<!-- Voice mode -->
	{#if mode === 'voice'}
		<div class="text-center py-2">
			{#if recording}
				<div class="space-y-3">
					<div class="flex items-center justify-center gap-2">
						<span class="w-3 h-3 bg-red-400 rounded-full animate-pulse"></span>
						<span class="text-sm font-mono text-red-500">{formatTime(recordingTime)}</span>
					</div>
					<p class="text-xs text-[var(--cream-500)]">Speak the measurements...</p>
					<button
						type="button"
						onclick={stopRecording}
						class="px-6 py-3 bg-red-400 text-white rounded-full font-bold text-sm hover:bg-red-500 transition-all cursor-pointer"
					>
						Stop
					</button>
				</div>
			{:else if loading}
				<div class="space-y-2 py-4">
					<div class="w-8 h-8 mx-auto border-2 border-[var(--mint-200)] border-t-[var(--accent)] rounded-full animate-spin"></div>
					<p class="text-xs text-[var(--cream-500)]">Transcribing & parsing...</p>
				</div>
			{:else}
				<div class="space-y-3">
					<p class="text-xs text-[var(--cream-500)]">Tap to record. Say something like:<br /><span class="italic">"7 and a half kilos, 68 centimeters, head 44"</span></p>
					<button
						type="button"
						onclick={startRecording}
						class="px-6 py-3 bg-[var(--accent)] text-white rounded-full font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
					>
						Start Recording
					</button>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Image mode -->
	{#if mode === 'image'}
		<div class="space-y-3">
			{#if imagePreview}
				<div class="relative">
					<img src={imagePreview} alt="Preview" class="w-full h-40 object-cover rounded-[var(--radius-sm)] border border-[var(--cream-200)]" />
					<button
						type="button"
						onclick={() => { imagePreview = null; imageFile = null; }}
						class="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center cursor-pointer hover:bg-black/70"
					>x</button>
				</div>
				<button
					type="button"
					onclick={sendImage}
					disabled={loading}
					class="w-full px-4 py-2.5 bg-[var(--accent)] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Analyzing...' : 'Extract from Photo'}
				</button>
			{:else}
				<label class="block cursor-pointer">
					<div class="border-2 border-dashed border-[var(--cream-300)] rounded-[var(--radius-sm)] p-6 text-center hover:border-[var(--accent)] hover:bg-[var(--mint-50)] transition-all">
						<div class="text-3xl mb-2">📷</div>
						<p class="text-sm text-[var(--cream-600)] font-semibold">Tap to take a photo or choose one</p>
						<p class="text-xs text-[var(--cream-400)] mt-1">Photo of a scale, tape measure, or doctor's notes</p>
					</div>
					<input
						type="file"
						accept="image/*"
						capture="environment"
						class="hidden"
						onchange={handleImageSelect}
					/>
				</label>
			{/if}
		</div>
	{/if}

	<!-- Error display -->
	{#if error}
		<p class="text-xs text-red-500 bg-red-50 rounded-[var(--radius-sm)] px-3 py-2">{error}</p>
	{/if}
</div>
