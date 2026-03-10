/**
 * Growth Chart LMS (Lambda-Mu-Sigma) Data
 *
 * This file contains the LMS parameters for calculating growth percentiles
 * using the LMS method from WHO and CDC growth standards.
 *
 * FORMULA TO CALCULATE Z-SCORE FROM LMS:
 * - When L ≠ 0: Z = ((value/M)^L - 1) / (L*S)
 * - When L = 0: Z = ln(value/M) / S
 *
 * Then percentile = normalCDF(Z) * 100
 *
 * DATA SOURCES:
 * - CDC (0-36 months): https://www.cdc.gov/growthcharts/cdc-data-files.htm
 * - WHO (0-60 months): https://www.who.int/tools/child-growth-standards/standards
 * - WHO data files: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/
 */

export interface LMSData {
  month: number;  // age in months (fractional for infants, e.g., 0, 0.5, 1.5...)
  L: number;      // Box-Cox transformation power (lambda)
  M: number;      // Median value (mu)
  S: number;      // Coefficient of variation (sigma)
}

// ============================================================================
// CDC GROWTH CHARTS (0-36 MONTHS)
// Source: https://www.cdc.gov/growthcharts/data/zscore/
// ============================================================================

/**
 * CDC Weight-for-Age - Boys (0-36 months)
 * Weight in kilograms
 */
export const CDC_BOYS_WEIGHT: LMSData[] = [
  { month: 0, L: 1.815151075, M: 3.530203168, S: 0.152385273 },
  { month: 0.5, L: 1.547523128, M: 4.003106424, S: 0.146025021 },
  { month: 1.5, L: 1.068795548, M: 4.879525083, S: 0.136478767 },
  { month: 2.5, L: 0.695973505, M: 5.672888765, S: 0.129677511 },
  { month: 3.5, L: 0.41981509, M: 6.391391982, S: 0.124717085 },
  { month: 4.5, L: 0.219866801, M: 7.041836432, S: 0.121040119 },
  { month: 5.5, L: 0.077505598, M: 7.630425182, S: 0.1182712 },
  { month: 6.5, L: -0.02190761, M: 8.162951035, S: 0.116153695 },
  { month: 7.5, L: -0.0894409, M: 8.644832479, S: 0.114510349 },
  { month: 8.5, L: -0.1334091, M: 9.081119817, S: 0.113217163 },
  { month: 9.5, L: -0.1600954, M: 9.476500305, S: 0.11218624 },
  { month: 10.5, L: -0.17429685, M: 9.835307701, S: 0.111354536 },
  { month: 11.5, L: -0.1797189, M: 10.16153567, S: 0.110676413 },
  { month: 12.5, L: -0.179254, M: 10.45885399, S: 0.110118635 },
  { month: 13.5, L: -0.17518447, M: 10.7306256, S: 0.109656941 },
  { month: 14.5, L: -0.16932268, M: 10.97992482, S: 0.109273653 },
  { month: 15.5, L: -0.1631139, M: 11.20955529, S: 0.10895596 },
  { month: 16.5, L: -0.15770999, M: 11.4220677, S: 0.108694678 },
  { month: 17.5, L: -0.15402279, M: 11.61977698, S: 0.108483324 },
  { month: 18.5, L: -0.15276214, M: 11.80477902, S: 0.108317416 },
  { month: 19.5, L: -0.15446658, M: 11.9789663, S: 0.108193944 },
  { month: 20.5, L: -0.15952202, M: 12.14404334, S: 0.108110954 },
  { month: 21.5, L: -0.16817926, M: 12.30154103, S: 0.108067236 },
  { month: 22.5, L: -0.1805668, M: 12.45283028, S: 0.108062078 },
  { month: 23.5, L: -0.19670196, M: 12.59913494, S: 0.108095077 },
  { month: 24.5, L: -0.21650121, M: 12.74154396, S: 0.108166005 },
  { month: 25.5, L: -0.23979048, M: 12.88102276, S: 0.108274705 },
  { month: 26.5, L: -0.26631585, M: 13.01842382, S: 0.108421024 },
  { month: 27.5, L: -0.29575496, M: 13.1544966, S: 0.108604769 },
  { month: 28.5, L: -0.32772936, M: 13.28989667, S: 0.108825681 },
  { month: 29.5, L: -0.36181746, M: 13.42519408, S: 0.109083423 },
  { month: 30.5, L: -0.39756808, M: 13.56088113, S: 0.109377581 },
  { month: 31.5, L: -0.43452025, M: 13.69737858, S: 0.109707646 },
  { month: 32.5, L: -0.47218875, M: 13.83504622, S: 0.110073084 },
  { month: 33.5, L: -0.51012309, M: 13.97418199, S: 0.110473238 },
  { month: 34.5, L: -0.54788557, M: 14.1150324, S: 0.1109074 },
  { month: 35.5, L: -0.5850701, M: 14.25779618, S: 0.111374787 },
  { month: 36, L: -0.60333785, M: 14.32994444, S: 0.111620652 }
];

