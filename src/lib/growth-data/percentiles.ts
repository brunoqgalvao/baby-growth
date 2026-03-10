import type { LMSEntry } from './types';

/**
 * Calculate Z-score from a measurement value using LMS parameters.
 * Formula: Z = ((value/M)^L - 1) / (L*S)  when L != 0
 *          Z = ln(value/M) / S             when L == 0
 */
export function valueToZScore(value: number, lms: LMSEntry): number {
	const { L, M, S } = lms;
	if (Math.abs(L) < 0.001) {
		return Math.log(value / M) / S;
	}
	return (Math.pow(value / M, L) - 1) / (L * S);
}

/**
 * Calculate measurement value from Z-score using LMS parameters.
 * Inverse of valueToZScore.
 */
export function zScoreToValue(z: number, lms: LMSEntry): number {
	const { L, M, S } = lms;
	if (Math.abs(L) < 0.001) {
		return M * Math.exp(S * z);
	}
	return M * Math.pow(1 + L * S * z, 1 / L);
}

/**
 * Standard normal CDF approximation (Abramowitz and Stegun)
 */
export function normalCDF(z: number): number {
	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = 0.3275911;

	const sign = z < 0 ? -1 : 1;
	z = Math.abs(z) / Math.SQRT2;

	const t = 1.0 / (1.0 + p * z);
	const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

	return 0.5 * (1.0 + sign * y);
}

/**
 * Convert Z-score to percentile (0-100)
 */
export function zScoreToPercentile(z: number): number {
	return normalCDF(z) * 100;
}

/**
 * Get the percentile of a value given LMS parameters
 */
export function getPercentile(value: number, lms: LMSEntry): number {
	const z = valueToZScore(value, lms);
	return zScoreToPercentile(z);
}

/**
 * Inverse normal CDF (probit function) - Newton's method
 */
function inverseNormalCDF(p: number): number {
	if (p <= 0) return -8;
	if (p >= 1) return 8;

	// Rational approximation for central region
	if (p > 0.5) return -inverseNormalCDF(1 - p);

	const t = Math.sqrt(-2 * Math.log(p));
	const c0 = 2.515517;
	const c1 = 0.802853;
	const c2 = 0.010328;
	const d1 = 1.432788;
	const d2 = 0.189269;
	const d3 = 0.001308;

	return -(t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t));
}

/**
 * Standard percentile lines to display on charts
 */
export const PERCENTILE_LINES = [3, 15, 50, 85, 97] as const;

/**
 * Generate percentile curves for plotting.
 * Returns an array of { month, values } where values[i] corresponds to PERCENTILE_LINES[i]
 */
export function generatePercentileCurves(
	lmsData: LMSEntry[]
): Array<{ month: number; values: number[] }> {
	return lmsData.map((lms) => {
		const values = PERCENTILE_LINES.map((p) => {
			const z = inverseNormalCDF(p / 100);
			return zScoreToValue(z, lms);
		});
		return { month: lms.month, values };
	});
}

/**
 * Interpolate LMS values for a given age in months (supports fractional months)
 */
export function interpolateLMS(ageMonths: number, lmsData: LMSEntry[]): LMSEntry | null {
	if (lmsData.length === 0) return null;

	const floor = Math.floor(ageMonths);
	const ceil = Math.ceil(ageMonths);

	const lower = lmsData.find((d) => d.month === floor);
	const upper = lmsData.find((d) => d.month === ceil);

	if (!lower) return lmsData[0];
	if (!upper || floor === ceil) return lower;

	const frac = ageMonths - floor;
	return {
		month: ageMonths,
		L: lower.L + frac * (upper.L - lower.L),
		M: lower.M + frac * (upper.M - lower.M),
		S: lower.S + frac * (upper.S - lower.S)
	};
}
