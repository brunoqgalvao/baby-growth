# Pediatric Growth Chart Standards Research Report

## Executive Summary

This document provides comprehensive information on WHO and CDC growth chart standards, including data sources, age ranges, measurements, and available JavaScript/TypeScript libraries for implementation.

---

## 1. WHO (World Health Organization) Growth Standards

### Age Ranges
- **Primary Standards:** Birth to 5 years (0-59 months)
- **Extended Reference:** 5-19 years (61-228 months)
- **Recommended Use (US):** Birth to 24 months

### Measurements Tracked

#### Birth to 5 Years (0-59 months)
- Weight-for-age
- Length/height-for-age
- Weight-for-length/height
- BMI-for-age (not recommended for children <2 years)
- Head circumference-for-age
- Arm circumference-for-age
- Subscapular skinfold-for-age
- Triceps skinfold-for-age

#### 5-19 Years
- BMI-for-age
- Height-for-age
- Weight-for-age (only up to 10 years)

### Data Download Sources

#### Official WHO Data (hosted by CDC)

**Weight-for-Age (Birth to 24 Months)**
- Boys XLS: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-age-Percentiles.xlsx` (34 KB)
- Boys CSV: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-age-Percentiles.csv` (12 KB)
- Girls XLS: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-age%20Percentiles.xlsx` (34 KB)
- Girls CSV: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-age%20Percentiles.csv` (12 KB)

**Length-for-Age (Birth to 24 Months)**
- Boys XLS: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Length-for-age-Percentiles.xlsx` (34 KB)
- Boys CSV: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Length-for-age-Percentiles.csv` (12 KB)
- Girls XLS: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Length-for-age-Percentiles.xlsx` (34 KB)
- Girls CSV: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Length-for-age-Percentiles.csv` (12 KB)

**Weight-for-Length**
- Boys XLS: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-length-Percentiles.xlsx` (34 KB)
- Boys CSV: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-length-Percentiles.csv` (12 KB)
- Girls XLS: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-length-Percentiles.xlsx` (34 KB)
- Girls CSV: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-length-Percentiles.csv` (12 KB)