/**
 * CDC Weight-for-Age - Girls (0-36 months)
 * Weight in kilograms
 */
export const CDC_GIRLS_WEIGHT: LMSData[] = [
  { month: 0, L: 1.509187507, M: 3.39918645, S: 0.142106724 },
  { month: 0.5, L: 1.357944315, M: 3.79752846, S: 0.138075916 },
  { month: 1.5, L: 1.105537708, M: 4.544776513, S: 0.131733888 },
  { month: 2.5, L: 0.902596648, M: 5.230584214, S: 0.126892697 },
  { month: 3.5, L: 0.734121414, M: 5.859960798, S: 0.123025182 },
  { month: 4.5, L: 0.590235275, M: 6.437587751, S: 0.119840911 },
  { month: 5.5, L: 0.464391566, M: 6.967850457, S: 0.117166868 },
  { month: 6.5, L: 0.352164071, M: 7.454854109, S: 0.11489384 },
  { month: 7.5, L: 0.250497889, M: 7.902436186, S: 0.112949644 },
  { month: 8.5, L: 0.15724751, M: 8.314178377, S: 0.11128469 },
  { month: 9.5, L: 0.070885725, M: 8.693418423, S: 0.109863709 },
  { month: 10.5, L: -0.00968493, M: 9.043261854, S: 0.10866078 },
  { month: 11.5, L: -0.085258, M: 9.366593571, S: 0.10765621 },
  { month: 12.5, L: -0.15640945, M: 9.666089185, S: 0.106834517 },
  { month: 13.5, L: -0.22355869, M: 9.944226063, S: 0.106183085 },
  { month: 14.5, L: -0.28701346, M: 10.20329397, S: 0.105691242 },
  { month: 15.5, L: -0.34699919, M: 10.4454058, S: 0.105349631 },
  { month: 16.5, L: -0.40368918, M: 10.67250698, S: 0.105149754 },
  { month: 17.5, L: -0.45721877, M: 10.88638558, S: 0.105083666 },
  { month: 18.5, L: -0.50770077, M: 11.08868151, S: 0.105143752 },
  { month: 19.5, L: -0.55523599, M: 11.28089537, S: 0.105322575 },
  { month: 20.5, L: -0.59992113, M: 11.46439708, S: 0.10561278 },
  { month: 21.5, L: -0.64185418, M: 11.64043402, S: 0.106007025 },
  { month: 22.5, L: -0.6811381, M: 11.81013895, S: 0.106497957 },
  { month: 23.5, L: -0.71788283, M: 11.97453748, S: 0.107078197 },
  { month: 24.5, L: -0.75220617, M: 12.13455528, S: 0.107740346 },
  { month: 25.5, L: -0.78423359, M: 12.2910249, S: 0.108477009 },
  { month: 26.5, L: -0.81409743, M: 12.44469237, S: 0.109280822 },
  { month: 27.5, L: -0.8419355, M: 12.59622335, S: 0.110144488 },
  { month: 28.5, L: -0.86788939, M: 12.74620911, S: 0.111060814 },
  { month: 29.5, L: -0.89210264, M: 12.89517218, S: 0.112022758 },
  { month: 30.5, L: -0.91471881, M: 13.04357164, S: 0.113023466 },
  { month: 31.5, L: -0.93587966, M: 13.19180827, S: 0.114056316 },
  { month: 32.5, L: -0.95572344, M: 13.34022934, S: 0.115114952 },
  { month: 33.5, L: -0.97438101, M: 13.48913357, S: 0.116193337 },
  { month: 34.5, L: -0.99198075, M: 13.63877446, S: 0.11728575 },
  { month: 35.5, L: -1.00864074, M: 13.78936547, S: 0.118386847 },
  { month: 36, L: -1.01665314, M: 13.86507382, S: 0.118939087 }
];

