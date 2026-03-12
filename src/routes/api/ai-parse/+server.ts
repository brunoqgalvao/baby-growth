import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const EXTRACTION_PROMPT = `You are a baby measurement extractor. From the user's input, extract any baby/infant measurement data.

Return ONLY valid JSON with this exact shape (use null for missing values):
{"date": "YYYY-MM-DD or null", "weightKg": number or null, "heightCm": number or null, "headCircCm": number or null}

Rules:
- Weight: convert to kg (e.g. "7500g" → 7.5, "16 lbs" → 7.257, "7.5 kilos" → 7.5)
- Height/length: convert to cm (e.g. "68cm" → 68, "27 inches" → 68.58)
- Head circumference: convert to cm
- Date: if "today" use null (frontend will use today). If "yesterday" or relative dates, calculate from today's date.
- If a value looks like it could be weight OR height, use context clues (e.g. 7.5 is likely kg, 68 is likely cm)
- If the input is a photo of a scale, extract the weight reading
- If the input is a photo of a measuring tape, extract the length reading
- Return ONLY the JSON object, no markdown, no explanation`;

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!OPENAI_API_KEY) {
		return json({ error: 'OpenAI API key not configured' }, { status: 500 });
	}

	const contentType = request.headers.get('content-type') || '';

	try {
		// Handle multipart form data (voice or image)
		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const mode = formData.get('mode') as string;

			if (mode === 'voice') {
				return await handleVoice(formData);
			} else if (mode === 'image') {
				return await handleImage(formData);
			}
		}

		// Handle JSON body (free text)
		if (contentType.includes('application/json')) {
			const { text } = await request.json();
			if (!text || typeof text !== 'string') {
				return json({ error: 'No text provided' }, { status: 400 });
			}
			return await handleText(text);
		}

		return json({ error: 'Invalid request format' }, { status: 400 });
	} catch (err) {
		console.error('AI parse error:', err);
		return json({ error: 'Failed to parse input' }, { status: 500 });
	}
};

async function handleVoice(formData: FormData): Promise<Response> {
	const audioFile = formData.get('audio') as File;
	if (!audioFile) {
		return json({ error: 'No audio file provided' }, { status: 400 });
	}

	// Step 1: Transcribe with Whisper
	const transcription = await openai.audio.transcriptions.create({
		model: 'whisper-1',
		file: audioFile,
		language: 'en'
	});

	const transcript = transcription.text;

	// Step 2: Parse the transcript
	const result = await parseWithGPT(transcript);

	return json({ ...result, transcript });
}

async function handleImage(formData: FormData): Promise<Response> {
	const imageFile = formData.get('image') as File;
	if (!imageFile) {
		return json({ error: 'No image file provided' }, { status: 400 });
	}

	const buffer = await imageFile.arrayBuffer();
	const base64 = Buffer.from(buffer).toString('base64');
	const mimeType = imageFile.type || 'image/jpeg';

	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: EXTRACTION_PROMPT },
			{
				role: 'user',
				content: [
					{
						type: 'image_url',
						image_url: { url: `data:${mimeType};base64,${base64}` }
					},
					{
						type: 'text',
						text: 'Extract the measurement value(s) from this image.'
					}
				]
			}
		],
		max_tokens: 200
	});

	const raw = completion.choices[0]?.message?.content?.trim() || '{}';
	return json(safeParseJSON(raw));
}

async function handleText(text: string): Promise<Response> {
	const result = await parseWithGPT(text);
	return json(result);
}

async function parseWithGPT(text: string): Promise<Record<string, unknown>> {
	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: EXTRACTION_PROMPT },
			{ role: 'user', content: text }
		],
		max_tokens: 200
	});

	const raw = completion.choices[0]?.message?.content?.trim() || '{}';
	return safeParseJSON(raw);
}

function safeParseJSON(raw: string): Record<string, unknown> {
	// Strip markdown code fences if present
	const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
	try {
		const parsed = JSON.parse(cleaned);
		return {
			date: typeof parsed.date === 'string' ? parsed.date : null,
			weightKg: typeof parsed.weightKg === 'number' ? parsed.weightKg : null,
			heightCm: typeof parsed.heightCm === 'number' ? parsed.heightCm : null,
			headCircCm: typeof parsed.headCircCm === 'number' ? parsed.headCircCm : null
		};
	} catch {
		return { date: null, weightKg: null, heightCm: null, headCircCm: null, error: 'Could not parse AI response' };
	}
}
