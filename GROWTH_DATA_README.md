# Growth Chart LMS Data - Complete Guide

## What You Have

I've created `/Users/brunogalvao/claude-projects/baby-growth/growth-chart-lms-data.ts` with:

### Complete CDC Data (0-36 months):
- Weight-for-age (boys & girls)
- Length-for-age (boys & girls)
- Head circumference-for-age (boys & girls)

### Utility Functions:
- `calculateZScore()` - Convert measurements to z-scores using LMS
- `zScoreToPercentile()` - Convert z-scores to percentiles
- `getLMSForAge()` - Interpolate LMS values for any age
- `calculatePercentile()` - All-in-one percentile calculator

## What's Missing

WHO data for ages 0-60 months needs to be downloaded from Excel files (they can't be fetched automatically).

## How to Get Complete WHO Data (0-60 months)

### Option 1: Download WHO Excel Files Directly

Download these Excel files and extract the LMS values:

#### Weight-for-age:
- **Boys**: [wfa-boys-zscore-expanded-tables.xlsx](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-boys-zscore-expanded-tables.xlsx?sfvrsn=65cce121_9)
- **Girls**: [wfa-girls-zscore-expanded-tables.xlsx](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-girls-zscore-expanded-tables.xlsx?sfvrsn=f01bc813_9)

#### Length/Height-for-age:
- **Boys**: [lhfa-boys-zscore-expanded-tables.xlsx](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/length-height-for-age/expandable-tables/lhfa-boys-zscore-expanded-tables.xlsx?sfvrsn=7b4a3428_12)
- **Girls**: [lhfa-girls-zscore-expanded-tables.xlsx](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/length-height-for-age/expandable-tables/lhfa-girls-zscore-expanded-tables.xlsx?sfvrsn=27f1e2cb_9)

#### Head Circumference-for-age:
- **Boys**: [hcfa-boys-zscore-expanded-tables.xlsx](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/head-circumference-for-age/expanded-tables/hcfa-boys-zscore-expanded-tables.xlsx?sfvrsn=2ab1bec8_7)
- **Girls**: [hcfa-girls-zscore-expanded-tables.xlsx](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/head-circumference-for-age/expanded-tables/hcfa-girls-zscore-expanded-tables.xlsx?sfvrsn=3a34b8b0_8)

### Option 2: Use WHO CSV from RCPCH

The Royal College of Paediatrics and Child Health has consolidated WHO data:

```bash
curl -o WHO2006.csv https://raw.githubusercontent.com/rcpch/growth-references/main/who2006/WHO2006.csv
```

This CSV contains ALL WHO measurements in one file, but requires parsing.

### Option 3: Use CDC's WHO Subset (0-24 months only)

CDC hosts WHO data for 0-24 months in CSV format:

#### Weight-for-age:
```bash
curl -o who-boys-weight.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-age-Percentiles.csv
curl -o who-girls-weight.csv "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-age%20Percentiles.csv"
```

#### Length-for-age:
```bash
curl -o who-boys-length.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Length-for-age-Percentiles.csv
curl -o who-girls-length.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Length-for-age-Percentiles.csv
```

#### Head Circumference-for-age:
```bash
curl -o who-boys-head.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Head-Circumference-for-age-Percentiles.csv
curl -o who-girls-head.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Head-Circumference-for-age-Percentiles.csv
```

## WHO Data Structure

WHO data is organized by age:
- **0-13 weeks**: Weekly measurements
- **14 weeks to 60 months**: Monthly measurements

Each row contains:
- Age (in days, weeks, or months depending on section)
- L (Lambda - Box-Cox power)
- M (Mu - median value)
- S (Sigma - coefficient of variation)

## How to Parse Excel Files

If you download the WHO Excel files, here's how to extract the data:

### Using Node.js with xlsx package:

```typescript
import * as XLSX from 'xlsx';

function parseWHOExcel(filePath: string): LMSData[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  return data.map((row: any) => ({
    month: convertAgeToMonths(row), // Convert days/weeks to months
    L: parseFloat(row.L),
    M: parseFloat(row.M),
    S: parseFloat(row.S)
  }));
}
```

### Using Python with pandas:

```python
import pandas as pd

def parse_who_excel(file_path):
    df = pd.read_excel(file_path)
    # Extract L, M, S columns
    # Convert age to months
    return df[['Age_Months', 'L', 'M', 'S']].to_dict('records')
```

## Data Format in TypeScript File

Once you have the WHO data, add it to the TypeScript file in this format:

```typescript
export const WHO_BOYS_WEIGHT: LMSData[] = [
  { month: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { month: 0.5, L: 0.2297, M: 4.4709, S: 0.13395 },
  // ... continue for all months 0-60
  { month: 60, L: 0.1738, M: 18.3015, S: 0.11691 }
];
```

## LMS Method Explanation

The LMS method uses three parameters to describe growth curves:

- **L (Lambda)**: Skewness/power transformation
- **M (Mu)**: Median value at that age
- **S (Sigma)**: Coefficient of variation

### Calculate Z-score:
```
If L ≠ 0: Z = ((value/M)^L - 1) / (L*S)
If L = 0: Z = ln(value/M) / S
```

### Calculate Percentile:
```
Percentile = normalCDF(Z) × 100
```

Where normalCDF is the cumulative distribution function of the standard normal distribution.

## Usage Example

```typescript
import {
  CDC_BOYS_WEIGHT,
  calculatePercentile
} from './growth-chart-lms-data';

// Baby boy, 6 months old, weighs 8 kg
const result = calculatePercentile(8, 6, CDC_BOYS_WEIGHT);

console.log(`Z-score: ${result.zScore.toFixed(2)}`);
console.log(`Percentile: ${result.percentile.toFixed(1)}th`);
console.log(`50th percentile for age: ${result.lms.M.toFixed(2)} kg`);
```

## Data Sources & References

### CDC Growth Charts:
- **Main page**: https://www.cdc.gov/growthcharts/
- **Data files**: https://www.cdc.gov/growthcharts/cdc-data-files.htm
- **WHO data files (CDC)**: https://www.cdc.gov/growthcharts/who-data-files.htm

### WHO Growth Standards:
- **Main page**: https://www.who.int/tools/child-growth-standards/standards
- **Weight-for-age**: https://www.who.int/tools/child-growth-standards/standards/weight-for-age
- **Length/Height-for-age**: https://www.who.int/tools/child-growth-standards/standards/length-height-for-age
- **Head circumference**: https://www.who.int/tools/child-growth-standards/standards/head-circumference-for-age

### RCPCH Growth References:
- **GitHub repo**: https://github.com/rcpch/growth-references
- **Documentation**: https://growth.rcpch.ac.uk/clinician/growth-references/

## Differences Between WHO and CDC

### WHO (0-60 months):
- Based on international study of breastfed children
- Represents optimal growth under ideal conditions
- Recommended for 0-2 years by AAP
- More granular data (weekly for first 13 weeks)

### CDC (0-36 months):
- Based on US population data
- Represents typical growth in US
- Uses different reference population
- Half-month intervals

## Next Steps

1. **Download WHO Excel files** from links above
2. **Parse the Excel files** to extract LMS values
3. **Add the data** to the TypeScript file
4. **Test with real measurements** to verify accuracy

## Need Help?

If you need assistance parsing the WHO Excel files or have questions about the LMS method, the WHO provides:
- Technical documentation
- Software tools (WHO Anthro)
- Training materials

All available at: https://www.who.int/tools/child-growth-standards/

---

**File created**: `/Users/brunogalvao/claude-projects/baby-growth/growth-chart-lms-data.ts`

**Contains**:
- Complete CDC data (0-36 months)
- Full utility functions
- Type definitions
- Usage examples
- Clear comments on where to get WHO data
