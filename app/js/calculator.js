// Calculator Module
const Calculator = (function() {
    let currentSubTab = 'loan';
    let currentFairValueSection = 'dcf';
    
    function formatCurrency(amount) {
        const currency = Settings && typeof Settings.getBaseCurrency === 'function'
            ? Settings.getBaseCurrency()
            : 'USD';
        return I18n.formatCurrency(amount, currency);
    }

    function formatPercentage(rate) {
        return I18n.formatNumber(rate, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    }

    function formatNumber(num) {
        return I18n.formatNumber(num, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatInputValue(value, pad = false) {
        const clean = value.replace(/[^0-9.]/g, '');
        if (clean === '') return '';
        const [intPart, decPart] = clean.split('.');
        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (decPart !== undefined) {
            if (decPart === '') {
                return `${formattedInt}.`;
            }
            const decimals = decPart.slice(0, 2);
            return pad ? `${formattedInt}.${decimals.padEnd(2, '0')}` : `${formattedInt}.${decimals}`;
        }
        return formattedInt;
    }

    function setupAmountInput(id) {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener('input', (e) => {
            e.target.value = formatInputValue(e.target.value);
        });
        input.addEventListener('blur', (e) => {
            e.target.value = formatInputValue(e.target.value, true);
        });
    }

    function getNumberValue(id) {
        const el = document.getElementById(id);
        return parseFloat(el.value.replace(/,/g, '')) || 0;
    }

    function updateCurrencyDisplays() {
        const currency = Settings && typeof Settings.getBaseCurrency === 'function'
            ? Settings.getBaseCurrency()
            : 'USD';
        const loanLabel = document.getElementById('loan-base-currency-label');
        const investLabel = document.getElementById('invest-base-currency-label');
        const mortgagePropertyLabel = document.getElementById('mortgage-property-currency-label');
        const mortgageDepositLabel = document.getElementById('mortgage-deposit-currency-label');
        const mortgageAmountLabel = document.getElementById('mortgage-amount-currency-label');
        if (loanLabel) loanLabel.textContent = currency;
        if (investLabel) investLabel.textContent = currency;
        if (mortgagePropertyLabel) mortgagePropertyLabel.textContent = currency;
        if (mortgageDepositLabel) mortgageDepositLabel.textContent = currency;
        if (mortgageAmountLabel) mortgageAmountLabel.textContent = currency;
        const mortgageAmountInput = document.getElementById('mortgage-amount');
        if (mortgageAmountInput) {
            mortgageAmountInput.value = formatInputValue('0.00', true);
        }
        ['loan-monthly-payment', 'loan-total-interest', 'loan-total-amount'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = formatCurrency(0);
        });
        ['invest-total-return', 'invest-final-value'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = formatCurrency(0);
        });
        ['mortgage-monthly-payment', 'mortgage-average-interest', 'mortgage-average-principal',
            'mortgage-total-amount', 'mortgage-total-interest', 'mortgage-total-principal'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = formatCurrency(0);
        });
    }

    // Sub-Tab Management
    function switchSubTab(subTabName) {
        const subTabs = document.querySelectorAll('.sub-nav-tab');
        const subContents = document.querySelectorAll('.sub-tab-content');

        subTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.subtab === subTabName) {
                tab.classList.add('active');
            }
        });

        subContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === subTabName) {
                content.classList.add('active');
            }
        });

        currentSubTab = subTabName;
    }

    // Fair Value Section Management
    function switchFairValueSection(sectionName) {
        const sectionBtns = document.querySelectorAll('.fair-value-btn');
        const sections = document.querySelectorAll('.fair-value-section');

        sectionBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === sectionName) {
                btn.classList.add('active');
            }
        });

        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionName) {
                section.classList.add('active');
            }
        });

        currentFairValueSection = sectionName;
    }

    // Loan Calculator
    const LoanCalculator = (function() {
        function calculate() {
            const principal = getNumberValue('loan-principal');
            const annualRate = parseFloat(document.getElementById('loan-rate').value) || 0;
            const years = parseFloat(document.getElementById('loan-term').value) || 0;

            if (principal <= 0 || annualRate <= 0 || years <= 0) {
                document.getElementById('loan-results').style.display = 'none';
                return;
            }

            const monthlyRate = annualRate / 100 / 12;
            const totalPayments = years * 12;
            
            const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                                 (Math.pow(1 + monthlyRate, totalPayments) - 1);
            
            const totalAmount = monthlyPayment * totalPayments;
            const totalInterest = totalAmount - principal;

            document.getElementById('loan-monthly-payment').textContent = formatCurrency(monthlyPayment);
            document.getElementById('loan-total-interest').textContent = formatCurrency(totalInterest);
            document.getElementById('loan-total-amount').textContent = formatCurrency(totalAmount);
            document.getElementById('loan-results').style.display = 'block';
        }

        function init() {
            const inputs = ['loan-principal', 'loan-rate', 'loan-term'];
            inputs.forEach(id => {
                document.getElementById(id).addEventListener('input', calculate);
            });
            setupAmountInput('loan-principal');
        }

        return { init };
    })();

    // Investment Calculator
    const InvestmentCalculator = (function() {
        function calculate() {
            const initial = getNumberValue('invest-initial');
            const annualRate = parseFloat(document.getElementById('invest-rate').value) || 0;
            const years = parseFloat(document.getElementById('invest-years').value) || 0;

            if (initial <= 0 || annualRate < 0 || years <= 0) {
                document.getElementById('investment-results').style.display = 'none';
                document.getElementById('investment-growth-container').style.display = 'none';
                return;
            }

            // Simple annual compounding: Final Value = Principal × (1 + rate)^years
            const annualRateDecimal = annualRate / 100;
            const finalValue = initial * Math.pow(1 + annualRateDecimal, years);
            const totalReturn = finalValue - initial;

            document.getElementById('invest-total-return').textContent = formatCurrency(totalReturn);
            document.getElementById('invest-final-value').textContent = formatCurrency(finalValue);
            document.getElementById('investment-results').style.display = 'block';

            // Build yearly growth table
            const tbody = document.getElementById('investment-growth-body');
            tbody.innerHTML = '';
            let value = initial;
            const row0 = document.createElement('tr');
            row0.innerHTML = `<td>${I18n.t('calculators.investment.table.start')}</td><td>-</td><td>${formatCurrency(value)}</td>`;
            tbody.appendChild(row0);
            for (let i = 1; i <= years; i++) {
                const newValue = value * (1 + annualRateDecimal);
                const growth = newValue - value;
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${I18n.t('calculators.investment.table.year')} ${i}</td><td>${formatCurrency(growth)}</td><td>${formatCurrency(newValue)}</td>`;
                tbody.appendChild(tr);
                value = newValue;
            }
            document.getElementById('investment-growth-container').style.display = 'block';
        }

        function init() {
            const inputs = ['invest-initial', 'invest-rate', 'invest-years'];
            inputs.forEach(id => {
                document.getElementById(id).addEventListener('input', calculate);
            });
            setupAmountInput('invest-initial');
        }

        return { init };
    })();

    // CAGR Calculator
    const CAGRCalculator = (function() {
        function calculate() {
            const beginning = getNumberValue('cagr-beginning');
            const ending = getNumberValue('cagr-ending');
            const years = parseFloat(document.getElementById('cagr-years').value) || 0;

            if (beginning <= 0 || ending <= 0 || years <= 0) {
                document.getElementById('cagr-results').style.display = 'none';
                return;
            }

            const totalReturn = ((ending - beginning) / beginning) * 100;
            const cagr = (Math.pow(ending / beginning, 1 / years) - 1) * 100;

            document.getElementById('cagr-total-return').textContent = formatPercentage(totalReturn);
            document.getElementById('cagr-rate').textContent = formatPercentage(cagr);
            document.getElementById('cagr-results').style.display = 'block';
        }

        function init() {
            const inputs = ['cagr-beginning', 'cagr-ending', 'cagr-years'];
            inputs.forEach(id => {
                document.getElementById(id).addEventListener('input', calculate);
            });
            setupAmountInput('cagr-beginning');
            setupAmountInput('cagr-ending');
        }

        return { init };
    })();

    // Mortgage Calculator
    const MortgageCalculator = (function() {
        function calculate() {
            const propertyPrice = getNumberValue('mortgage-property-price');
            const deposit = getNumberValue('mortgage-deposit');
            const rawPrincipal = propertyPrice - deposit;
            const principal = rawPrincipal > 0 ? rawPrincipal : 0;
            const rate = parseFloat(document.getElementById('mortgage-rate').value) || 0;
            const years = parseFloat(document.getElementById('mortgage-term').value) || 0;

            const mortgageAmountInput = document.getElementById('mortgage-amount');
            if (mortgageAmountInput) {
                mortgageAmountInput.value = principal > 0
                    ? formatInputValue(principal.toFixed(2), true)
                    : formatInputValue('0.00', true);
            }

            if (propertyPrice <= 0 || principal <= 0 || rate < 0 || years <= 0) {
                document.getElementById('mortgage-results').style.display = 'none';
                return;
            }

            const monthlyRate = rate / 100 / 12;
            const totalPayments = Math.max(Math.round(years * 12), 1);

            let monthlyPayment;
            if (monthlyRate === 0) {
                monthlyPayment = principal / totalPayments;
            } else {
                const factor = Math.pow(1 + monthlyRate, totalPayments);
                monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
            }

            const totalAmount = monthlyPayment * totalPayments;
            const totalInterest = totalAmount - principal;
            const averageInterestPortion = totalPayments > 0 ? totalInterest / totalPayments : 0;
            const averagePrincipalPortion = totalPayments > 0 ? principal / totalPayments : 0;

            document.getElementById('mortgage-monthly-payment').textContent = formatCurrency(monthlyPayment);
            document.getElementById('mortgage-average-interest').textContent = formatCurrency(averageInterestPortion);
            document.getElementById('mortgage-average-principal').textContent = formatCurrency(averagePrincipalPortion);
            document.getElementById('mortgage-total-amount').textContent = formatCurrency(totalAmount);
            document.getElementById('mortgage-total-interest').textContent = formatCurrency(totalInterest);
            document.getElementById('mortgage-total-principal').textContent = formatCurrency(principal);
            document.getElementById('mortgage-results').style.display = 'block';
        }

        function init() {
            ['mortgage-property-price', 'mortgage-deposit'].forEach(setupAmountInput);
            const amountInput = document.getElementById('mortgage-amount');
            if (amountInput) {
                amountInput.value = formatInputValue('0.00', true);
            }
            const inputs = ['mortgage-property-price', 'mortgage-deposit', 'mortgage-rate', 'mortgage-term'];
            inputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('input', calculate);
                }
            });
        }

        return { init };
    })();

    // Fair Value Calculator
    const FairValueCalculator = (function() {
        
        // DCF Calculator
        const DCFCalculator = (function() {
            function calculate() {
                const currentFCF = getNumberValue('dcf-current-fcf');
                const growthRate = parseFloat(document.getElementById('dcf-growth-rate').value) || 0;
                const terminalRate = parseFloat(document.getElementById('dcf-terminal-rate').value) || 0;
                const discountRate = parseFloat(document.getElementById('dcf-discount-rate').value) || 0;
                const projectionYears = parseInt(document.getElementById('dcf-years').value) || 0;
                const sharesOutstanding = getNumberValue('dcf-shares');

                if (currentFCF <= 0 || discountRate <= 0 || projectionYears <= 0 || sharesOutstanding <= 0) {
                    document.getElementById('dcf-results').style.display = 'none';
                    return;
                }

                const discountRateDecimal = discountRate / 100;
                const growthRateDecimal = growthRate / 100;
                const terminalRateDecimal = terminalRate / 100;

                // Calculate projected cash flows and their present values
                let pvCashFlows = 0;
                for (let year = 1; year <= projectionYears; year++) {
                    const fcf = currentFCF * Math.pow(1 + growthRateDecimal, year);
                    const pv = fcf / Math.pow(1 + discountRateDecimal, year);
                    pvCashFlows += pv;
                }

                // Calculate terminal value
                const terminalFCF = currentFCF * Math.pow(1 + growthRateDecimal, projectionYears) * (1 + terminalRateDecimal);
                const terminalValue = terminalFCF / (discountRateDecimal - terminalRateDecimal);
                const pvTerminalValue = terminalValue / Math.pow(1 + discountRateDecimal, projectionYears);

                // Calculate enterprise value and per share value
                const enterpriseValue = pvCashFlows + pvTerminalValue;
                const valuePerShare = enterpriseValue / sharesOutstanding;

                document.getElementById('dcf-enterprise-value').textContent = formatCurrency(enterpriseValue * 1000000);
                document.getElementById('dcf-pv-cashflows').textContent = formatCurrency(pvCashFlows * 1000000);
                document.getElementById('dcf-terminal-value').textContent = formatCurrency(pvTerminalValue * 1000000);
                document.getElementById('dcf-per-share').textContent = formatCurrency(valuePerShare * 1000000 / sharesOutstanding);
                document.getElementById('dcf-results').style.display = 'block';
            }

            function init() {
                setupAmountInput('dcf-current-fcf');
                setupAmountInput('dcf-shares');
                const inputs = ['dcf-current-fcf', 'dcf-growth-rate', 'dcf-terminal-rate', 'dcf-discount-rate', 'dcf-years', 'dcf-shares'];
                inputs.forEach(id => {
                    document.getElementById(id).addEventListener('input', calculate);
                });
            }

            return { init };
        })();

        // P/E Ratio Calculator
        const PECalculator = (function() {
            function calculate() {
                const currentPrice = getNumberValue('pe-current-price');
                const eps = parseFloat(document.getElementById('pe-eps').value) || 0;
                const industryPE = parseFloat(document.getElementById('pe-industry-avg').value) || 0;
                const growthRate = parseFloat(document.getElementById('pe-growth-rate').value) || 0;

                if (currentPrice <= 0 || eps <= 0 || industryPE <= 0) {
                    document.getElementById('pe-results').style.display = 'none';
                    return;
                }

                const currentPE = currentPrice / eps;
                const fairValue = eps * industryPE;
                const pegRatio = growthRate > 0 ? currentPE / growthRate : 0;
                
                let valuationStatus = '';
                const valuationDiff = ((currentPrice - fairValue) / fairValue) * 100;
                
                if (valuationDiff > 10) {
                    valuationStatus = `Overvalued by ${formatPercentage(Math.abs(valuationDiff))}`;
                } else if (valuationDiff < -10) {
                    valuationStatus = `Undervalued by ${formatPercentage(Math.abs(valuationDiff))}`;
                } else {
                    valuationStatus = 'Fairly Valued';
                }

                document.getElementById('pe-current-ratio').textContent = formatNumber(currentPE);
                document.getElementById('pe-fair-value').textContent = formatCurrency(fairValue);
                document.getElementById('pe-peg-ratio').textContent = formatNumber(pegRatio);
                document.getElementById('pe-valuation-status').textContent = valuationStatus;
                document.getElementById('pe-results').style.display = 'block';
            }

            function init() {
                setupAmountInput('pe-current-price');
                const inputs = ['pe-current-price', 'pe-eps', 'pe-industry-avg', 'pe-growth-rate'];
                inputs.forEach(id => {
                    document.getElementById(id).addEventListener('input', calculate);
                });
            }

            return { init };
        })();

        // Intrinsic Value Calculator
        const IntrinsicValueCalculator = (function() {
            function calculate() {
                const bookValue = parseFloat(document.getElementById('intrinsic-book-value').value) || 0;
                const roe = parseFloat(document.getElementById('intrinsic-roe').value) || 0;
                const dividendYield = parseFloat(document.getElementById('intrinsic-dividend-yield').value) || 0;
                const requiredReturn = parseFloat(document.getElementById('intrinsic-required-return').value) || 0;
                const growthRate = parseFloat(document.getElementById('intrinsic-growth-rate').value) || 0;
                const eps = parseFloat(document.getElementById('intrinsic-eps').value) || 0;

                if (bookValue <= 0 || eps <= 0) {
                    document.getElementById('intrinsic-results').style.display = 'none';
                    return;
                }

                // Graham Number = √(22.5 × EPS × Book Value)
                const grahamNumber = Math.sqrt(22.5 * eps * bookValue);

                // Dividend Discount Model (simplified)
                const dividendPerShare = (eps * dividendYield) / 100;
                const ddmValue = requiredReturn > growthRate && requiredReturn > 0 && growthRate >= 0 ? 
                                dividendPerShare / ((requiredReturn / 100) - (growthRate / 100)) : 0;

                // Book Value Multiple (using ROE)
                const bookMultiple = bookValue * (1 + (roe / 100));

                // Average intrinsic value
                const values = [grahamNumber, ddmValue, bookMultiple].filter(v => v > 0);
                const avgIntrinsicValue = values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;

                document.getElementById('intrinsic-graham').textContent = formatCurrency(grahamNumber);
                document.getElementById('intrinsic-ddm').textContent = ddmValue > 0 ? formatCurrency(ddmValue) : 'N/A';
                document.getElementById('intrinsic-book-multiple').textContent = formatCurrency(bookMultiple);
                document.getElementById('intrinsic-average').textContent = formatCurrency(avgIntrinsicValue);
                document.getElementById('intrinsic-results').style.display = 'block';
            }

            function init() {
                const inputs = ['intrinsic-book-value', 'intrinsic-roe', 'intrinsic-dividend-yield', 
                              'intrinsic-required-return', 'intrinsic-growth-rate', 'intrinsic-eps'];
                inputs.forEach(id => {
                    document.getElementById(id).addEventListener('input', calculate);
                });
            }

            return { init };
        })();

        function init() {
            DCFCalculator.init();
            PECalculator.init();
            IntrinsicValueCalculator.init();

            // Initialize fair value section navigation
            const fairValueBtns = document.querySelectorAll('.fair-value-btn');
            fairValueBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    switchFairValueSection(btn.dataset.section);
                });
            });
        }

        return { init };
    })();

    function init() {
        updateCurrencyDisplays();
        document.addEventListener('baseCurrencyChanged', updateCurrencyDisplays);

        // Initialize sub-tab navigation
        const subTabs = document.querySelectorAll('.sub-nav-tab');
        subTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchSubTab(tab.dataset.subtab);
            });
        });

        // Initialize all calculators
        LoanCalculator.init();
        InvestmentCalculator.init();
        CAGRCalculator.init();
        MortgageCalculator.init();
        FairValueCalculator.init();
    }

    return {
        init,
        formatCurrency,
        formatPercentage
    };
})();
