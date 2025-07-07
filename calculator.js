let activeCalculator = 'loan';
let activeFVTab = 'dcf';

function setupInvestmentYears() {
    const select = document.getElementById('invest-years');
    for (let i = 1; i <= 50; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} year${i === 1 ? '' : 's'}`;
        if (i === 25) option.selected = true;
        select.appendChild(option);
    }
}

function calculateLoan() {
    const amount = parseFloat(document.getElementById('loan-amount').value) || 0;
    const rate = parseFloat(document.getElementById('loan-rate').value) || 0;
    const term = parseFloat(document.getElementById('loan-term').value) || 0;

    if (amount > 0 && rate > 0 && term > 0) {
        const monthlyRate = rate / 100 / 12;
        const numPayments = term * 12;
        const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                       (Math.pow(1 + monthlyRate, numPayments) - 1);
        const totalInterest = (payment * numPayments) - amount;

        document.getElementById('loan-payment').textContent = 
            `£${payment.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('loan-interest').textContent = 
            `Total Interest: £${totalInterest.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
    } else {
        document.getElementById('loan-payment').textContent = '£0.00';
        document.getElementById('loan-interest').textContent = 'Enter loan details to calculate';
    }
}

function calculateInvestment() {
    const amount = parseFloat(document.getElementById('invest-amount').value) || 0;
    const rate = parseFloat(document.getElementById('invest-rate').value) || 0;
    const years = parseInt(document.getElementById('invest-years').value) || 25;

    document.getElementById('invest-period').textContent = 
        `Value After ${years} Year${years === 1 ? '' : 's'}`;

    if (amount > 0 && rate > 0) {
        const futureValue = amount * Math.pow(1 + rate / 100, years);
        const totalGain = futureValue - amount;

        document.getElementById('invest-value').textContent = 
            `£${futureValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('invest-gain').textContent = 
            `Total Gain: £${totalGain.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;

        renderGrowthTable(amount, rate, years);
    } else {
        document.getElementById('invest-value').textContent = '£0.00';
        document.getElementById('invest-gain').textContent = 'Enter investment details to calculate';
        document.getElementById('growth-table-content').innerHTML = 
            '<div class="empty-state">Enter investment amount and return rate to see projections</div>';
    }
}

function renderGrowthTable(amount, rate, years) {
    const html = `
        <table class="sticky-table">
            <thead>
                <tr>
                    <th>Year</th>
                    <th class="text-right">Value</th>
                    <th class="text-right">Annual Gain</th>
                    <th class="text-right">Total Gain</th>
                </tr>
            </thead>
            <tbody>
                ${Array.from({length: years}, (_, i) => {
                    const year = i + 1;
                    const currentValue = amount * Math.pow(1 + rate / 100, year);
                    const previousValue = amount * Math.pow(1 + rate / 100, year - 1);
                    const annualGain = currentValue - previousValue;
                    const totalGain = currentValue - amount;

                    return `
                        <tr>
                            <td><strong>${year}</strong></td>
                            <td class="text-right">£${currentValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</td>
                            <td class="text-right positive">£${annualGain.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</td>
                            <td class="text-right" style="color: #3498db; font-weight: 600;">£${totalGain.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('growth-table-content').innerHTML = html;
}

function calculateCAGR() {
    const start = parseFloat(document.getElementById('cagr-start').value) || 0;
    const end = parseFloat(document.getElementById('cagr-end').value) || 0;
    const years = parseFloat(document.getElementById('cagr-years').value) || 0;

    if (start > 0 && end > 0 && years > 0) {
        const cagr = Math.pow(end / start, 1 / years) - 1;
        document.getElementById('cagr-result').textContent = `${(cagr * 100).toFixed(2)}%`;
    } else {
        document.getElementById('cagr-result').textContent = '0%';
    }
}

function calculateDCF() {
    const cashFlow = parseFloat(document.getElementById('dcf-cashflow').value) || 0;
    const growth = parseFloat(document.getElementById('dcf-growth').value) || 0;
    const discount = parseFloat(document.getElementById('dcf-discount').value) || 0;
    const years = parseInt(document.getElementById('dcf-years').value) || 0;

    if (cashFlow > 0 && discount > 0 && years > 0) {
        let value = 0;
        for (let i = 1; i <= years; i++) {
            const cf = cashFlow * Math.pow(1 + growth / 100, i);
            value += cf / Math.pow(1 + discount / 100, i);
        }
        document.getElementById('dcf-result').textContent =
            `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        document.getElementById('dcf-result').textContent = '£0.00';
    }
}

function calculatePE() {
    const eps = parseFloat(document.getElementById('pe-eps').value) || 0;
    const growth = parseFloat(document.getElementById('pe-growth').value) || 0;
    const years = parseInt(document.getElementById('pe-years').value) || 0;
    const pe = parseFloat(document.getElementById('pe-ratio').value) || 0;

    if (eps > 0 && pe > 0) {
        const futureEPS = eps * Math.pow(1 + growth / 100, years);
        const value = futureEPS * pe;
        document.getElementById('pe-result').textContent =
            `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        document.getElementById('pe-result').textContent = '£0.00';
    }
}

function calculateIntrinsic() {
    const book = parseFloat(document.getElementById('intrinsic-book').value) || 0;
    const growth = parseFloat(document.getElementById('intrinsic-growth').value) || 0;
    const years = parseInt(document.getElementById('intrinsic-years').value) || 0;

    if (book > 0) {
        const value = book * Math.pow(1 + growth / 100, years);
        document.getElementById('intrinsic-result').textContent =
            `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        document.getElementById('intrinsic-result').textContent = '£0.00';
    }
}

function switchFVTab(tab) {
    activeFVTab = tab;
    document.querySelectorAll('.fv-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-fv="${tab}"]`).classList.add('active');
    document.querySelectorAll('.fv-calculator').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tab}-calc`).classList.add('active');
}

function setupListeners() {
    // Loan calculator listeners
    ['loan-amount', 'loan-rate', 'loan-term'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateLoan);
    });

    // Investment calculator listeners
    ['invest-amount', 'invest-rate', 'invest-years'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateInvestment);
    });

    // CAGR calculator listeners
    ['cagr-start', 'cagr-end', 'cagr-years'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateCAGR);
    });

    // DCF calculator listeners
    ['dcf-cashflow', 'dcf-growth', 'dcf-discount', 'dcf-years'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateDCF);
    });

    // PE calculator listeners
    ['pe-eps', 'pe-growth', 'pe-years', 'pe-ratio'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculatePE);
    });

    // Intrinsic value calculator listeners
    ['intrinsic-book', 'intrinsic-growth', 'intrinsic-years'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateIntrinsic);
    });

    // Fair value tab navigation
    document.querySelectorAll('.fv-tab').forEach(btn => {
        btn.addEventListener('click', () => switchFVTab(btn.dataset.fv));
    });
}

export function initCalculator() {
    setupInvestmentYears();
    setupListeners();
}

export function switchCalculator(calc) {
    activeCalculator = calc;
    document.querySelectorAll('.calc-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-calc="${calc}"]`).classList.add('active');
    document.querySelectorAll('.calculator').forEach(calculator => calculator.classList.remove('active'));
    document.getElementById(calc + '-calc').classList.add('active');
}