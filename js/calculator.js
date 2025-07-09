export const Calculator = (function() {
    'use strict';
    
    let currentSubTab = 'loan';
    let currentFairValueSection = 'dcf';
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    function formatPercentage(rate) {
        return (rate).toFixed(2) + '%';
    }

    function formatNumber(num) {
        return num.toFixed(2);
    }

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

    const LoanCalculator = (function() {
        function calculate() {
            const principal = parseFloat(document.getElementById('loan-principal').value) || 0;
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
        }

        return { init };
    })();

    const InvestmentCalculator = (function() {
        function calculate() {
            const initial = parseFloat(document.getElementById('invest-initial').value) || 0;
            const annualRate = parseFloat(document.getElementById('invest-rate').value) || 0;
            const years = parseFloat(document.getElementById('invest-years').value) || 0;

            if (initial <= 0 || annualRate < 0 || years <= 0) {
                document.getElementById('investment-results').style.display = 'none';
                document.getElementById('investment-growth-container').style.display = 'none';
                return;
            }

            const annualRateDecimal = annualRate / 100;
            const finalValue = initial * Math.pow(1 + annualRateDecimal, years);
            const totalReturn = finalValue - initial;

            document.getElementById('invest-total-return').textContent = formatCurrency(totalReturn);
            document.getElementById('invest-final-value').textContent = formatCurrency(finalValue);
            document.getElementById('investment-results').style.display = 'block';

            const tbody = document.getElementById('investment-growth-body');
            tbody.innerHTML = '';
            let value = initial;
            const row0 = document.createElement('tr');
            row0.innerHTML = `<td>Start</td><td>-</td><td>${formatCurrency(value)}</td>`;
            tbody.appendChild(row0);
            for (let i = 1; i <= years; i++) {
                const newValue = value * (1 + annualRateDecimal);
                const growth = newValue - value;
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>Year ${i}</td><td>${formatCurrency(growth)}</td><td>${formatCurrency(newValue)}</td>`;
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
        }

        return { init };
    })();

    const CAGRCalculator = (function() {
        function calculate() {
            const beginning = parseFloat(document.getElementById('cagr-beginning').value) || 0;
            const ending = parseFloat(document.getElementById('cagr-ending').value) || 0;
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
        }

        return { init };
    })();

    const FairValueCalculator = (function() {
        
        const DCFCalculator = (function() {
            function calculate() {
                const currentFCF = parseFloat(document.getElementById('dcf-current-fcf').value) || 0;
                const growthRate = parseFloat(document.getElementById('dcf-growth-rate').value) || 0;
                const terminalRate = parseFloat(document.getElementById('dcf-terminal-rate').value) || 0;
                const discountRate = parseFloat(document.getElementById('dcf-discount-rate').value) || 0;
                const projectionYears = parseInt(document.getElementById('dcf-years').value) || 0;
                const sharesOutstanding = parseFloat(document.getElementById('dcf-shares').value) || 0;

                if (currentFCF <= 0 || discountRate <= 0 || projectionYears <= 0 || sharesOutstanding <= 0) {
                    document.getElementById('dcf-results').style.display = 'none';
                    return;
                }

                const discountRateDecimal = discountRate / 100;
                const growthRateDecimal = growthRate / 100;
                const terminalRateDecimal = terminalRate / 100;

                let pvCashFlows = 0;
                for (let year = 1; year <= projectionYears; year++) {
                    const fcf = currentFCF * Math.pow(1 + growthRateDecimal, year);
                    const pv = fcf / Math.pow(1 + discountRateDecimal, year);
                    pvCashFlows += pv;
                }

                const terminalFCF = currentFCF * Math.pow(1 + growthRateDecimal, projectionYears) * (1 + terminalRateDecimal);
                const terminalValue = terminalFCF / (discountRateDecimal - terminalRateDecimal);
                const pvTerminalValue = terminalValue / Math.pow(1 + discountRateDecimal, projectionYears);

                const enterpriseValue = pvCashFlows + pvTerminalValue;
                const valuePerShare = enterpriseValue / sharesOutstanding;

                document.getElementById('dcf-enterprise-value').textContent = formatCurrency(enterpriseValue * 1000000);
                document.getElementById('dcf-pv-cashflows').textContent = formatCurrency(pvCashFlows * 1000000);
                document.getElementById('dcf-terminal-value').textContent = formatCurrency(pvTerminalValue * 1000000);
                document.getElementById('dcf-per-share').textContent = formatCurrency(valuePerShare * 1000000 / sharesOutstanding);
                document.getElementById('dcf-results').style.display = 'block';
            }

            function init() {
                const inputs = ['dcf-current-fcf', 'dcf-growth-rate', 'dcf-terminal-rate', 'dcf-discount-rate', 'dcf-years', 'dcf-shares'];
                inputs.forEach(id => {
                    document.getElementById(id).addEventListener('input', calculate);
                });
            }

            return { init };
        })();

        const PECalculator = (function() {
            function calculate() {
                const currentPrice = parseFloat(document.getElementById('pe-current-price').value) || 0;
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
                const inputs = ['pe-current-price', 'pe-eps', 'pe-industry-avg', 'pe-growth-rate'];
                inputs.forEach(id => {
                    document.getElementById(id).addEventListener('input', calculate);
                });
            }

            return { init };
        })();

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

                const grahamNumber = Math.sqrt(22.5 * eps * bookValue);

                const dividendPerShare = (eps * dividendYield) / 100;
                const ddmValue = requiredReturn > growthRate && requiredReturn > 0 && growthRate >= 0 ? 
                                dividendPerShare / ((requiredReturn / 100) - (growthRate / 100)) : 0;

                const bookMultiple = bookValue * (1 + (roe / 100));

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
        const subTabs = document.querySelectorAll('.sub-nav-tab');
        subTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchSubTab(tab.dataset.subtab);
            });
        });

        LoanCalculator.init();
        InvestmentCalculator.init();
        CAGRCalculator.init();
        FairValueCalculator.init();
    }

    return {
        init,
        formatCurrency,
        formatPercentage
    };
})();
