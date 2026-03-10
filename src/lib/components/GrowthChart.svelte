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
	}

	let {
		sex,
		standard = 'who',
		measurementType = 'weight',
		dataPoints = []
	}: {
		sex: Sex;
		standard?: Standard;
		measurementType?: MeasurementType;
		dataPoints?: DataPoint[];
	} = $props();

	let canvas: HTMLCanvasElement;

	const COLORS = {
		percentile3: '#d4d0cb',
		percentile15: '#b8cfe6',
		percentile50: '#7ba8d0',
		percentile85: '#b8cfe6',
		percentile97: '#d4d0cb',
		bandOuter: 'rgba(91, 155, 213, 0.06)',
		bandInner: 'rgba(91, 155, 213, 0.1)',
		dataLine: '#e8785c',
		grid: '#f0ece7',
		text: '#8a857e',
		axis: '#ccc'
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
		const maxMonths = getMaxMonths(standard);
		const unit = getUnit(measurementType);
		const curves = generatePercentileCurves(lmsData);

		// Compute Y range from percentile curves
		let yMin = Infinity;
		let yMax = -Infinity;
		for (const point of curves) {
			yMin = Math.min(yMin, point.values[0]); // p3
			yMax = Math.max(yMax, point.values[4]); // p97
		}
		// Include data points in range
		for (const dp of dataPoints) {
			yMin = Math.min(yMin, dp.value);
			yMax = Math.max(yMax, dp.value);
		}
		// Add padding
		const yRange = yMax - yMin;
		yMin = Math.max(0, yMin - yRange * 0.08);
		yMax = yMax + yRange * 0.08;

		function x(month: number): number {
			return pad.left + (month / maxMonths) * cw;
		}
		function y(val: number): number {
			return pad.top + ch - ((val - yMin) / (yMax - yMin)) * ch;
		}

		// Grid lines
		const ySteps = 6;
		ctx.strokeStyle = COLORS.grid;
		ctx.lineWidth = 1;
		ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';

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
		ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
		ctx.fillText(`${getLabel(measurementType)} (${unit})`, 0, 0);
		ctx.restore();

		// X axis labels
		const monthStep = maxMonths <= 36 ? 3 : 6;
		ctx.textAlign = 'center';
		for (let m = 0; m <= maxMonths; m += monthStep) {
			ctx.fillStyle = COLORS.text;
			ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
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
		ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
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

			// Label
			const lastCurve = curves[curves.length - 1];
			ctx.fillStyle = p === 2 ? '#7ba8d0' : p === 1 || p === 3 ? '#a0b8d4' : '#bbb';
			ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
			ctx.textAlign = 'left';
			ctx.fillText(`${PERCENTILE_LINES[p]}th`, x(lastCurve.month) + 4, y(lastCurve.values[p]) + 3);
		}

		// Draw data line
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

			// Points
			for (let i = 0; i < sorted.length; i++) {
				const px = x(sorted[i].month);
				const py = y(sorted[i].value);

				ctx.beginPath();
				ctx.arc(px, py, 5, 0, Math.PI * 2);
				ctx.fillStyle = 'white';
				ctx.fill();
				ctx.strokeStyle = COLORS.dataLine;
				ctx.lineWidth = 2.5;
				ctx.stroke();
			}

			// Label on last point
			if (sorted.length > 0) {
				const last = sorted[sorted.length - 1];
				const lms = interpolateLMS(last.month, lmsData);
				const pct = lms ? getPercentile(last.value, lms) : null;

				ctx.fillStyle = COLORS.dataLine;
				ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
				ctx.textAlign = 'center';
				const labelText = `${last.value} ${unit}`;
				const pctText = pct !== null ? ` (P${Math.round(pct)})` : '';
				ctx.fillText(labelText + pctText, x(last.month), y(last.value) - 12);
			}
		}
	}

	$effect(() => {
		// Re-draw when any prop changes
		sex; standard; measurementType; dataPoints;
		// Need a tick for the canvas to be in DOM
		requestAnimationFrame(drawChart);
	});

	function handleResize() {
		drawChart();
	}
</script>

<svelte:window onresize={handleResize} />

<div class="w-full">
	<canvas
		bind:this={canvas}
		class="w-full"
		style="height: 350px"
	></canvas>
</div>
