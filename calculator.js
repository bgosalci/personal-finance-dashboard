let activeCalculator = 'loan';

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

function setupListeners() {
    // Loan calculator listeners
    ['loan-amount', 'loan-rate', 'loan-term'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateLoan);
    });

    // Investment calculator listeners
    ['invest-amount', 'invest-rate', 'invest-years'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateInvestment);
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