/**
 * CDC Length-for-Age - Boys (0-36 months)
 * Length in centimeters
 * Note: L parameter not provided for length in CDC data (assumed 1.0 for normal distribution)
 */
export const CDC_BOYS_LENGTH: LMSData[] = [
  { month: 0, L: 1.267004226, M: 49.98888408, S: 0.03795 },
  { month: 0.5, L: 0.511237696, M: 52.6959753, S: 0.03557 },
  { month: 1.5, L: -0.45224446, M: 56.62842855, S: 0.03279 },
  { month: 2.5, L: -0.990594599, M: 59.60895343, S: 0.03116 },
  { month: 3.5, L: -1.285837689, M: 62.07700027, S: 0.03001 },
  { month: 4.5, L: -1.43031238, M: 64.2168641, S: 0.02915 },
  { month: 5.5, L: -1.47657547, M: 66.1253149, S: 0.02849 },
  { month: 6.5, L: -1.456837849, M: 67.8601799, S: 0.02797 },
  { month: 7.5, L: -1.391898768, M: 69.45908458, S: 0.02756 },
  { month: 8.5, L: -1.29571459, M: 70.94803912, S: 0.02724 },
  { month: 9.5, L: -1.177919048, M: 72.34586111, S: 0.02699 },
  { month: 10.5, L: -1.045326049, M: 73.6666541, S: 0.02680 },
  { month: 11.5, L: -0.902800887, M: 74.92129717, S: 0.02666 },
  { month: 12.5, L: -0.753908107, M: 76.11837536, S: 0.02656 },
  { month: 13.5, L: -0.601263523, M: 77.26479911, S: 0.02649 },
  { month: 14.5, L: -0.446805039, M: 78.36622309, S: 0.02645 },
  { month: 15.5, L: -0.291974772, M: 79.4273405, S: 0.02644 },
  { month: 16.5, L: -0.13784767, M: 80.45209492, S: 0.02645 },
  { month: 17.5, L: 0.014776155, M: 81.44383603, S: 0.02648 },
  { month: 18.5, L: 0.165304169, M: 82.40543643, S: 0.02652 },
  { month: 19.5, L: 0.313301809, M: 83.33938063, S: 0.02658 },
  { month: 20.5, L: 0.458455471, M: 84.24783394, S: 0.02665 },
  { month: 21.5, L: 0.600544631, M: 85.13269658, S: 0.02673 },
  { month: 22.5, L: 0.739438953, M: 85.9956488, S: 0.02682 },
  { month: 23.5, L: 0.875000447, M: 86.8381751, S: 0.02691 },
  { month: 24.5, L: 1.00720807, M: 87.66160934, S: 0.02701 },
  { month: 25.5, L: 0.837251351, M: 88.45247282, S: 0.02711 },
  { month: 26.5, L: 0.681492975, M: 89.22326434, S: 0.02722 },
  { month: 27.5, L: 0.538779654, M: 89.97549228, S: 0.02733 },
  { month: 28.5, L: 0.407697153, M: 90.71040853, S: 0.02744 },
  { month: 29.5, L: 0.286762453, M: 91.42907762, S: 0.02756 },
  { month: 30.5, L: 0.174489485, M: 92.13242379, S: 0.02767 },
  { month: 31.5, L: 0.069444521, M: 92.82127167, S: 0.02778 },
  { month: 32.5, L: -0.029720564, M: 93.49637946, S: 0.02790 },
  { month: 33.5, L: -0.124251789, M: 94.15846546, S: 0.02801 },
  { month: 34.5, L: -0.215288396, M: 94.80822923, S: 0.02812 },
  { month: 35.5, L: -0.30385434, M: 95.44636981, S: 0.02823 }
];

/**
 * CDC Length-for-Age - Girls (0-36 months)
 * Length in centimeters
 */
