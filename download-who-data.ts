/**
 * Script to download and parse WHO growth chart data from CDC FTP
 * This downloads the WHO subset (0-24 months) in CSV format
 *
 * Run with: npx tsx download-who-data.ts
 * Or: node download-who-data.js (if compiled)
 */

import { writeFileSync } from 'fs';

interface LMSData {
  month: number;
  L: number;
  M: number;
  S: number;
}

// WHO data URLs from CDC (0-24 months)
const WHO_DATA_URLS = {
  boys: {
    weight: 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-age-Percentiles.csv',
    length: 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Length-for-age-Percentiles.csv',
    headCircumference: 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Head-Circumference-for-age-Percentiles.csv'
  },
  girls: {
    weight: 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-age%20Percentiles.csv',
    length: 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Length-for-age-Percentiles.csv',
    headCircumference: 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Head-Circumference-for-age-Percentiles.csv'
  }
};

async function fetchCSV(url: string): Promise<string> {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.text();
}

function parseCSV(csvContent: string): LMSData[] {
  const lines = csvContent.trim().split('\n');

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines.map(line => {
    const parts = line.split(',');
    return {
      month: parseFloat(parts[0].trim()),
      L: parseFloat(parts[1].trim()),
      M: parseFloat(parts[2].trim()),
      S: parseFloat(parts[3].trim())
    };
  }).filter(d => !isNaN(d.month) && !isNaN(d.L) && !isNaN(d.M) && !isNaN(d.S));
}

function generateTypeScriptCode(data: Record<string, LMSData[]>): string {
  const format = (arr: LMSData[]): string => {
    return '[\n' + arr.map(d =>
      `  { month: ${d.month}, L: ${d.L}, M: ${d.M}, S: ${d.S} }`
    ).join(',\n') + '\n]';
  };

  return `/**
 * WHO Growth Standards Data (0-24 months)
 * Auto-generated from CDC WHO data files
 *
 * Source: https://www.cdc.gov/growthcharts/who-data-files.htm
 * Generated: ${new Date().toISOString()}
 */

import { LMSData } from './growth-chart-lms-data';

/**
 * WHO Weight-for-Age - Boys (0-24 months)
 * Weight in kilograms
 */
export const WHO_BOYS_WEIGHT: LMSData[] = ${format(data.boysWeight)};

/**
 * WHO Weight-for-Age - Girls (0-24 months)
 * Weight in kilograms
 */
export const WHO_GIRLS_WEIGHT: LMSData[] = ${format(data.girlsWeight)};

/**
 * WHO Length-for-Age - Boys (0-24 months)
 * Length in centimeters
 */
export const WHO_BOYS_LENGTH: LMSData[] = ${format(data.boysLength)};

/**
 * WHO Length-for-Age - Girls (0-24 months)
 * Length in centimeters
 */
export const WHO_GIRLS_LENGTH: LMSData[] = ${format(data.girlsLength)};

/**
 * WHO Head Circumference-for-Age - Boys (0-24 months)
 * Head circumference in centimeters
 */
export const WHO_BOYS_HEAD_CIRCUMFERENCE: LMSData[] = ${format(data.boysHead)};

/**
 * WHO Head Circumference-for-Age - Girls (0-24 months)
 * Head circumference in centimeters
 */
export const WHO_GIRLS_HEAD_CIRCUMFERENCE: LMSData[] = ${format(data.girlsHead)};
`;
}

async function main() {
  console.log('Downloading WHO growth chart data from CDC...\n');

  try {
    // Download all CSV files
    const [
      boysWeightCSV,
      boysLengthCSV,
      boysHeadCSV,
      girlsWeightCSV,
      girlsLengthCSV,
      girlsHeadCSV
    ] = await Promise.all([
      fetchCSV(WHO_DATA_URLS.boys.weight),
      fetchCSV(WHO_DATA_URLS.boys.length),
      fetchCSV(WHO_DATA_URLS.boys.headCircumference),
      fetchCSV(WHO_DATA_URLS.girls.weight),
      fetchCSV(WHO_DATA_URLS.girls.length),
      fetchCSV(WHO_DATA_URLS.girls.headCircumference)
    ]);

    console.log('\nParsing CSV data...\n');

    // Parse all data
    const data = {
      boysWeight: parseCSV(boysWeightCSV),
      boysLength: parseCSV(boysLengthCSV),
      boysHead: parseCSV(boysHeadCSV),
      girlsWeight: parseCSV(girlsWeightCSV),
      girlsLength: parseCSV(girlsLengthCSV),
      girlsHead: parseCSV(girlsHeadCSV)
    };

    // Validate data
    console.log('Data parsed successfully:');
    console.log(`  Boys Weight: ${data.boysWeight.length} data points`);
    console.log(`  Boys Length: ${data.boysLength.length} data points`);
    console.log(`  Boys Head Circ: ${data.boysHead.length} data points`);
    console.log(`  Girls Weight: ${data.girlsWeight.length} data points`);
    console.log(`  Girls Length: ${data.girlsLength.length} data points`);
    console.log(`  Girls Head Circ: ${data.girlsHead.length} data points\n`);

    // Generate TypeScript code
    const tsCode = generateTypeScriptCode(data);

    // Write to file
    const outputPath = '/Users/brunogalvao/claude-projects/baby-growth/who-growth-data.ts';
    writeFileSync(outputPath, tsCode, 'utf-8');

    console.log(`✓ WHO data written to: ${outputPath}`);
    console.log('\nYou can now import this data in your app:');
    console.log('  import { WHO_BOYS_WEIGHT, WHO_GIRLS_WEIGHT } from "./who-growth-data";');

    // Print sample data
    console.log('\nSample data (Boys Weight, first 3 months):');
    data.boysWeight.slice(0, 3).forEach(d => {
      console.log(`  Month ${d.month}: L=${d.L.toFixed(4)}, M=${d.M.toFixed(4)} kg, S=${d.S.toFixed(5)}`);
    });

  } catch (error) {
    console.error('Error downloading WHO data:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { main as downloadWHOData };
