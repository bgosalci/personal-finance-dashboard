// Calculator Module
const Calculator = (function() {
    let currentSubTab = 'loan';
    
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

        const investMonthlyLabel = document.getElementById('invest-monthly-currency-label');
        if (loanLabel) loanLabel.textContent = currency;
        if (investLabel) investLabel.textContent = currency;
        if (investMonthlyLabel) investMonthlyLabel.textContent = currency;

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
        ['invest-invested-value', 'invest-growth-value', 'invest-final-value'].forEach(id => {
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
            const monthlyContribution = getNumberValue('invest-monthly');
            const annualRate = parseFloat(document.getElementById('invest-rate').value) || 0;
            const years = parseFloat(document.getElementById('invest-years').value) || 0;

            if ((initial <= 0 && monthlyContribution <= 0) || annualRate < 0 || years <= 0) {
                document.getElementById('investment-results').style.display = 'none';
                document.getElementById('investment-growth-container').style.display = 'none';
                return;
            }

            const annualRateDecimal = annualRate / 100;
            const totalMonths = Math.max(1, Math.round(years * 12));
            const monthlyRate = Math.pow(1 + annualRateDecimal, 1 / 12) - 1;
            const effectiveMonthlyRate = Math.abs(monthlyRate) < 1e-10 ? 0 : monthlyRate;

            const futureValueForMonths = (months) => {
                if (months <= 0) {
                    return initial;
                }

                if (effectiveMonthlyRate === 0) {
                    return initial + (monthlyContribution * months);
                }

                const growthFactor = Math.pow(1 + effectiveMonthlyRate, months);
                const initialFutureValue = initial * growthFactor;
                const contributionsFutureValue = monthlyContribution > 0
                    ? monthlyContribution * ((growthFactor - 1) / effectiveMonthlyRate)
                    : 0;

                return initialFutureValue + contributionsFutureValue;
            };

            const finalValue = futureValueForMonths(totalMonths);
            const investedValue = initial + (monthlyContribution * totalMonths);
            const growthValue = finalValue - investedValue;
            const normalizedGrowthValue = Math.abs(growthValue) < 1e-8 ? 0 : growthValue;

            const tbody = document.getElementById('investment-growth-body');
            tbody.innerHTML = '';
            const startRow = document.createElement('tr');
            startRow.innerHTML = `<td>${I18n.t('calculators.investment.table.start')}</td><td>-</td><td>${formatCurrency(initial)}</td>`;
            tbody.appendChild(startRow);

            const totalYears = Math.ceil(totalMonths / 12);
            let previousMonths = 0;
            let previousValue = futureValueForMonths(previousMonths);

            for (let year = 1; year <= totalYears; year++) {
                const monthsElapsed = Math.min(year * 12, totalMonths);
                const currentValue = futureValueForMonths(monthsElapsed);
                const monthsInPeriod = monthsElapsed - previousMonths;
                const contributionsThisPeriod = monthlyContribution * monthsInPeriod;
                const growthThisPeriod = currentValue - previousValue - contributionsThisPeriod;
                const normalizedGrowthThisPeriod = Math.abs(growthThisPeriod) < 1e-8 ? 0 : growthThisPeriod;

                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${I18n.t('calculators.investment.table.year')} ${year}</td><td>${formatCurrency(normalizedGrowthThisPeriod)}</td><td>${formatCurrency(currentValue)}</td>`;
                tbody.appendChild(tr);

                previousMonths = monthsElapsed;
                previousValue = currentValue;
            }

            document.getElementById('invest-invested-value').textContent = formatCurrency(investedValue);
            document.getElementById('invest-growth-value').textContent = formatCurrency(normalizedGrowthValue);
            document.getElementById('invest-final-value').textContent = formatCurrency(finalValue);
            document.getElementById('investment-results').style.display = 'block';
            document.getElementById('investment-growth-container').style.display = 'block';
        }

        function init() {
            const inputs = ['invest-initial', 'invest-monthly', 'invest-rate', 'invest-years'];
            inputs.forEach(id => {
                document.getElementById(id).addEventListener('input', calculate);
            });
            setupAmountInput('invest-initial');
            setupAmountInput('invest-monthly');
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

    // Salary Calculator
    const SalaryCalculator = (function() {
        const STORAGE_KEY = 'pf_salary_entries';
        const entriesContainer = document.getElementById('salary-entries');
        const addSalaryBtn = document.getElementById('add-salary-btn');
        const totalTakeHomeEl = document.getElementById('salary-total-take-home');
        const totalTaxEl = document.getElementById('salary-total-tax');
        const totalDeductionsEl = document.getElementById('salary-total-deductions');
        const storage = typeof StorageUtils !== 'undefined' ? StorageUtils.getStorage() : window.localStorage;
        const frequencies = {
            annual: 1,
            monthly: 12,
            fortnightly: 26,
            weekly: 52
        };
        let entries = [];

        function formatSalaryCurrency(amount) {
            return I18n.formatCurrency(amount, 'GBP');
        }

        function createEntry() {
            const id = `salary-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            return {
                id,
                name: '',
                annualSalary: 0,
                pensionPercent: 0,
                studentLoanPlan: 'none',
                age: 30,
                taxCode: '1257L',
                frequency: 'monthly',
                otherDeductions: 0
            };
        }

        function loadEntries() {
            const stored = storage.getItem(STORAGE_KEY);
            if (!stored) {
                entries = [createEntry()];
                return;
            }
            try {
                const parsed = JSON.parse(stored);
                entries = Array.isArray(parsed) ? parsed : [createEntry()];
            } catch (e) {
                entries = [createEntry()];
            }
        }

        function saveEntries() {
            storage.setItem(STORAGE_KEY, JSON.stringify(entries));
        }

        function getEntryById(id) {
            return entries.find(entry => entry.id === id);
        }

        function getPersonalAllowance(taxCode, grossAnnual) {
            const code = (taxCode || '').trim().toUpperCase();
            const match = code.match(/\d+/);
            let allowance = match ? parseInt(match[0], 10) * 10 : 12570;
            if (code.startsWith('K')) {
                allowance = -Math.abs(allowance);
            }
            if (allowance > 0 && grossAnnual > 100000) {
                const reduction = (grossAnnual - 100000) / 2;
                allowance = Math.max(0, allowance - reduction);
            }
            return allowance;
        }

        function calculateIncomeTax(taxableIncome) {
            const basicLimit = 37700;
            const higherLimit = 112570;
            let remaining = Math.max(0, taxableIncome);
            let tax = 0;
            const basicIncome = Math.min(remaining, basicLimit);
            tax += basicIncome * 0.2;
            remaining -= basicIncome;
            if (remaining > 0) {
                const higherIncome = Math.min(remaining, higherLimit - basicLimit);
                tax += higherIncome * 0.4;
                remaining -= higherIncome;
            }
            if (remaining > 0) {
                tax += remaining * 0.45;
            }
            return tax;
        }

        function calculateNationalInsurance(grossAnnual, age) {
            if (age >= 66) return 0;
            const primaryThreshold = 12570;
            const upperLimit = 50270;
            let ni = 0;
            if (grossAnnual > primaryThreshold) {
                const mainBand = Math.min(grossAnnual, upperLimit) - primaryThreshold;
                if (mainBand > 0) ni += mainBand * 0.08;
                const upperBand = grossAnnual - upperLimit;
                if (upperBand > 0) ni += upperBand * 0.02;
            }
            return ni;
        }

        function calculateStudentLoan(income, plan) {
            const plans = {
                plan1: { threshold: 22015, rate: 0.09 },
                plan2: { threshold: 27295, rate: 0.09 },
                plan4: { threshold: 27660, rate: 0.09 },
                plan5: { threshold: 25000, rate: 0.09 },
                postgraduate: { threshold: 21000, rate: 0.06 }
            };
            const info = plans[plan];
            if (!info) return 0;
            const excess = income - info.threshold;
            return excess > 0 ? excess * info.rate : 0;
        }

        function calculateEntry(entry) {
            const grossAnnual = Math.max(0, parseFloat(entry.annualSalary) || 0);
            const pensionPercent = Math.max(0, parseFloat(entry.pensionPercent) || 0);
            const pensionContribution = grossAnnual * (pensionPercent / 100);
            const otherDeductions = Math.max(0, parseFloat(entry.otherDeductions) || 0);
            const adjustedIncome = Math.max(0, grossAnnual - pensionContribution);
            const allowance = getPersonalAllowance(entry.taxCode, grossAnnual);
            const taxableIncome = Math.max(0, adjustedIncome - allowance);
            const tax = calculateIncomeTax(taxableIncome);
            const nationalInsurance = calculateNationalInsurance(grossAnnual, parseInt(entry.age, 10) || 0);
            const studentLoan = calculateStudentLoan(adjustedIncome, entry.studentLoanPlan);
            const otherTotal = pensionContribution + nationalInsurance + studentLoan + otherDeductions;
            const takeHome = Math.max(0, grossAnnual - tax - otherTotal);
            return {
                grossAnnual,
                pensionContribution,
                otherDeductions,
                tax,
                nationalInsurance,
                studentLoan,
                otherTotal,
                takeHome
            };
        }

        function updateSummary() {
            const totals = entries.reduce((acc, entry) => {
                const calc = calculateEntry(entry);
                acc.takeHome += calc.takeHome;
                acc.tax += calc.tax;
                acc.other += calc.otherTotal;
                return acc;
            }, { takeHome: 0, tax: 0, other: 0 });
            if (totalTakeHomeEl) totalTakeHomeEl.textContent = formatSalaryCurrency(totals.takeHome);
            if (totalTaxEl) totalTaxEl.textContent = formatSalaryCurrency(totals.tax);
            if (totalDeductionsEl) totalDeductionsEl.textContent = formatSalaryCurrency(totals.other);
        }

        function updateCardResults(card, entry, index) {
            const results = calculateEntry(entry);
            const titleEl = card.querySelector('.salary-card-title');
            if (titleEl) {
                titleEl.textContent = entry.name || `${I18n.t('calculators.salary.labels.salary')} ${index + 1}`;
            }
            const takeHomeEl = card.querySelector('.salary-take-home');
            const taxEl = card.querySelector('.salary-tax');
            const deductionsEl = card.querySelector('.salary-deductions');
            const pensionEl = card.querySelector('.salary-pension');
            const niEl = card.querySelector('.salary-ni');
            const studentLoanEl = card.querySelector('.salary-student-loan');
            const otherEl = card.querySelector('.salary-other');
            const perPeriodEl = card.querySelector('.salary-per-period');
            const frequencyLabelEl = card.querySelector('.salary-frequency-label');
            const frequencyValue = entry.frequency || 'monthly';
            const divisor = frequencies[frequencyValue] || 12;
            if (takeHomeEl) takeHomeEl.textContent = formatSalaryCurrency(results.takeHome);
            if (taxEl) taxEl.textContent = formatSalaryCurrency(results.tax);
            if (deductionsEl) deductionsEl.textContent = formatSalaryCurrency(results.otherTotal);
            if (pensionEl) pensionEl.textContent = formatSalaryCurrency(results.pensionContribution);
            if (niEl) niEl.textContent = formatSalaryCurrency(results.nationalInsurance);
            if (studentLoanEl) studentLoanEl.textContent = formatSalaryCurrency(results.studentLoan);
            if (otherEl) otherEl.textContent = formatSalaryCurrency(results.otherDeductions);
            if (perPeriodEl) perPeriodEl.textContent = formatSalaryCurrency(results.takeHome / divisor);
            if (frequencyLabelEl) frequencyLabelEl.textContent = I18n.t(`calculators.salary.frequency.${frequencyValue}`);
        }

        function renderEntries() {
            if (!entriesContainer) return;
            entriesContainer.innerHTML = '';
            entries.forEach((entry, index) => {
                const safeName = String(entry.name || '').replace(/"/g, '&quot;');
                const safeTaxCode = String(entry.taxCode || '').replace(/"/g, '&quot;');
                const card = document.createElement('div');
                card.className = 'salary-card';
                card.dataset.id = entry.id;
                card.innerHTML = `
                    <div class="salary-card-header">
                        <h4 class="section-subtitle salary-card-title">${I18n.t('calculators.salary.labels.salary')} ${index + 1}</h4>
                        <button type="button" class="btn btn-link salary-remove-btn" data-i18n="calculators.salary.actions.removeSalary">Remove</button>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label data-i18n="calculators.salary.labels.name">Salary name</label>
                            <input type="text" data-field="name" value="${safeName}">
                        </div>
                        <div class="form-group">
                            <label data-i18n="calculators.salary.labels.annualSalary">Annual gross salary (£)</label>
                            <input type="number" min="0" step="0.01" data-field="annualSalary" value="${entry.annualSalary || ''}">
                        </div>
                        <div class="form-group">
                            <label data-i18n="calculators.salary.labels.frequency">Payment frequency</label>
                            <select data-field="frequency">
                                <option value="annual" ${entry.frequency === 'annual' ? 'selected' : ''} data-i18n="calculators.salary.frequency.annual">Annual</option>
                                <option value="monthly" ${entry.frequency === 'monthly' ? 'selected' : ''} data-i18n="calculators.salary.frequency.monthly">Monthly</option>
                                <option value="fortnightly" ${entry.frequency === 'fortnightly' ? 'selected' : ''} data-i18n="calculators.salary.frequency.fortnightly">Fortnightly</option>
                                <option value="weekly" ${entry.frequency === 'weekly' ? 'selected' : ''} data-i18n="calculators.salary.frequency.weekly">Weekly</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label data-i18n="calculators.salary.labels.pension">Pension contribution (%)</label>
                            <input type="number" min="0" max="100" step="0.1" data-field="pensionPercent" value="${entry.pensionPercent || ''}">
                        </div>
                        <div class="form-group">
                            <label data-i18n="calculators.salary.labels.studentLoan">Student loan plan</label>
                            <select data-field="studentLoanPlan">
                                <option value="none" ${entry.studentLoanPlan === 'none' ? 'selected' : ''} data-i18n="calculators.salary.studentLoan.none">None</option>
                                <option value="plan1" ${entry.studentLoanPlan === 'plan1' ? 'selected' : ''} data-i18n="calculators.salary.studentLoan.plan1">Plan 1</option>
                                <option value="plan2" ${entry.studentLoanPlan === 'plan2' ? 'selected' : ''} data-i18n="calculators.salary.studentLoan.plan2">Plan 2</option>
                                <option value="plan4" ${entry.studentLoanPlan === 'plan4' ? 'selected' : ''} data-i18n="calculators.salary.studentLoan.plan4">Plan 4</option>
                                <option value="plan5" ${entry.studentLoanPlan === 'plan5' ? 'selected' : ''} data-i18n="calculators.salary.studentLoan.plan5">Plan 5</option>
                                <option value="postgraduate" ${entry.studentLoanPlan === 'postgraduate' ? 'selected' : ''} data-i18n="calculators.salary.studentLoan.postgraduate">Postgraduate</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label data-i18n="calculators.salary.labels.age">Age</label>
                            <input type="number" min="16" max="100" step="1" data-field="age" value="${entry.age || ''}">
                        </div>
                        <div class="form-group">
                            <label data-i18n="calculators.salary.labels.taxCode">Tax code</label>
                            <input type="text" data-field="taxCode" value="${safeTaxCode}">
                        </div>
                        <div class="form-group">
                            <label data-i18n="calculators.salary.labels.otherDeductions">Other deductions (annual £)</label>
                            <input type="number" min="0" step="0.01" data-field="otherDeductions" value="${entry.otherDeductions || ''}">
                        </div>
                    </div>
                    <div class="result-display salary-results">
                        <div class="result-item">
                            <span data-i18n="calculators.salary.results.takeHome">Take-home:</span>
                            <span class="salary-take-home">£0.00</span>
                        </div>
                        <div class="result-item">
                            <span data-i18n="calculators.salary.results.tax">Tax to pay:</span>
                            <span class="salary-tax">£0.00</span>
                        </div>
                        <div class="result-item">
                            <span data-i18n="calculators.salary.results.otherDeductions">Other deductions:</span>
                            <span class="salary-deductions">£0.00</span>
                        </div>
                        <div class="salary-breakdown">
                            <div class="result-item">
                                <span data-i18n="calculators.salary.results.pension">Pension:</span>
                                <span class="salary-pension">£0.00</span>
                            </div>
                            <div class="result-item">
                                <span data-i18n="calculators.salary.results.nationalInsurance">National Insurance:</span>
                                <span class="salary-ni">£0.00</span>
                            </div>
                            <div class="result-item">
                                <span data-i18n="calculators.salary.results.studentLoan">Student loan:</span>
                                <span class="salary-student-loan">£0.00</span>
                            </div>
                            <div class="result-item">
                                <span data-i18n="calculators.salary.results.other">Other:</span>
                                <span class="salary-other">£0.00</span>
                            </div>
                        </div>
                        <div class="result-item salary-per-period-row">
                            <span data-i18n="calculators.salary.results.perPeriod">Take-home per</span>
                            <span class="salary-frequency-label">Monthly</span>
                            <span class="salary-per-period">£0.00</span>
                        </div>
                    </div>
                `;
                entriesContainer.appendChild(card);
                updateCardResults(card, entry, index);
            });
            const removeBtns = entriesContainer.querySelectorAll('.salary-remove-btn');
            removeBtns.forEach(btn => {
                btn.style.display = entries.length > 1 ? 'inline-flex' : 'none';
            });
            I18n.apply();
            updateSummary();
        }

        function addEntry() {
            entries.push(createEntry());
            saveEntries();
            renderEntries();
        }

        function removeEntry(id) {
            entries = entries.filter(entry => entry.id !== id);
            if (entries.length === 0) {
                entries.push(createEntry());
            }
            saveEntries();
            renderEntries();
        }

        function handleFieldUpdate(target) {
            const card = target.closest('.salary-card');
            if (!card) return;
            const entry = getEntryById(card.dataset.id);
            if (!entry) return;
            const field = target.dataset.field;
            if (!field) return;
            let value = target.value;
            if (['annualSalary', 'pensionPercent', 'age', 'otherDeductions'].includes(field)) {
                value = value === '' ? '' : parseFloat(value) || 0;
            }
            entry[field] = value;
            saveEntries();
            const index = entries.findIndex(item => item.id === entry.id);
            updateCardResults(card, entry, index);
            updateSummary();
        }

        function handleClick(e) {
            const removeBtn = e.target.closest('.salary-remove-btn');
            if (removeBtn) {
                const card = removeBtn.closest('.salary-card');
                if (card) {
                    removeEntry(card.dataset.id);
                }
            }
        }

        function init() {
            if (!entriesContainer) return;
            loadEntries();
            renderEntries();
            if (addSalaryBtn) {
                addSalaryBtn.addEventListener('click', addEntry);
            }
            entriesContainer.addEventListener('input', e => handleFieldUpdate(e.target));
            entriesContainer.addEventListener('change', e => handleFieldUpdate(e.target));
            entriesContainer.addEventListener('click', handleClick);
        }

        function exportData(format) {
            if (format === 'csv') {
                const headers = ['id', 'name', 'annualSalary', 'pensionPercent', 'studentLoanPlan', 'age', 'taxCode', 'frequency', 'otherDeductions'];
                const rows = entries.map(entry => headers.map(key => `"${String(entry[key] ?? '').replace(/"/g, '""')}"`).join(','));
                return `${headers.join(',')}\n${rows.join('\n')}`;
            }
            return JSON.stringify(entries, null, 2);
        }

        function importData(raw, format) {
            let imported = [];
            if (format === 'csv') {
                const lines = raw.split(/\r?\n/).filter(Boolean);
                const headers = lines.shift()?.split(',') || [];
                imported = lines.map(line => {
                    const values = line.match(/("([^"]|"")*"|[^,]+)/g) || [];
                    const entry = {};
                    headers.forEach((header, idx) => {
                        const clean = (values[idx] || '').replace(/^"|"$/g, '').replace(/""/g, '"');
                        entry[header] = clean;
                    });
                    return entry;
                });
            } else {
                imported = JSON.parse(raw);
            }
            if (!Array.isArray(imported)) {
                imported = [];
            }
            entries = imported.map(item => ({
                id: item.id || createEntry().id,
                name: item.name || '',
                annualSalary: parseFloat(item.annualSalary) || 0,
                pensionPercent: parseFloat(item.pensionPercent) || 0,
                studentLoanPlan: item.studentLoanPlan || 'none',
                age: parseInt(item.age, 10) || 30,
                taxCode: item.taxCode || '1257L',
                frequency: item.frequency || 'monthly',
                otherDeductions: parseFloat(item.otherDeductions) || 0
            }));
            if (entries.length === 0) entries = [createEntry()];
            saveEntries();
            renderEntries();
        }

        function deleteAllData() {
            entries = [createEntry()];
            storage.removeItem(STORAGE_KEY);
            renderEntries();
        }

        return { init, exportData, importData, deleteAllData };
    })();

    if (typeof window !== 'undefined') {
        window.SalaryCalculator = SalaryCalculator;
    }

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
        SalaryCalculator.init();
    }

    return {
        init,
        formatCurrency,
        formatPercentage
    };
})();