export const CDC_GIRLS_LENGTH: LMSData[] = [
  { month: 0, L: -1.295960857, M: 49.28639612, S: 0.03790 },
  { month: 0.5, L: -0.809249882, M: 51.68358057, S: 0.03578 },
  { month: 1.5, L: -0.050782985, M: 55.28612813, S: 0.03340 },
  { month: 2.5, L: 0.476851407, M: 58.09381906, S: 0.03192 },
  { month: 3.5, L: 0.843299612, M: 60.45980763, S: 0.03086 },
  { month: 4.5, L: 1.097562257, M: 62.53669656, S: 0.03006 },
  { month: 5.5, L: 1.272509641, M: 64.40632762, S: 0.02944 },
  { month: 6.5, L: 1.390428859, M: 66.11841553, S: 0.02894 },
  { month: 7.5, L: 1.466733925, M: 67.70574419, S: 0.02854 },
  { month: 8.5, L: 1.512301976, M: 69.19123614, S: 0.02822 },
  { month: 9.5, L: 1.534950767, M: 70.59163924, S: 0.02797 },
  { month: 10.5, L: 1.540390875, M: 71.91961673, S: 0.02778 },
  { month: 11.5, L: 1.532852892, M: 73.1850104, S: 0.02763 },
  { month: 12.5, L: 1.51550947, M: 74.39564379, S: 0.02752 },
  { month: 13.5, L: 1.490765028, M: 75.5578544, S: 0.02745 },
  { month: 14.5, L: 1.460458255, M: 76.67685871, S: 0.02741 },
  { month: 15.5, L: 1.426006009, M: 77.75700986, S: 0.02739 },
  { month: 16.5, L: 1.388507095, M: 78.80198406, S: 0.02740 },
  { month: 17.5, L: 1.348818127, M: 79.81491852, S: 0.02743 },
  { month: 18.5, L: 1.307609654, M: 80.79851532, S: 0.02748 },
  { month: 19.5, L: 1.265408149, M: 81.75512092, S: 0.02754 },
  { month: 20.5, L: 1.222627732, M: 82.6867881, S: 0.02761 },
  { month: 21.5, L: 1.179594365, M: 83.59532461, S: 0.02769 },
  { month: 22.5, L: 1.136564448, M: 84.48233206, S: 0.02778 },
  { month: 23.5, L: 1.093731947, M: 85.34923624, S: 0.02788 },
  { month: 24.5, L: 1.051272912, M: 86.1973169, S: 0.02798 },
  { month: 25.5, L: 1.041951175, M: 87.09026318, S: 0.02808 },
  { month: 26.5, L: 1.012592236, M: 87.95714182, S: 0.02818 },
  { month: 27.5, L: 0.970541909, M: 88.7960184, S: 0.02829 },
  { month: 28.5, L: 0.921129988, M: 89.6055115, S: 0.02840 },
  { month: 29.5, L: 0.868221392, M: 90.38476689, S: 0.02851 },
  { month: 30.5, L: 0.81454413, M: 91.13341722, S: 0.02862 },
  { month: 31.5, L: 0.761957977, M: 91.8515436, S: 0.02873 },
  { month: 32.5, L: 0.711660228, M: 92.5396352, S: 0.02884 },
  { month: 33.5, L: 0.664323379, M: 93.19854429, S: 0.02895 },
  { month: 34.5, L: 0.620285102, M: 93.82945392, S: 0.02906 },
  { month: 35.5, L: 0.57955631, M: 94.43382278, S: 0.02917 }
];

/**
 * CDC Head Circumference-for-Age - Boys (0-36 months)
 * Head circumference in centimeters
 */
