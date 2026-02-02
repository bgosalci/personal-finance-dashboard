const UKTaxYears = {
    '2025/26': {
        personalAllowance: 12570,
        paTaperStart: 100000,
        paTaperEnd: 125140,
        basicRateBand: 37700,
        higherRateThreshold: 125140,
        dividendAllowance: 500,
        dividendRates: {
            basic: 0.0875,
            higher: 0.3375,
            additional: 0.3935
        },
        cgtAnnualExempt: 3000,
        cgtRates: {
            basic: 0.18,
            higher: 0.24
        }
    },
    '2026/27': {
        personalAllowance: 12570,
        paTaperStart: 100000,
        paTaperEnd: 125140,
        basicRateBand: 37700,
        higherRateThreshold: 125140,
        dividendAllowance: 500,
        dividendRates: {
            basic: 0.1075,
            higher: 0.3575,
            additional: 0.3935
        },
        cgtAnnualExempt: 3000,
        cgtRates: {
            basic: 0.18,
            higher: 0.24
        }
    }
};

if (typeof window !== 'undefined') {
    window.UKTaxYears = UKTaxYears;
}
