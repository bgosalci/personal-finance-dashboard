import { saveToStorage, loadFromStorage } from './storage.js';

let pensions = loadFromStorage('pensions') || [
    {
        id: 1,
        name: "Company Pension",
        currentValue: 85000,
        monthlyContribution: 500,
        employerMatch: 250,
        expectedReturn: 7,
        targetRetirement: new Date('2055-01-01')
    }
];

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function calculatePensionProjection(pension) {
    const yearsToRetirement = (pension.targetRetirement - new Date()) / (1000 * 60 * 60 * 24 * 365);
    const monthlyReturn = pension.expectedReturn / 100 / 12;
    const monthsToRetirement = yearsToRetirement * 12;
    const futureValueCurrent = pension.currentValue * Math.pow(1 + pension.expectedReturn / 100, yearsToRetirement);
    const monthlyTotal = pension.monthlyContribution + pension.employerMatch;
    const futureValueContributions = monthlyTotal * 
        ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);
    return futureValueCurrent + futureValueContributions;
}

export function renderPensions() {
    const container = document.getElementById('pensions-container');
    if (pensions.length === 0) {
        container.innerHTML = '<div class="empty-state">No pensions tracked yet. Add your first pension to get started!</div>';
        return;
    }
    container.innerHTML = pensions.map(pension => {
        const yearsToRetirement = Math.max(0, (pension.targetRetirement - new Date()) / (1000 * 60 * 60 * 24 * 365));
        const monthlyTotal = pension.monthlyContribution + pension.employerMatch;
        const projectedValue = calculatePensionProjection(pension);
        return `
            <div class="card">
                <h3 style="margin-bottom: 25px; color: #2c3e50; font-size: 1.5rem;">${pension.name}</h3>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-label">Current Value</div>
                        <div class="metric-value">£${pension.currentValue.toLocaleString()}</div>
                    </div>
                    <div class="metric-card green">
                        <div class="metric-label">Monthly Contribution</div>
                        <div class="metric-value">£${monthlyTotal.toLocaleString()}</div>
                        <div class="metric-sub">You: £${pension.monthlyContribution} + Employer: £${pension.employerMatch}</div>
                    </div>
                    <div class="metric-card purple">
                        <div class="metric-label">Expected Return</div>
                        <div class="metric-value">${pension.expectedReturn}%</div>
                    </div>
                    <div class="metric-card orange">
                        <div class="metric-label">Years to Retirement</div>
                        <div class="metric-value">${yearsToRetirement.toFixed(1)}</div>
                    </div>
                </div>
                <div class="projection-card">
                    <div class="projection-label">Projected Retirement Value</div>
                    <div class="projection-value">£${projectedValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
                    <div class="projection-sub">Growth of £${(projectedValue - pension.currentValue).toLocaleString('en-GB', { maximumFractionDigits: 0 })} from current value</div>
                </div>
            </div>
        `;
    }).join('');
}

export function addPension(pensionData) {
    const newPension = {
        id: generateId(),
        ...pensionData,
        expectedReturn: pensionData.expectedReturn || 7,
        targetRetirement: pensionData.targetRetirement || new Date('2055-01-01')
    };
    pensions.push(newPension);
    saveToStorage('pensions', pensions);
    renderPensions();
}