export const CDC_BOYS_HEAD_CIRCUMFERENCE: LMSData[] = [
  { month: 0, L: 4.427825037, M: 35.81366835, S: 0.052172542 },
  { month: 0.5, L: 4.310927464, M: 37.19361054, S: 0.047259148 },
  { month: 1.5, L: 3.869576802, M: 39.20742929, S: 0.040947903 },
  { month: 2.5, L: 3.305593039, M: 40.65233195, S: 0.037027722 },
  { month: 3.5, L: 2.720590297, M: 41.76516959, S: 0.034364245 },
  { month: 4.5, L: 2.16804824, M: 42.66116148, S: 0.032462175 },
  { month: 5.5, L: 1.675465689, M: 43.40488731, S: 0.031064702 },
  { month: 6.5, L: 1.255160322, M: 44.03609923, S: 0.03002267 },
  { month: 7.5, L: 0.91054114, M: 44.58096912, S: 0.029242173 },
  { month: 8.5, L: 0.639510474, M: 45.05761215, S: 0.028660454 },
  { month: 9.5, L: 0.436978864, M: 45.4790756, S: 0.0282336 },
  { month: 10.5, L: 0.296275856, M: 45.85505706, S: 0.027929764 },
  { month: 11.5, L: 0.210107251, M: 46.19295427, S: 0.027725179 },
  { month: 12.5, L: 0.171147024, M: 46.49853438, S: 0.027601686 },
  { month: 13.5, L: 0.172393886, M: 46.77637684, S: 0.027545148 },
  { month: 14.5, L: 0.207371541, M: 47.03017599, S: 0.027544382 },
  { month: 15.5, L: 0.270226126, M: 47.2629533, S: 0.027590417 },
  { month: 16.5, L: 0.355757274, M: 47.47720989, S: 0.02767598 },
  { month: 17.5, L: 0.459407627, M: 47.67503833, S: 0.027795115 },
  { month: 18.5, L: 0.577227615, M: 47.85820606, S: 0.0279429 },
  { month: 19.5, L: 0.705826778, M: 48.02821867, S: 0.028115241 },
  { month: 20.5, L: 0.842319055, M: 48.18636864, S: 0.028308707 },
  { month: 21.5, L: 0.984266833, M: 48.3337732, S: 0.028520407 },
  { month: 22.5, L: 1.129626698, M: 48.47140432, S: 0.028747896 },
  { month: 23.5, L: 1.276691223, M: 48.60011223, S: 0.028989089 },
  { month: 24.5, L: 1.424084853, M: 48.72064621, S: 0.029242207 },
  { month: 25.5, L: 1.570621291, M: 48.83366629, S: 0.029505723 },
  { month: 26.5, L: 1.715393998, M: 48.93976089, S: 0.029778323 },
  { month: 27.5, L: 1.857652984, M: 49.03945383, S: 0.030058871 },
  { month: 28.5, L: 1.996810563, M: 49.13321432, S: 0.030346384 },
  { month: 29.5, L: 2.132411346, M: 49.22146409, S: 0.030640006 },
  { month: 30.5, L: 2.264111009, M: 49.30458348, S: 0.030938992 },
  { month: 31.5, L: 2.391658052, M: 49.38291658, S: 0.031242693 },
  { month: 32.5, L: 2.514878222, M: 49.45677569, S: 0.031550537 },
  { month: 33.5, L: 2.633661226, M: 49.526445, S: 0.031862026 },
  { month: 34.5, L: 2.747949445, M: 49.59218385, S: 0.03217672 },
  { month: 35.5, L: 2.857728375, M: 49.65422952, S: 0.032494231 },
  { month: 36, L: 2.910932095, M: 49.68393611, S: 0.032653934 }
];

/**
 * CDC Head Circumference-for-Age - Girls (0-36 months)
 * Head circumference in centimeters
 */
