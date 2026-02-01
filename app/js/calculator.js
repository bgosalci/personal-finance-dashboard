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
        const salaryTabs = document.getElementById('salary-tabs');
        const summaryPanel = document.getElementById('salary-summary-panel');
        const summaryList = document.getElementById('salary-summary-list');
        const formPanel = document.getElementById('salary-form-panel');
        const addSalaryBtn = document.getElementById('add-salary-btn');
        const removeSalaryBtn = document.getElementById('remove-salary-btn');
        const summaryToggle = document.getElementById('salary-summary-toggle');
        const formTitle = document.getElementById('salary-form-title');
        const nameInput = document.getElementById('salary-name');
        const annualInput = document.getElementById('salary-annual');
        const frequencySelect = document.getElementById('salary-frequency');
        const pensionInput = document.getElementById('salary-pension');
        const studentLoanSelect = document.getElementById('salary-student-loan');
        const ageInput = document.getElementById('salary-age');
        const taxCodeInput = document.getElementById('salary-tax-code');
        const otherDeductionsInput = document.getElementById('salary-other-deductions');
        const takeHomeEl = document.getElementById('salary-take-home');
        const taxEl = document.getElementById('salary-tax');
        const deductionsEl = document.getElementById('salary-deductions');
        const pensionEl = document.getElementById('salary-pension-value');
        const niEl = document.getElementById('salary-ni');
        const studentLoanEl = document.getElementById('salary-student-loan-value');
        const otherEl = document.getElementById('salary-other-value');
        const perPeriodEl = document.getElementById('salary-per-period');
        const frequencyLabelEl = document.getElementById('salary-frequency-label');
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
        let currentSalaryId = 'summary';

        function formatSalaryCurrency(amount) {
            return I18n.formatCurrency(amount, 'GBP');
        }

        function parseFormattedNumber(value) {
            return parseFloat(String(value || '').replace(/,/g, '')) || 0;
        }

        function setupFormattedInput(input) {
            if (!input) return;
            input.addEventListener('input', (e) => {
                e.target.value = formatInputValue(e.target.value);
            });
            input.addEventListener('blur', (e) => {
                e.target.value = formatInputValue(e.target.value, true);
            });
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
                showInSummary: true,
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
            entries.forEach(entry => {
                if (entry.showInSummary === undefined) {
                    entry.showInSummary = true;
                }
            });
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
            const included = entries.filter(entry => entry.showInSummary !== false);
            const totals = included.reduce((acc, entry) => {
                const calc = calculateEntry(entry);
                acc.takeHome += calc.takeHome;
                acc.tax += calc.tax;
                acc.other += calc.otherTotal;
                return acc;
            }, { takeHome: 0, tax: 0, other: 0 });
            if (totalTakeHomeEl) totalTakeHomeEl.textContent = formatSalaryCurrency(totals.takeHome);
            if (totalTaxEl) totalTaxEl.textContent = formatSalaryCurrency(totals.tax);
            if (totalDeductionsEl) totalDeductionsEl.textContent = formatSalaryCurrency(totals.other);
            renderSummaryList(included);
        }

        function renderSummaryList(included) {
            if (!summaryList) return;
            summaryList.innerHTML = '';
            if (included.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'form-hint';
                empty.textContent = I18n.t('calculators.salary.summary.noneSelected');
                summaryList.appendChild(empty);
                return;
            }
            included.forEach(entry => {
                const results = calculateEntry(entry);
                const item = document.createElement('div');
                item.className = 'salary-summary-item';
                const name = entry.name || I18n.t('calculators.salary.labels.salary');
                item.innerHTML = `<span>${name}</span><span>${formatSalaryCurrency(results.takeHome)}</span>`;
                summaryList.appendChild(item);
            });
        }

        function updateFormResults(entry) {
            const results = calculateEntry(entry);
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

        function renderTabs() {
            if (!salaryTabs) return;
            salaryTabs.innerHTML = '';
            const summaryBtn = document.createElement('button');
            summaryBtn.className = 'sub-nav-tab';
            summaryBtn.dataset.salaryId = 'summary';
            summaryBtn.textContent = I18n.t('common.summary');
            salaryTabs.appendChild(summaryBtn);
            entries.forEach((entry, index) => {
                const btn = document.createElement('button');
                btn.className = 'sub-nav-tab';
                btn.dataset.salaryId = entry.id;
                btn.textContent = entry.name || `${I18n.t('calculators.salary.labels.salary')} ${index + 1}`;
                salaryTabs.appendChild(btn);
            });
            salaryTabs.querySelectorAll('.sub-nav-tab').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.salaryId === currentSalaryId);
            });
        }

        function setActiveTab(id) {
            currentSalaryId = id;
            renderTabs();
            if (currentSalaryId === 'summary') {
                if (summaryPanel) summaryPanel.style.display = 'block';
                if (formPanel) formPanel.style.display = 'none';
            } else {
                if (summaryPanel) summaryPanel.style.display = 'none';
                if (formPanel) formPanel.style.display = 'block';
                const entry = getEntryById(currentSalaryId);
                if (entry) {
                    syncFormToEntry(entry);
                    updateFormResults(entry);
                }
            }
        }

        function syncFormToEntry(entry) {
            if (formTitle) {
                formTitle.textContent = entry.name || I18n.t('calculators.salary.labels.salary');
            }
            if (nameInput) nameInput.value = entry.name || '';
            if (annualInput) {
                annualInput.value = entry.annualSalary ? formatInputValue(entry.annualSalary.toFixed(2), true) : '';
            }
            if (frequencySelect) frequencySelect.value = entry.frequency || 'monthly';
            if (pensionInput) pensionInput.value = entry.pensionPercent || '';
            if (studentLoanSelect) studentLoanSelect.value = entry.studentLoanPlan || 'none';
            if (ageInput) ageInput.value = entry.age || '';
            if (taxCodeInput) taxCodeInput.value = entry.taxCode || '';
            if (otherDeductionsInput) otherDeductionsInput.value = entry.otherDeductions || '';
            if (summaryToggle) summaryToggle.checked = entry.showInSummary !== false;
            if (removeSalaryBtn) removeSalaryBtn.style.display = entries.length > 1 ? 'inline-flex' : 'none';
        }

        function addEntry() {
            const newEntry = createEntry();
            entries.push(newEntry);
            saveEntries();
            setActiveTab(newEntry.id);
            updateSummary();
        }

        function removeEntry(id) {
            entries = entries.filter(entry => entry.id !== id);
            if (entries.length === 0) {
                entries.push(createEntry());
            }
            saveEntries();
            if (!entries.find(entry => entry.id === currentSalaryId)) {
                currentSalaryId = entries[0].id;
            }
            setActiveTab(currentSalaryId);
            updateSummary();
        }

        function handleFieldUpdate() {
            const entry = getEntryById(currentSalaryId);
            if (!entry) return;
            entry.name = nameInput ? nameInput.value.trim() : entry.name;
            entry.annualSalary = annualInput && annualInput.value !== '' ? parseFormattedNumber(annualInput.value) : 0;
            entry.frequency = frequencySelect ? frequencySelect.value : entry.frequency;
            entry.pensionPercent = pensionInput && pensionInput.value !== '' ? parseFloat(pensionInput.value) || 0 : 0;
            entry.studentLoanPlan = studentLoanSelect ? studentLoanSelect.value : entry.studentLoanPlan;
            entry.age = ageInput && ageInput.value !== '' ? parseInt(ageInput.value, 10) || 0 : 0;
            entry.taxCode = taxCodeInput ? taxCodeInput.value.trim() : entry.taxCode;
            entry.otherDeductions = otherDeductionsInput && otherDeductionsInput.value !== ''
                ? parseFloat(otherDeductionsInput.value) || 0
                : 0;
            saveEntries();
            syncFormToEntry(entry);
            updateFormResults(entry);
            updateSummary();
            renderTabs();
        }

        function handleSummaryToggle() {
            const entry = getEntryById(currentSalaryId);
            if (!entry) return;
            entry.showInSummary = summaryToggle ? summaryToggle.checked : true;
            saveEntries();
            updateSummary();
        }

        function handleTabClick(e) {
            const btn = e.target.closest('.sub-nav-tab');
            if (!btn || !btn.dataset.salaryId) return;
            setActiveTab(btn.dataset.salaryId);
        }

        function init() {
            if (!salaryTabs) return;
            loadEntries();
            currentSalaryId = 'summary';
            renderTabs();
            updateSummary();
            setActiveTab(currentSalaryId);
            if (addSalaryBtn) {
                addSalaryBtn.addEventListener('click', addEntry);
            }
            if (removeSalaryBtn) {
                removeSalaryBtn.addEventListener('click', () => {
                    if (currentSalaryId !== 'summary') {
                        removeEntry(currentSalaryId);
                    }
                });
            }
            if (summaryToggle) summaryToggle.addEventListener('change', handleSummaryToggle);
            if (salaryTabs) salaryTabs.addEventListener('click', handleTabClick);
            setupFormattedInput(annualInput);
            [nameInput, annualInput, pensionInput, ageInput, taxCodeInput, otherDeductionsInput].forEach(input => {
                if (input) input.addEventListener('input', handleFieldUpdate);
            });
            [frequencySelect, studentLoanSelect].forEach(select => {
                if (select) select.addEventListener('change', handleFieldUpdate);
            });
        }

        function exportData(format) {
            if (format === 'csv') {
                const headers = ['id', 'name', 'annualSalary', 'pensionPercent', 'studentLoanPlan', 'age', 'taxCode', 'frequency', 'showInSummary', 'otherDeductions'];
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
                showInSummary: item.showInSummary === undefined ? true : String(item.showInSummary) !== 'false',
                otherDeductions: parseFloat(item.otherDeductions) || 0
            }));
            if (entries.length === 0) entries = [createEntry()];
            saveEntries();
            setActiveTab('summary');
            updateSummary();
        }

        function deleteAllData() {
            entries = [createEntry()];
            storage.removeItem(STORAGE_KEY);
            setActiveTab('summary');
            updateSummary();
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
