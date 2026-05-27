/**
 * Historical S&P 500 and US Bond annual returns 1926–2024
 * Sources: Shiller CAPE dataset, Ibbotson Associates
 * Stock returns are total nominal returns (price + dividends)
 * Bond returns are long-term US government bond total returns
 */

export interface AnnualReturn {
  year: number;
  stocks: number; // decimal, e.g. 0.265 = 26.5%
  bonds: number;
  inflation: number;
}

export const historicalReturns: AnnualReturn[] = [
  { year: 1926, stocks: 0.1161, bonds: 0.0777, inflation: -0.0149 },
  { year: 1927, stocks: 0.3749, bonds: 0.0893, inflation: -0.0209 },
  { year: 1928, stocks: 0.4361, bonds: 0.0084, inflation: -0.0097 },
  { year: 1929, stocks: -0.0843, bonds: 0.042, inflation: 0.002 },
  { year: 1930, stocks: -0.249, bonds: 0.0666, inflation: -0.0601 },
  { year: 1931, stocks: -0.4334, bonds: -0.0531, inflation: -0.0952 },
  { year: 1932, stocks: -0.0819, bonds: 0.1682, inflation: -0.1027 },
  { year: 1933, stocks: 0.5399, bonds: 0.0018, inflation: 0.0051 },
  { year: 1934, stocks: -0.0144, bonds: 0.1003, inflation: 0.0209 },
  { year: 1935, stocks: 0.4767, bonds: 0.0498, inflation: 0.0293 },
  { year: 1936, stocks: 0.3392, bonds: 0.0751, inflation: 0.0115 },
  { year: 1937, stocks: -0.3503, bonds: 0.0023, inflation: 0.0371 },
  { year: 1938, stocks: 0.3112, bonds: 0.0553, inflation: -0.027 },
  { year: 1939, stocks: -0.0041, bonds: 0.0594, inflation: 0.0 },
  { year: 1940, stocks: -0.0978, bonds: 0.0609, inflation: 0.0072 },
  { year: 1941, stocks: -0.1159, bonds: 0.0093, inflation: 0.0993 },
  { year: 1942, stocks: 0.2034, bonds: 0.0322, inflation: 0.0904 },
  { year: 1943, stocks: 0.259, bonds: 0.0208, inflation: 0.0296 },
  { year: 1944, stocks: 0.1975, bonds: 0.0281, inflation: 0.023 },
  { year: 1945, stocks: 0.3644, bonds: 0.1073, inflation: 0.0225 },
  { year: 1946, stocks: -0.0807, bonds: 0.0359, inflation: 0.1811 },
  { year: 1947, stocks: 0.0571, bonds: -0.0023, inflation: 0.0885 },
  { year: 1948, stocks: 0.055, bonds: 0.034, inflation: 0.0276 },
  { year: 1949, stocks: 0.1879, bonds: 0.0645, inflation: -0.0198 },
  { year: 1950, stocks: 0.3171, bonds: 0.0006, inflation: 0.0579 },
  { year: 1951, stocks: 0.2402, bonds: -0.0394, inflation: 0.059 },
  { year: 1952, stocks: 0.1837, bonds: 0.0116, inflation: 0.0088 },
  { year: 1953, stocks: -0.0099, bonds: 0.0363, inflation: 0.0075 },
  { year: 1954, stocks: 0.5262, bonds: 0.0719, inflation: -0.0074 },
  { year: 1955, stocks: 0.3156, bonds: -0.013, inflation: 0.0037 },
  { year: 1956, stocks: 0.0656, bonds: -0.0559, inflation: 0.0299 },
  { year: 1957, stocks: -0.1078, bonds: 0.0945, inflation: 0.0289 },
  { year: 1958, stocks: 0.4336, bonds: -0.0617, inflation: 0.0176 },
  { year: 1959, stocks: 0.1196, bonds: -0.0226, inflation: 0.015 },
  { year: 1960, stocks: 0.0047, bonds: 0.1378, inflation: 0.0148 },
  { year: 1961, stocks: 0.2689, bonds: 0.0097, inflation: 0.0067 },
  { year: 1962, stocks: -0.0873, bonds: 0.0689, inflation: 0.0125 },
  { year: 1963, stocks: 0.228, bonds: 0.0121, inflation: 0.0165 },
  { year: 1964, stocks: 0.1648, bonds: 0.0351, inflation: 0.0119 },
  { year: 1965, stocks: 0.1245, bonds: 0.0071, inflation: 0.0192 },
  { year: 1966, stocks: -0.1006, bonds: 0.0365, inflation: 0.035 },
  { year: 1967, stocks: 0.2398, bonds: -0.0919, inflation: 0.0304 },
  { year: 1968, stocks: 0.1106, bonds: -0.0026, inflation: 0.0472 },
  { year: 1969, stocks: -0.085, bonds: -0.0508, inflation: 0.0611 },
  { year: 1970, stocks: 0.0401, bonds: 0.121, inflation: 0.0549 },
  { year: 1971, stocks: 0.1431, bonds: 0.1323, inflation: 0.0336 },
  { year: 1972, stocks: 0.1898, bonds: 0.0559, inflation: 0.0341 },
  { year: 1973, stocks: -0.1466, bonds: -0.0111, inflation: 0.088 },
  { year: 1974, stocks: -0.2647, bonds: 0.0435, inflation: 0.122 },
  { year: 1975, stocks: 0.372, bonds: 0.0919, inflation: 0.0701 },
  { year: 1976, stocks: 0.2384, bonds: 0.1675, inflation: 0.0481 },
  { year: 1977, stocks: -0.0718, bonds: -0.0067, inflation: 0.0677 },
  { year: 1978, stocks: 0.0656, bonds: -0.0116, inflation: 0.0903 },
  { year: 1979, stocks: 0.1844, bonds: -0.0122, inflation: 0.1329 },
  { year: 1980, stocks: 0.3242, bonds: -0.0396, inflation: 0.1252 },
  { year: 1981, stocks: -0.0491, bonds: 0.0185, inflation: 0.0882 },
  { year: 1982, stocks: 0.2141, bonds: 0.4035, inflation: 0.0383 },
  { year: 1983, stocks: 0.2251, bonds: 0.0068, inflation: 0.0379 },
  { year: 1984, stocks: 0.0627, bonds: 0.1548, inflation: 0.0395 },
  { year: 1985, stocks: 0.3216, bonds: 0.3097, inflation: 0.0377 },
  { year: 1986, stocks: 0.1847, bonds: 0.2453, inflation: 0.0113 },
  { year: 1987, stocks: 0.0523, bonds: -0.0269, inflation: 0.0441 },
  { year: 1988, stocks: 0.1681, bonds: 0.0967, inflation: 0.0442 },
  { year: 1989, stocks: 0.3149, bonds: 0.1811, inflation: 0.0465 },
  { year: 1990, stocks: -0.0317, bonds: 0.0621, inflation: 0.0611 },
  { year: 1991, stocks: 0.3047, bonds: 0.1924, inflation: 0.0306 },
  { year: 1992, stocks: 0.0761, bonds: 0.084, inflation: 0.029 },
  { year: 1993, stocks: 0.1008, bonds: 0.1824, inflation: 0.0275 },
  { year: 1994, stocks: 0.0132, bonds: -0.0777, inflation: 0.0267 },
  { year: 1995, stocks: 0.3758, bonds: 0.3167, inflation: 0.0254 },
  { year: 1996, stocks: 0.2296, bonds: -0.0093, inflation: 0.0332 },
  { year: 1997, stocks: 0.3336, bonds: 0.159, inflation: 0.017 },
  { year: 1998, stocks: 0.2858, bonds: 0.1286, inflation: 0.016 },
  { year: 1999, stocks: 0.2104, bonds: -0.0851, inflation: 0.0272 },
  { year: 2000, stocks: -0.091, bonds: 0.2127, inflation: 0.0338 },
  { year: 2001, stocks: -0.1189, bonds: 0.0356, inflation: 0.0283 },
  { year: 2002, stocks: -0.221, bonds: 0.1716, inflation: 0.0159 },
  { year: 2003, stocks: 0.2868, bonds: 0.0212, inflation: 0.023 },
  { year: 2004, stocks: 0.1088, bonds: 0.0823, inflation: 0.0271 },
  { year: 2005, stocks: 0.0491, bonds: 0.0707, inflation: 0.0342 },
  { year: 2006, stocks: 0.1579, bonds: 0.0142, inflation: 0.0254 },
  { year: 2007, stocks: 0.0549, bonds: 0.0296, inflation: 0.0408 },
  { year: 2008, stocks: -0.37, bonds: 0.261, inflation: 0.0009 },
  { year: 2009, stocks: 0.2646, bonds: -0.1412, inflation: 0.027 },
  { year: 2010, stocks: 0.1506, bonds: 0.0842, inflation: 0.015 },
  { year: 2011, stocks: 0.0211, bonds: 0.296, inflation: 0.0296 },
  { year: 2012, stocks: 0.16, bonds: 0.0254, inflation: 0.0174 },
  { year: 2013, stocks: 0.3239, bonds: -0.1278, inflation: 0.015 },
  { year: 2014, stocks: 0.1369, bonds: 0.2858, inflation: 0.0076 },
  { year: 2015, stocks: 0.0138, bonds: -0.0136, inflation: 0.0073 },
  { year: 2016, stocks: 0.1196, bonds: 0.0143, inflation: 0.0207 },
  { year: 2017, stocks: 0.2183, bonds: 0.028, inflation: 0.0211 },
  { year: 2018, stocks: -0.0438, bonds: 0.0001, inflation: 0.0244 },
  { year: 2019, stocks: 0.3149, bonds: 0.2535, inflation: 0.0229 },
  { year: 2020, stocks: 0.184, bonds: 0.1699, inflation: 0.0136 },
  { year: 2021, stocks: 0.2871, bonds: -0.0451, inflation: 0.047 },
  { year: 2022, stocks: -0.1811, bonds: -0.2595, inflation: 0.08 },
  { year: 2023, stocks: 0.2629, bonds: 0.0384, inflation: 0.0314 },
  { year: 2024, stocks: 0.2502, bonds: -0.0182, inflation: 0.029 },
];

/** Average annual stock return 1926–2024 */
export const AVERAGE_STOCK_RETURN = 0.1035;

/** Average annual bond return 1926–2024 */
export const AVERAGE_BOND_RETURN = 0.0525;

/** Average inflation 1926–2024 */
export const AVERAGE_INFLATION = 0.0298;

/** Standard deviation of stock returns (for Monte Carlo) */
export const STOCK_RETURN_STD_DEV = 0.196;

/** Standard deviation of bond returns */
export const BOND_RETURN_STD_DEV = 0.098;