export const CDC_GIRLS_HEAD_CIRCUMFERENCE: LMSData[] = [
  { month: 0, L: -1.298749689, M: 34.7115617, S: 0.046905108 },
  { month: 0.5, L: -1.440271514, M: 36.03453876, S: 0.042999604 },
  { month: 1.5, L: -1.581016348, M: 37.97671987, S: 0.038067862 },
  { month: 2.5, L: -1.593136386, M: 39.3801263, S: 0.035079612 },
  { month: 3.5, L: -1.521492427, M: 40.46773733, S: 0.033096443 },
  { month: 4.5, L: -1.394565915, M: 41.34841008, S: 0.03170963 },
  { month: 5.5, L: -1.231713389, M: 42.0833507, S: 0.030709039 },
  { month: 6.5, L: -1.046582628, M: 42.71033603, S: 0.029974303 },
  { month: 7.5, L: -0.848932692, M: 43.25428882, S: 0.029430992 },
  { month: 8.5, L: -0.645779124, M: 43.73249646, S: 0.029030379 },
  { month: 9.5, L: -0.442165412, M: 44.15742837, S: 0.028739112 },
  { month: 10.5, L: -0.24163206, M: 44.53836794, S: 0.028533537 },
  { month: 11.5, L: -0.046673786, M: 44.88240562, S: 0.028396382 },
  { month: 12.5, L: 0.141031094, M: 45.19507651, S: 0.028314722 },
  { month: 13.5, L: 0.320403169, M: 45.48078147, S: 0.028278682 },
  { month: 14.5, L: 0.490807133, M: 45.74307527, S: 0.028280585 },
  { month: 15.5, L: 0.65193505, M: 45.98486901, S: 0.028314363 },
  { month: 16.5, L: 0.803718086, M: 46.20857558, S: 0.028375159 },
  { month: 17.5, L: 0.946259679, M: 46.41621635, S: 0.028459033 },
  { month: 18.5, L: 1.079784984, M: 46.60950084, S: 0.028562759 },
  { month: 19.5, L: 1.204602687, M: 46.78988722, S: 0.028683666 },
  { month: 20.5, L: 1.321076285, M: 46.95862881, S: 0.028819525 },
  { month: 21.5, L: 1.429602576, M: 47.11681039, S: 0.028968459 },
  { month: 22.5, L: 1.530595677, M: 47.26537682, S: 0.029128879 },
  { month: 23.5, L: 1.624475262, M: 47.40515585, S: 0.029299426 },
  { month: 24.5, L: 1.71165803, M: 47.53687649, S: 0.029478937 },
  { month: 25.5, L: 1.792551616, M: 47.66118396, S: 0.029666406 },
  { month: 26.5, L: 1.867550375, M: 47.77865186, S: 0.02986096 },
  { month: 27.5, L: 1.93703258, M: 47.8897923, S: 0.030061839 },
  { month: 28.5, L: 2.001358669, M: 47.99506422, S: 0.030268375 },
  { month: 29.5, L: 2.060870301, M: 48.09488048, S: 0.030479985 },
  { month: 30.5, L: 2.115889982, M: 48.18961365, S: 0.03069615 },
  { month: 31.5, L: 2.16672113, M: 48.2796011, S: 0.030916413 },
  { month: 32.5, L: 2.21364844, M: 48.36514917, S: 0.031140368 },
  { month: 33.5, L: 2.256943216, M: 48.44653703, S: 0.031367651 },
  { month: 34.5, L: 2.296844024, M: 48.52401894, S: 0.031597939 },
  { month: 35.5, L: 2.333589434, M: 48.59782828, S: 0.031830942 },
  { month: 36, L: 2.350847202, M: 48.63342328, S: 0.031948378 }
];

// ============================================================================
// WHO GROWTH STANDARDS (0-60 MONTHS) - PLACEHOLDER
// ============================================================================
// NOTE: To get the complete WHO data for 0-60 months, download the Excel files from:
//
// Weight-for-age:
// - Boys: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-boys-zscore-expanded-tables.xlsx
// - Girls: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-girls-zscore-expanded-tables.xlsx
//
// Length/Height-for-age:
// - Boys: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/length-height-for-age/expandable-tables/lhfa-boys-zscore-expanded-tables.xlsx
// - Girls: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/length-height-for-age/expandable-tables/lhfa-girls-zscore-expanded-tables.xlsx
//
// Head Circumference-for-age:
// - Boys: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/head-circumference-for-age/expanded-tables/hcfa-boys-zscore-expanded-tables.xlsx
// - Girls: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/head-circumference-for-age/expanded-tables/hcfa-girls-zscore-expanded-tables.xlsx
//
// The Excel files contain the LMS values organized by age in days/weeks/months.
// Parse the Excel files and extract columns for Age, L, M, and S for each measurement.
//
// WHO data covers:
// - 0-13 weeks: By week
// - 14 weeks to 60 months: By month
//
// For reference, the RCPCH has a consolidated CSV version at:
// https://raw.githubusercontent.com/rcpch/growth-references/main/who2006/WHO2006.csv

