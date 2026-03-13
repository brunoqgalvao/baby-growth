<script lang="ts">
	type ParsedValues = {
		date?: string | null;
		weightKg?: number | null;
		heightCm?: number | null;
		headCircCm?: number | null;
		transcript?: string;
	};

	let { onparsed }: { onparsed: (values: ParsedValues) => void } = $props();

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
			error = e instanceof Error ? e.message : 'Failed to parse';
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
			error = 'Could not access microphone';
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

	let fileInput: HTMLInputElement;
</script>

{#if recording}
	<!-- Recording indicator -->
	<div class="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-[var(--radius-sm)]">
		<span class="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse shrink-0"></span>
		<span class="text-sm text-red-600 font-medium flex-1">Listening... <span class="font-mono text-xs opacity-70">{formatTime(recordingTime)}</span></span>
		<button
			type="button"
			onclick={stopRecording}
			class="px-3 py-1.5 bg-red-400 text-white rounded-full text-xs font-bold hover:bg-red-500 transition-all cursor-pointer"
		>
			Done
		</button>
	</div>
{:else if loading}
	<!-- Loading spinner -->
	<div class="flex items-center gap-3 px-4 py-3">
		<div class="w-5 h-5 border-2 border-[var(--cream-200)] border-t-[var(--accent)] rounded-full animate-spin shrink-0"></div>
		<span class="text-sm text-[var(--cream-500)]">Understanding...</span>
	</div>
{:else if imagePreview}
	<!-- Image preview bar -->
	<div class="flex items-center gap-3 px-3 py-2">
		<div class="relative">
			<img src={imagePreview} alt="Preview" class="w-12 h-12 object-cover rounded-lg border border-[var(--cream-200)]" />
			<button
				type="button"
				onclick={() => { imagePreview = null; imageFile = null; }}
				class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--cream-600)] text-white rounded-full text-[10px] flex items-center justify-center cursor-pointer hover:bg-[var(--cream-700)]"
			>&times;</button>
		</div>
		<span class="text-sm text-[var(--cream-500)] flex-1">Photo ready</span>
		<button
			type="button"
			onclick={sendImage}
			class="px-4 py-2 bg-[var(--accent)] text-white rounded-full text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
		>
			Extract
		</button>
	</div>
{:else}
	<!-- Main input bar -->
	<div class="flex items-center gap-2 bg-[var(--cream-100)] rounded-full px-3 py-1.5">
		<!-- Attachment button (camera/image) -->
		<button
			type="button"
			onclick={() => fileInput.click()}
			class="w-8 h-8 rounded-full flex items-center justify-center text-[var(--cream-400)] hover:text-[var(--cream-600)] hover:bg-[var(--cream-200)] transition-all cursor-pointer shrink-0"
			title="Photo"
		>
			<svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
		</button>

		<input
			type="file"
			accept="image/*"
			capture="environment"
			class="hidden"
			bind:this={fileInput}
			onchange={handleImageSelect}
		/>

		<!-- Text input -->
		<input
			type="text"
			bind:value={freeText}
			placeholder="7.5 kg, 68 cm today..."
			class="flex-1 bg-transparent text-sm text-[var(--cream-700)] placeholder:text-[var(--cream-400)] py-2 outline-none min-w-0"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					handleTextSubmit();
				}
			}}
		/>

		<!-- Mic / Send button -->
		{#if freeText.trim()}
			<button
				type="button"
				onclick={handleTextSubmit}
				class="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shrink-0"
				title="Send"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"/></svg>
			</button>
		{:else}
			<button
				type="button"
				onclick={startRecording}
				class="w-8 h-8 rounded-full flex items-center justify-center text-[var(--cream-400)] hover:text-[var(--accent)] hover:bg-[var(--mint-50)] transition-all cursor-pointer shrink-0"
				title="Voice input"
			>
				<svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>
			</button>
		{/if}
	</div>
{/if}

{#if error}
	<p class="text-xs text-red-500 mt-1.5 px-3">{error}</p>
{/if}
