export { WHO_DATA } from './who-data';
export { CDC_DATA } from './cdc-data';
export type { LMSEntry, MeasurementType, Sex, Standard, GrowthDataSet } from './types';
export {
	valueToZScore,
	zScoreToValue,
	zScoreToPercentile,
	getPercentile,
	interpolateLMS,
	generatePercentileCurves,
	PERCENTILE_LINES
} from './percentiles';

import { WHO_DATA } from './who-data';
import { CDC_DATA } from './cdc-data';
import type { Standard, Sex, MeasurementType, LMSEntry } from './types';

export function getLMSData(
	standard: Standard,
	sex: Sex,
	measurement: MeasurementType
): LMSEntry[] {
	const dataset = standard === 'who' ? WHO_DATA : CDC_DATA;
	const sexData = sex === 'boy' ? dataset.boys : dataset.girls;
	return sexData[measurement];
}

export function getMaxMonths(standard: Standard): number {
	return standard === 'who' ? 60 : 36;
}

export function getUnit(measurement: MeasurementType): string {
	switch (measurement) {
		case 'weight':
			return 'kg';
		case 'height':
			return 'cm';
		case 'head':
			return 'cm';
	}
}

export function getLabel(measurement: MeasurementType): string {
	switch (measurement) {
		case 'weight':
			return 'Weight';
		case 'height':
			return 'Height / Length';
		case 'head':
			return 'Head Circumference';
	}
}