**Head Circumference-for-Age (Birth to 24 Months)**
- Boys XLS: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Head-Circumference-for-age-Percentiles.xlsx` (34 KB)
- Boys CSV: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Head-Circumference-for-age-Percentiles.csv` (12 KB)
- Girls XLS: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Head-Circumference-for-age-Percentiles.xlsx` (34 KB)
- Girls CSV: `ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Head-Circumference-for-age-Percentiles.csv` (12 KB)

#### WHO Direct Sources

**Main Reference Pages:**
- Child Growth Standards (0-5 years): https://www.who.int/tools/child-growth-standards
- Growth Reference Data (5-19 years): https://www.who.int/tools/growth-reference-data-for-5to19-years
- Specific indicators (with Excel/PDF downloads): https://www.who.int/tools/child-growth-standards/standards/weight-for-age

**Data Format Notes:**
- Excel files (.xlsx) contain expanded tables with LMS parameters
- Files include both z-scores and percentiles
- Available on WHO CDN at cdn.who.int domain

### Key Characteristics
- **Prescriptive standards** (how children should grow under optimal conditions)
- Based on international sample of healthy, breastfed infants
- 100% of reference population breastfed for 12 months
- Predominantly breastfed for at least 4 months
- Represents optimal growth conditions

---

## 2. CDC (Centers for Disease Control and Prevention) Growth Charts

### Age Ranges
- **Birth to 36 months:** Infant/toddler charts
- **2 to 20 years:** Older children and adolescents
- **Recommended Use (US):** 2 years and older

### Measurements Tracked

#### Birth to 36 Months
- Weight-for-age
- Length-for-age
- Weight-for-recumbent length
- Head circumference-for-age
- Weight-for-stature

#### 2 to 20 Years
- Weight-for-age
- Stature-for-age
- BMI-for-age
- Weight-for-stature

#### 2022 Extended Charts
- BMI-for-age with additional high percentiles (98th, 99th, 99.9th, 99.99th)

### Data Download Sources

#### CDC Official Data Files

**Base URL:** https://www.cdc.gov/growthcharts/

**2 to 20 Years**

*Weight-for-age*
- XLS: `/growthcharts/data/zscore/wtage.xls` (125 KB)
- CSV: `/growthcharts/data/zscore/wtage.csv` (65 KB)

*Stature-for-age*
- XLS: `/growthcharts/data/zscore/statage.xls` (125 KB)
- CSV: `/growthcharts/data/zscore/statage.csv` (65 KB)

*BMI-for-age*
- XLS: `/growthcharts/data/zscore/bmiagerev.xls` (135 KB)
- CSV: `/growthcharts/data/zscore/bmiagerev.csv` (71 KB)

**Birth to 36 Months**

*Weight-for-age*
- XLS: `/growthcharts/data/zscore/wtageinf.xls` (34 KB)
- CSV: `/growthcharts/data/zscore/wtageinf.csv` (12 KB)

*Length-for-age*
- XLS: `/growthcharts/data/zscore/lenageinf.xls` (67 KB)
- CSV: `/growthcharts/data/zscore/lenageinf.csv` (27 KB)

*Weight-for-recumbent length*
- XLS: `/growthcharts/data/zscore/wtleninf.xls` (46 KB)
- CSV: `/growthcharts/data/zscore/wtleninf.csv` (18 KB)

*Head circumference-for-age*
- XLS: `/growthcharts/data/zscore/hcageinf.xls` (34 KB)
- CSV: `/growthcharts/data/zscore/hcageinf.csv` (12 KB)

*Weight-for-stature*
- XLS: `/growthcharts/data/zscore/wtstat.xls` (39 KB)
- CSV: `/growthcharts/data/zscore/wtstat.csv` (15 KB)

**Data Content:**
All files contain L, M, and S parameters needed to generate exact percentiles and z-scores along with percentile values for multiple percentile levels by sex and single month of age.

### Key Characteristics
- **Descriptive reference** (how certain children grew in a particular time and place)
- Based on US population data
- Reflects a heavier and somewhat shorter sample than WHO
- Includes both breastfed and formula-fed infants

---

## 3. Key Differences: WHO vs CDC

### Conceptual Differences
| Aspect | WHO | CDC |
|--------|-----|-----|
| Type | Growth Standards (prescriptive) | Growth Reference (descriptive) |
| Population | International, optimal conditions | US population, mixed conditions |
| Feeding | 100% breastfed for 12 months | Mixed feeding methods |
| Purpose | How children should grow | How children did grow |

### Age-Based Recommendations (US)
- **Birth to 24 months:** Use WHO standards
- **2 years and older:** Use CDC growth charts

### Key Differences by Age
- Most significant differences occur during infancy
- Differences attributed to:
  - Study design variations
  - Sample characteristics (especially feeding type)
  - Population diversity

### Body Composition
- WHO sample: Generally lighter and taller during infancy
- CDC sample: Heavier and somewhat shorter
- Differences particularly important for growth assessment in first 2 years

---

## 4. Percentile Lines Displayed

### Standard CDC Clinical Charts

**Set 1 (Most Common):**
- 5th, 10th, 25th, 50th, 75th, 90th, 95th percentiles
- Plus 85th percentile for BMI-for-age and weight-for-stature

**Set 2:**
- 3rd, 10th, 25th, 50th, 75th, 90th, 97th percentiles

### Extended CDC Charts (2022)
For children with very high BMIs:
- 98th, 99th, 99.9th, 99.99th percentiles

### Available in Data Files
All data files include these percentiles:
- 3rd, 5th, 10th, 25th, 50th, 75th, 90th, 95th, 97th

### Z-Score Equivalents
| Percentile | Z-Score |
|-----------|---------|
| 3rd | -1.881 |
| 5th | -1.645 |
| 10th | -1.282 |
| 25th | -0.674 |
| 50th | 0 |
| 75th | 0.674 |
| 85th | 1.036 |
| 90th | 1.282 |
| 95th | 1.645 |
| 97th | 1.881 |

---

## 5. JavaScript/TypeScript Libraries

### Production-Ready Libraries

#### 1. RCPCH Digital Growth Charts React Component Library

**Package:** `@rcpch/digital-growth-charts-react-component-library`

**Features:**
- React 18.2 TypeScript component library
- Built with Rollup, TypeScript, and Styled-Components
- Displays results from REST API as digital growth charts
- Includes WHO, CDC, and specialized references (UK-WHO, Turner, Trisomy 21/Down Syndrome)
- Supports height, weight, BMI, head circumference calculations
- Provides centile calculations and visualizations

**Installation:**
```bash
npm install @rcpch/digital-growth-charts-react-component-library
```

**Links:**
- NPM: https://www.npmjs.com/package/@rcpch/digital-growth-charts-react-component-library
- GitHub: https://github.com/rcpch/digital-growth-charts-react-component-library
- Documentation: https://growth.rcpch.ac.uk/products/react-component/

#### 2. RCPCH Growth API Server

**Features:**
- REST API for growth calculations
- Backend Python implementation (rcpchgrowth-python)
- Accepts JSON input, returns JSON output
- LMS data stored as JSON files in data_tables folder
- Supports multiple growth references

**Links:**
- GitHub: https://github.com/rcpch/digital-growth-charts-server
- Documentation: https://growth.rcpch.ac.uk/products/api-server/

#### 3. RCPCHGrowth Python Library

**Package:** `rcpchgrowth` (PyPI)

**Features:**
- Python package for growth calculations
- Contains LMS tables in JSON format
- Individual files for different references (uk_who.py, turner.py, who.py, cdc.py, etc.)
- LMS method implementation for normalised growth centiles

**Links:**
- GitHub: https://github.com/rcpch/rcpchgrowth-python
- PyPI: https://pypi.org/project/rcpchgrowth/
- Documentation: https://growth.rcpch.ac.uk/products/python-library/

### Utility Libraries

#### 4. stat-lms (JavaScript/TypeScript)

**Package:** `stat-lms`

**Features:**
- Simple NPM package for z-score calculations
- Uses LMS (Lambda-Mu-Sigma) method
- Calculates z-scores with given LMS values

**Links:**
- GitHub: https://github.com/kcrt/stat-lms

#### 5. z-score (JavaScript)

**Package:** `z-score`

**Features:**
- Calculates standard scores (z-scores)
- Works with numeric object attributes
- Latest version: 1.0.6

**Links:**
- NPM: https://www.npmjs.com/package/z-score
- GitHub: https://github.com/seracio/zscore

### Data Repositories

#### 6. WHO Official Anthro Package (R)

**Package:** `anthro` (CRAN)

**Features:**
- Official WHO R package
- Calculates 8 anthropometric indicators
- Based on WHO Child Growth Standards
- Z-scores and prevalence estimates

**Links:**
- GitHub: https://github.com/WorldHealthOrganization/anthro
- CRAN: https://cran.r-project.org/web/packages/anthro/

#### 7. Gradual WHO-CDC Transition Charts

**Repository:** carriedaymont/gradual-who-cdc

**Features:**
- Growth charts that gradually transition from WHO to CDC values (2-5 years)
- Data tables in CSV format (compressed)
- Both monthly and daily data intervals
- Includes R and Stata code for calculations

**Important Note:** Original CSV files had erroneous LMS values (corrected September 2025)

**Files:**
- `datatable-gradual-months.csv.zip`
- `datatable-gradual-days.csv.zip`

**Links:**
- GitHub: https://github.com/carriedaymont/gradual-who-cdc

#### 8. Growth Charts JSON Format

**Repository:** p2/growth-charts-json

**Features:**
- JSON file format for describing areas on growth chart PDFs
- Machine-readable definitions
- Includes WHO 2006 standards

**Links:**
- GitHub: https://github.com/p2/growth-charts-json

---

## 6. Implementation Recommendations

### For JavaScript/TypeScript Projects

**Best Option:** RCPCH Digital Growth Charts React Component Library
- Most comprehensive solution
- Actively maintained
- Includes multiple growth references
- Production-ready React components
- Full TypeScript support

**Alternative:** Build custom implementation using:
1. Download CDC CSV files directly from CDC website
2. Use `stat-lms` NPM package for z-score calculations
3. Implement charting with libraries like Chart.js, Recharts, or D3.js

### For Python Projects

**Best Option:** rcpchgrowth-python
- Official RCPCH implementation
- Contains all LMS data in JSON format
- Well-documented
- Actively maintained

**Alternative:** WHO anthro package (R)
- Official WHO implementation
- Can be called from Python using rpy2

### Data Format Considerations

**CSV Files:**
- Easiest to work with
- Direct download from CDC
- Contains all necessary LMS parameters
- Good for custom implementations

**JSON Files:**
- Better for programmatic access
- Available through RCPCH repositories
- Standardized format across references
- Better for web applications

**Excel Files:**
- Good for manual inspection
- Can be converted to CSV/JSON
- Available from both WHO and CDC

---

## 7. LMS Method Explained

### What is LMS?

The LMS method provides a way to:
- Obtain normalized growth centiles from reference datasets
- Apply smoothing and extrapolation
- Convert measurements (even extreme values) into exact SD scores (z-scores)

### Parameters

- **L (Lambda):** Skewness (Box-Cox power transformation)
- **M (Mu):** Median value
- **S (Sigma):** Coefficient of variation

### Calculation

Given age-specific L, M, and S values, you can calculate:

**Z-score (standard deviation score):**
```
Z = ((measurement/M)^L - 1) / (L * S)  [when L ≠ 0]
Z = ln(measurement/M) / S              [when L = 0]
```

**Percentile from Z-score:**
```
Percentile = Φ(Z) * 100
```
where Φ is the cumulative distribution function of the standard normal distribution

---

## 8. Quick Reference URLs

### Official Data Sources

**CDC:**
- Main page: https://www.cdc.gov/growthcharts/
- CDC data files: https://www.cdc.gov/growthcharts/cdc-data-files.htm
- WHO data files (hosted by CDC): https://www.cdc.gov/growthcharts/who-data-files.htm

**WHO:**
- Child Growth Standards (0-5 years): https://www.who.int/tools/child-growth-standards
- Growth Reference (5-19 years): https://www.who.int/tools/growth-reference-data-for-5to19-years
- Weight-for-age example: https://www.who.int/tools/child-growth-standards/standards/weight-for-age

### JavaScript/TypeScript Libraries

**RCPCH:**
- React Component: https://www.npmjs.com/package/@rcpch/digital-growth-charts-react-component-library
- API Server: https://github.com/rcpch/digital-growth-charts-server
- Documentation: https://growth.rcpch.ac.uk/

**Utilities:**
- stat-lms: https://github.com/kcrt/stat-lms
- z-score: https://www.npmjs.com/package/z-score

### Data Repositories

- WHO Anthro (R): https://github.com/WorldHealthOrganization/anthro
- Gradual WHO-CDC: https://github.com/carriedaymont/gradual-who-cdc
- Growth Charts JSON: https://github.com/p2/growth-charts-json
- RCPCH Python: https://github.com/rcpch/rcpchgrowth-python

---

## 9. Important Notes

### Data Quality
- All CDC CSV files contain validated LMS parameters
- WHO data distributed by CDC is authoritative
- RCPCH libraries include multiple validated references
- Gradual WHO-CDC transition data had corrections in Sept 2025

### Usage Guidelines
- Use WHO standards for children under 2 years (US recommendation)
- Use CDC charts for children 2-20 years (US recommendation)
- Breastfed infants should be compared to WHO standards
- Growth charts are not diagnostic tools alone - use as part of overall health assessment

### Data Updates
- CDC 2000 growth charts still current for 2-20 years
- CDC 2022 Extended BMI-for-age charts add high percentiles
- WHO standards from 2006-2007 remain current
- Check official websites for any updates

### Technical Considerations
- CSV files are easiest to parse and integrate
- JSON format better for modern web applications
- LMS parameters allow calculation of any percentile
- Z-scores provide more precision than percentiles alone

---

## Research Sources

This research compiled information from:
- Centers for Disease Control and Prevention (CDC)
- World Health Organization (WHO)
- Royal College of Paediatrics and Child Health (RCPCH)
- National Center for Health Statistics (NCHS)
- Multiple GitHub repositories and NPM packages
- Published research on growth chart methodology

Last updated: March 2026