/**
 * WHO Weight-for-Age - Boys (0-24 months from CDC WHO files)
 * Note: This is a subset. Full WHO data goes to 60 months.
 */
export const WHO_BOYS_WEIGHT_0_24: LMSData[] = [
  // Placeholder - download from WHO source above
  // CSV data available from CDC at:
  // https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-age-Percentiles.csv
];

/**
 * WHO Weight-for-Age - Girls (0-24 months from CDC WHO files)
 * Note: This is a subset. Full WHO data goes to 60 months.
 */
export const WHO_GIRLS_WEIGHT_0_24: LMSData[] = [
  // Placeholder - download from WHO source above
  // CSV data available from CDC at:
  // https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-age%20Percentiles.csv
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate Z-score from measurement value using LMS parameters
 * @param value - The measured value (weight in kg, length in cm, etc.)
 * @param L - Lambda (Box-Cox transformation power)
 * @param M - Mu (median)
 * @param S - Sigma (coefficient of variation)
 * @returns Z-score
 */
export function calculateZScore(value: number, L: number, M: number, S: number): number {
  if (Math.abs(L) < 0.00001) {
    // When L ≈ 0, use logarithmic formula
    return Math.log(value / M) / S;
  } else {
    // Standard LMS formula
    return (Math.pow(value / M, L) - 1) / (L * S);
  }
}

/**
 * Calculate percentile from Z-score using normal distribution
 * @param zScore - The Z-score
 * @returns Percentile (0-100)
 */
export function zScoreToPercentile(zScore: number): number {
  // Approximation of normal CDF (cumulative distribution function)
  // For more accuracy, use a statistical library like jStat or simple-statistics
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return zScore >= 0 ? (1 - probability) * 100 : probability * 100;
}

/**
 * Find LMS data for a specific age using linear interpolation if needed
 * @param data - Array of LMS data points
 * @param ageInMonths - Age in months (can be fractional)
 * @returns Interpolated LMS values
 */
export function getLMSForAge(data: LMSData[], ageInMonths: number): LMSData {
  // Find exact match
  const exact = data.find(d => Math.abs(d.month - ageInMonths) < 0.01);
  if (exact) return exact;

  // Find surrounding points for interpolation
  const lower = data.filter(d => d.month <= ageInMonths).pop();
  const upper = data.find(d => d.month > ageInMonths);

  if (!lower) return data[0];
  if (!upper) return data[data.length - 1];

  // Linear interpolation
  const ratio = (ageInMonths - lower.month) / (upper.month - lower.month);

  return {
    month: ageInMonths,
    L: lower.L + (upper.L - lower.L) * ratio,
    M: lower.M + (upper.M - lower.M) * ratio,
    S: lower.S + (upper.S - lower.S) * ratio
  };
}

/**
 * Calculate growth percentile for a measurement
 * @param value - Measured value (kg or cm)
 * @param ageInMonths - Age in months
 * @param data - LMS data array (e.g., CDC_BOYS_WEIGHT)
 * @returns Object with z-score and percentile
 */
export function calculatePercentile(
  value: number,
  ageInMonths: number,
  data: LMSData[]
): { zScore: number; percentile: number; lms: LMSData } {
  const lms = getLMSForAge(data, ageInMonths);
  const zScore = calculateZScore(value, lms.L, lms.M, lms.S);
  const percentile = zScoreToPercentile(zScore);

  return { zScore, percentile, lms };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// Example: Calculate percentile for a 6-month-old boy weighing 8 kg

const babyWeight = 8; // kg
const babyAgeMonths = 6;

const result = calculatePercentile(babyWeight, babyAgeMonths, CDC_BOYS_WEIGHT);

console.log(`Age: ${babyAgeMonths} months`);
console.log(`Weight: ${babyWeight} kg`);
console.log(`Z-score: ${result.zScore.toFixed(2)}`);
console.log(`Percentile: ${result.percentile.toFixed(1)}th`);
console.log(`Reference median (50th percentile): ${result.lms.M.toFixed(2)} kg`);

// For WHO data (when available):
// const whoResult = calculatePercentile(babyWeight, babyAgeMonths, WHO_BOYS_WEIGHT);
*/
