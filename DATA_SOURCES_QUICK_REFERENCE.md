# Growth Chart Data - Quick Reference

## What's Already in the TypeScript File

| Measurement | Age Range | Source | Status |
|------------|-----------|--------|--------|
| Weight-for-age (boys) | 0-36 months | CDC | ✅ Complete |
| Weight-for-age (girls) | 0-36 months | CDC | ✅ Complete |
| Length-for-age (boys) | 0-36 months | CDC | ✅ Complete |
| Length-for-age (girls) | 0-36 months | CDC | ✅ Complete |
| Head circumference (boys) | 0-36 months | CDC | ✅ Complete |
| Head circumference (girls) | 0-36 months | CDC | ✅ Complete |

## What You Still Need (WHO 0-60 months)

| Measurement | Download Link | Format |
|------------|---------------|--------|
| **Weight-for-age (boys)** | [Download XLSX](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-boys-zscore-expanded-tables.xlsx?sfvrsn=65cce121_9) | Excel |
| **Weight-for-age (girls)** | [Download XLSX](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-girls-zscore-expanded-tables.xlsx?sfvrsn=f01bc813_9) | Excel |
| **Length/Height-for-age (boys)** | [Download XLSX](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/length-height-for-age/expandable-tables/lhfa-boys-zscore-expanded-tables.xlsx?sfvrsn=7b4a3428_12) | Excel |
| **Length/Height-for-age (girls)** | [Download XLSX](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/length-height-for-age/expandable-tables/lhfa-girls-zscore-expanded-tables.xlsx?sfvrsn=27f1e2cb_9) | Excel |
| **Head circumference (boys)** | [Download XLSX](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/head-circumference-for-age/expanded-tables/hcfa-boys-zscore-expanded-tables.xlsx?sfvrsn=2ab1bec8_7) | Excel |
| **Head circumference (girls)** | [Download XLSX](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/head-circumference-for-age/expanded-tables/hcfa-girls-zscore-expanded-tables.xlsx?sfvrsn=3a34b8b0_8) | Excel |

## Quick Download Commands

### WHO Subset (0-24 months, CSV format from CDC):

```bash
# Weight-for-age
curl -o who-boys-weight-0-24.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-age-Percentiles.csv

curl -o who-girls-weight-0-24.csv "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-age%20Percentiles.csv"

# Length-for-age
curl -o who-boys-length-0-24.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Length-for-age-Percentiles.csv

curl -o who-girls-length-0-24.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Length-for-age-Percentiles.csv

# Head circumference
curl -o who-boys-head-0-24.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Head-Circumference-for-age-Percentiles.csv

curl -o who-girls-head-0-24.csv https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Head-Circumference-for-age-Percentiles.csv
```

## Data Structure

All files contain these columns:
- **Month** (or Age): Age in months (fractional values like 0, 0.5, 1.5, etc.)
- **L**: Lambda (skewness parameter)
- **M**: Mu (median value)
- **S**: Sigma (coefficient of variation)

## CSV Parser Script

Here's a Node.js script to parse the WHO CSV files:

```typescript
import { readFileSync } from 'fs';

interface LMSData {
  month: number;
  L: number;
  M: number;
  S: number;
}

function parseWHOCSV(filePath: string): LMSData[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      month: parseFloat(values[0]),
      L: parseFloat(values[1]),
      M: parseFloat(values[2]),
      S: parseFloat(values[3])
    };
  });
}

// Usage:
const whoBoysWeight = parseWHOCSV('./who-boys-weight-0-24.csv');
console.log(JSON.stringify(whoBoysWeight, null, 2));
```

## Python Parser Script

```python
import pandas as pd
import json

def parse_who_csv(file_path):
    df = pd.read_csv(file_path)
    # Assuming columns are: Month, L, M, S
    data = []
    for _, row in df.iterrows():
        data.append({
            'month': float(row[0]),  # First column is age
            'L': float(row[1]),
            'M': float(row[2]),
            'S': float(row[3])
        })
    return data

# Usage:
data = parse_who_csv('who-boys-weight-0-24.csv')
print(json.dumps(data, indent=2))
```

## File Paths in Your Project

```
/Users/brunogalvao/claude-projects/baby-growth/
├── growth-chart-lms-data.ts          ✅ Ready to use
├── GROWTH_DATA_README.md             ✅ Full documentation
└── DATA_SOURCES_QUICK_REFERENCE.md   ✅ This file
```

## Integration Steps

1. **Download** WHO CSV or Excel files (links above)
2. **Parse** using the scripts provided
3. **Copy** the JSON output into the TypeScript file
4. **Replace** the placeholder arrays like `WHO_BOYS_WEIGHT_0_24`
5. **Test** with sample calculations

## Testing Your Data

```typescript
// Test that the data is correct
import { calculatePercentile, CDC_BOYS_WEIGHT } from './growth-chart-lms-data';

// Test case: 6-month-old boy at 50th percentile
const median = CDC_BOYS_WEIGHT.find(d => d.month === 6.5);
if (median) {
  const result = calculatePercentile(median.M, 6.5, CDC_BOYS_WEIGHT);
  console.log('Should be ~50th percentile:', result.percentile);
  // Should output close to 50
}
```

## Resources

- **CDC Charts**: https://www.cdc.gov/growthcharts/
- **WHO Standards**: https://www.who.int/tools/child-growth-standards/standards
- **RCPCH GitHub**: https://github.com/rcpch/growth-references
- **LMS Method Paper**: Cole TJ, Green PJ. Smoothing reference centile curves: the LMS method and penalized likelihood. Stat Med 1992;11:1305-1319.
