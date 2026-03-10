export interface LMSEntry {
	month: number;
	L: number;
	M: number;
	S: number;
}

export type MeasurementType = 'weight' | 'height' | 'head';
export type Sex = 'boy' | 'girl';
export type Standard = 'who' | 'cdc';

export interface GrowthDataSet {
	boys: {
		weight: LMSEntry[];
		height: LMSEntry[];
		head: LMSEntry[];
	};
	girls: {
		weight: LMSEntry[];
		height: LMSEntry[];
		head: LMSEntry[];
	};
}
