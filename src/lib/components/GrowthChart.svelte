<script lang="ts">
	import {
		getLMSData,
		getMaxMonths,
		getUnit,
		getLabel,
		generatePercentileCurves,
		getPercentile,
		interpolateLMS,
		PERCENTILE_LINES
	} from '$lib/growth-data';
	import type { MeasurementType, Sex, Standard } from '$lib/growth-data/types';

	interface DataPoint {
		month: number;
		value: number;
		id?: string;
	}

	let {
		sex,
		standard = 'who',
		measurementType = 'weight',
		dataPoints = [],
		onpointclick
	}: {
		sex: Sex;
		standard?: Standard;
		measurementType?: MeasurementType;
		dataPoints?: DataPoint[];
		onpointclick?: (id: string) => void;
	} = $props();

	let canvas: HTMLCanvasElement;
	let pointPositions: { x: number; y: number; id?: string }[] = [];

	// Zoom state
	let zoomMonthMin = $state<number | null>(null);
	let zoomMonthMax = $state<number | null>(null);
	let zoomValueMin = $state<number | null>(null);
	let zoomValueMax = $state<number | null>(null);
	let isZoomed = $derived(zoomMonthMin !== null);

	// Drag selection state
	let isDragging = $state(false);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let dragCurrentX = $state(0);
	let dragCurrentY = $state(0);

	// Store inverse mapping functions for pixel -> data conversion
	let inverseX: ((px: number) => number) | null = null;
	let inverseY: ((py: number) => number) | null = null;

	export function resetZoom() {
		zoomMonthMin = null;
		zoomMonthMax = null;
		zoomValueMin = null;
		zoomValueMax = null;
	}

	// Reset zoom when props change
	$effect(() => {
		sex; standard; measurementType;
		resetZoom();
	});

	const COLORS = {
		percentile3: '#e2dbd0',
		percentile15: '#a8e0c8',
		percentile50: '#5bb890',
		percentile85: '#a8e0c8',
		percentile97: '#e2dbd0',
		bandOuter: 'rgba(91, 184, 144, 0.06)',
		bandInner: 'rgba(91, 184, 144, 0.1)',
		dataLine: '#e8785c',
		grid: '#f0ece5',
		text: '#9e958a',
		axis: '#e2dbd0'
	};

	const PERCENTILE_COLORS = [
		COLORS.percentile3,
		COLORS.percentile15,
		COLORS.percentile50,
		COLORS.percentile85,
		COLORS.percentile97
	];

	const PERCENTILE_WIDTHS = [1, 1.5, 2, 1.5, 1];

	function drawChart() {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		const w = rect.width;
		const h = rect.height;

		ctx.clearRect(0, 0, w, h);

		const pad = { top: 20, right: 50, bottom: 45, left: 55 };
		const cw = w - pad.left - pad.right;
		const ch = h - pad.top - pad.bottom;

		const lmsData = getLMSData(standard, sex, measurementType);
		const fullMaxMonths = getMaxMonths(standard);
		const unit = getUnit(measurementType);
		const curves = generatePercentileCurves(lmsData);

		// Determine X range (months)
		const xMin = zoomMonthMin ?? 0;
		let maxMonths = zoomMonthMax ?? fullMaxMonths;

		// Auto-limit X axis based on latest data point
		if (zoomMonthMax === null && dataPoints.length > 0) {
			const latestMonth = Math.max(...dataPoints.map((d) => d.month));
			// Pick a nice ceiling that gives breathing room beyond the last point
			const ceilings = [6, 12, 18, 24, 36, 48, 60];
			const autoMax = ceilings.find((c) => c >= latestMonth * 1.5 && c >= latestMonth + 2);
			if (autoMax !== undefined && autoMax < fullMaxMonths) {
				maxMonths = autoMax;
			}
		}

		// Compute Y range from percentile curves (within visible X range)
		let yMin = Infinity;
		let yMax = -Infinity;
		if (zoomValueMin !== null && zoomValueMax !== null) {
			yMin = zoomValueMin;
			yMax = zoomValueMax;
		} else {
			for (const point of curves) {
				if (point.month < xMin || point.month > maxMonths) continue;
				yMin = Math.min(yMin, point.values[0]); // p3
				yMax = Math.max(yMax, point.values[4]); // p97
			}
			// Include data points in range
			for (const dp of dataPoints) {
				if (dp.month < xMin || dp.month > maxMonths) continue;
				yMin = Math.min(yMin, dp.value);
				yMax = Math.max(yMax, dp.value);
			}
			// Add padding
			const yRange = yMax - yMin;
			yMin = Math.max(0, yMin - yRange * 0.08);
			yMax = yMax + yRange * 0.08;
		}

		function x(month: number): number {
			return pad.left + ((month - xMin) / (maxMonths - xMin)) * cw;
		}
		function y(val: number): number {
			return pad.top + ch - ((val - yMin) / (yMax - yMin)) * ch;
		}

		// Store inverse mappings for drag-to-zoom
		inverseX = (px: number) => xMin + ((px - pad.left) / cw) * (maxMonths - xMin);
		inverseY = (py: number) => yMin + ((pad.top + ch - py) / ch) * (yMax - yMin);

		// Grid lines
		const ySteps = 6;
		ctx.strokeStyle = COLORS.grid;
		ctx.lineWidth = 1;
		ctx.font = '11px Nunito, sans-serif';

		for (let i = 0; i <= ySteps; i++) {
			const val = yMin + ((yMax - yMin) * i) / ySteps;
			const py = y(val);
			ctx.beginPath();
			ctx.moveTo(pad.left, py);
			ctx.lineTo(w - pad.right, py);
			ctx.stroke();

			ctx.fillStyle = COLORS.text;
			ctx.textAlign = 'right';
			ctx.fillText(val.toFixed(1), pad.left - 8, py + 4);
		}

		// Y axis label
		ctx.save();
		ctx.translate(12, pad.top + ch / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.textAlign = 'center';
		ctx.fillStyle = COLORS.text;
		ctx.font = '600 12px Quicksand, sans-serif';
		ctx.fillText(`${getLabel(measurementType)} (${unit})`, 0, 0);
		ctx.restore();

		// X axis labels
		const xRange = maxMonths - xMin;
		const monthStep = xRange <= 6 ? 1 : xRange <= 18 ? 2 : xRange <= 36 ? 3 : 6;
		const firstTick = Math.ceil(xMin / monthStep) * monthStep;
		ctx.textAlign = 'center';
		for (let m = firstTick; m <= maxMonths; m += monthStep) {
			ctx.fillStyle = COLORS.text;
			ctx.font = '11px Nunito, sans-serif';
			const label = m < 12 ? `${m}m` : m % 12 === 0 ? `${m / 12}y` : `${Math.floor(m / 12)}y${m % 12}m`;
			ctx.fillText(label, x(m), h - pad.bottom + 18);

			ctx.strokeStyle = COLORS.grid;
			ctx.beginPath();
			ctx.moveTo(x(m), pad.top);
			ctx.lineTo(x(m), h - pad.bottom);
			ctx.stroke();
		}

		// X axis label
		ctx.fillStyle = COLORS.text;
		ctx.font = '600 12px Quicksand, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('Age', pad.left + cw / 2, h - 4);

		// Fill between p3 and p97
		ctx.fillStyle = COLORS.bandOuter;
		ctx.beginPath();
		for (let i = 0; i < curves.length; i++) {
			const px = x(curves[i].month);
			const py = y(curves[i].values[4]); // p97
			if (i === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		for (let i = curves.length - 1; i >= 0; i--) {
			ctx.lineTo(x(curves[i].month), y(curves[i].values[0])); // p3
		}
		ctx.closePath();
		ctx.fill();

		// Fill between p15 and p85
		ctx.fillStyle = COLORS.bandInner;
		ctx.beginPath();
		for (let i = 0; i < curves.length; i++) {
			const px = x(curves[i].month);
			const py = y(curves[i].values[3]); // p85
			if (i === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		for (let i = curves.length - 1; i >= 0; i--) {
			ctx.lineTo(x(curves[i].month), y(curves[i].values[1])); // p15
		}
		ctx.closePath();
		ctx.fill();

		// Draw percentile curves
		for (let p = 0; p < 5; p++) {
			ctx.strokeStyle = PERCENTILE_COLORS[p];
			ctx.lineWidth = PERCENTILE_WIDTHS[p];
			ctx.beginPath();
			for (let i = 0; i < curves.length; i++) {
				const px = x(curves[i].month);
				const py = y(curves[i].values[p]);
				if (i === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.stroke();

			// Label at end of line
			const lastCurve = curves[curves.length - 1];
			ctx.fillStyle = PERCENTILE_COLORS[p];
			ctx.font = '600 10px Nunito, sans-serif';
			ctx.textAlign = 'left';
			ctx.fillText(`${PERCENTILE_LINES[p]}%`, x(lastCurve.month) + 4, y(lastCurve.values[p]) + 3);

			// Inline label near the visible midpoint of the curve
			const visibleCurves = curves.filter((c) => c.month >= xMin && c.month <= maxMonths);
			if (visibleCurves.length > 4) {
				const midIdx = Math.floor(visibleCurves.length * 0.55);
				const midCurve = visibleCurves[midIdx];
				const labelText = `${PERCENTILE_LINES[p]}%`;
				ctx.font = '600 9px Nunito, sans-serif';
				const textWidth = ctx.measureText(labelText).width;
				const lx = x(midCurve.month);
				const ly = y(midCurve.values[p]);
				// Background pill for readability
				ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
				ctx.beginPath();
				ctx.roundRect(lx - textWidth / 2 - 3, ly - 6, textWidth + 6, 12, 3);
				ctx.fill();
				// Text
				ctx.fillStyle = PERCENTILE_COLORS[p];
				ctx.textAlign = 'center';
				ctx.fillText(labelText, lx, ly + 3);
			}
		}

		// Draw data line
		pointPositions = [];
		if (dataPoints.length > 0) {
			const sorted = [...dataPoints].sort((a, b) => a.month - b.month);

			// Line
			ctx.strokeStyle = COLORS.dataLine;
			ctx.lineWidth = 2.5;
			ctx.lineJoin = 'round';
			ctx.beginPath();
			for (let i = 0; i < sorted.length; i++) {
				const px = x(sorted[i].month);
				const py = y(sorted[i].value);
				if (i === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.stroke();

			// Points and labels
			for (let i = 0; i < sorted.length; i++) {
				const px = x(sorted[i].month);
				const py = y(sorted[i].value);

				pointPositions.push({ x: px, y: py, id: sorted[i].id });

				ctx.beginPath();
				ctx.arc(px, py, 5, 0, Math.PI * 2);
				ctx.fillStyle = 'white';
				ctx.fill();
				ctx.strokeStyle = COLORS.dataLine;
				ctx.lineWidth = 2.5;
				ctx.stroke();

				// Label each point with value and percentile
				const lms = interpolateLMS(sorted[i].month, lmsData);
				const pct = lms ? getPercentile(sorted[i].value, lms) : null;

				ctx.fillStyle = COLORS.dataLine;
				ctx.font = 'bold 11px Nunito, sans-serif';
				ctx.textAlign = 'center';
				const pctText = pct !== null ? `${Math.round(pct)}%` : '';
				ctx.fillText(pctText, px, py - 10);
			}
		}
	}

	$effect(() => {
		// Re-draw when any prop or zoom state changes
		sex; standard; measurementType; dataPoints;
		zoomMonthMin; zoomMonthMax; zoomValueMin; zoomValueMax;
		// Need a tick for the canvas to be in DOM
		requestAnimationFrame(drawChart);
	});

	function handleResize() {
		drawChart();
	}

	function getCanvasCoords(e: MouseEvent): { cx: number; cy: number } {
		const rect = canvas.getBoundingClientRect();
		return { cx: e.clientX - rect.left, cy: e.clientY - rect.top };
	}

	function findPointAt(cx: number, cy: number): string | undefined {
		const hitRadius = 12;
		for (const pt of pointPositions) {
			const dx = cx - pt.x;
			const dy = cy - pt.y;
			if (dx * dx + dy * dy <= hitRadius * hitRadius && pt.id) {
				return pt.id;
			}
		}
		return undefined;
	}

	// Track whether mousedown started on a data point
	let mouseDownPointId: string | undefined = undefined;

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		const { cx, cy } = getCanvasCoords(e);
		mouseDownPointId = findPointAt(cx, cy);
		// Always track drag start — we'll decide on mouseUp if it was a click or drag
		isDragging = true;
		dragStartX = cx;
		dragStartY = cy;
		dragCurrentX = cx;
		dragCurrentY = cy;
	}

	function handleMouseMove(e: MouseEvent) {
		const { cx, cy } = getCanvasCoords(e);
		if (isDragging) {
			dragCurrentX = cx;
			dragCurrentY = cy;
			const dx = Math.abs(dragCurrentX - dragStartX);
			const dy = Math.abs(dragCurrentY - dragStartY);
			canvas.style.cursor = (dx > 5 || dy > 5) ? 'crosshair' : (mouseDownPointId ? 'pointer' : 'default');
		} else {
			canvas.style.cursor = findPointAt(cx, cy) ? 'pointer' : 'crosshair';
		}
	}

	function handleMouseUp(e: MouseEvent) {
		if (!isDragging) return;
		isDragging = false;

		const dx = Math.abs(dragCurrentX - dragStartX);
		const dy = Math.abs(dragCurrentY - dragStartY);

		// Small movement = click, not drag
		if (dx < 10 && dy < 10) {
			// If we clicked on a data point, fire the callback
			if (mouseDownPointId && onpointclick) {
				onpointclick(mouseDownPointId);
			}
			mouseDownPointId = undefined;
			return;
		}

		mouseDownPointId = undefined;

		if (!inverseX || !inverseY) return;

		const x1 = inverseX(Math.min(dragStartX, dragCurrentX));
		const x2 = inverseX(Math.max(dragStartX, dragCurrentX));
		const y1 = inverseY(Math.max(dragStartY, dragCurrentY)); // y is inverted
		const y2 = inverseY(Math.min(dragStartY, dragCurrentY));

		zoomMonthMin = Math.max(0, x1);
		zoomMonthMax = x2;
		zoomValueMin = Math.max(0, y1);
		zoomValueMax = y2;
	}

	// Draw selection rectangle overlay
	$effect(() => {
		if (!isDragging || !canvas) return;
		// We need to trigger on drag coordinates
		dragCurrentX; dragCurrentY;

		requestAnimationFrame(() => {
			drawChart();
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const left = Math.min(dragStartX, dragCurrentX);
			const top = Math.min(dragStartY, dragCurrentY);
			const width = Math.abs(dragCurrentX - dragStartX);
			const height = Math.abs(dragCurrentY - dragStartY);

			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			ctx.save();
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			// Dim everything outside selection using a clipped region
			ctx.beginPath();
			ctx.rect(0, 0, rect.width, rect.height);
			// Cut out the selection area (counter-clockwise = hole)
			ctx.moveTo(left, top);
			ctx.lineTo(left, top + height);
			ctx.lineTo(left + width, top + height);
			ctx.lineTo(left + width, top);
			ctx.closePath();
			ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
			ctx.fill('evenodd');

			// Selection border
			ctx.strokeStyle = 'rgba(91, 184, 144, 0.7)';
			ctx.lineWidth = 1.5;
			ctx.setLineDash([4, 3]);
			ctx.strokeRect(left, top, width, height);
			ctx.setLineDash([]);
			ctx.restore();
		});
	});
</script>

<svelte:window onresize={handleResize} />

<div class="w-full relative">
	<canvas
		bind:this={canvas}
		class="w-full"
		style="height: 350px"
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={() => { isDragging = false; }}
		ontouchstart={(e) => {
			const touch = e.touches[0];
			const rect = canvas.getBoundingClientRect();
			const cx = touch.clientX - rect.left;
			const cy = touch.clientY - rect.top;
			const id = findPointAt(cx, cy);
			if (id && onpointclick) {
				e.preventDefault();
				onpointclick(id);
			}
		}}
	></canvas>
	{#if isZoomed}
		<button
			onclick={resetZoom}
			class="absolute top-2 right-2 px-2.5 py-1 bg-white/90 border border-[var(--cream-200)] rounded-[var(--radius-sm)] text-xs font-semibold text-[var(--cream-600)] hover:bg-[var(--cream-100)] hover:text-[var(--cream-700)] transition-all cursor-pointer shadow-sm backdrop-blur-sm"
		>
			Reset Zoom
		</button>
	{/if}
</div>
