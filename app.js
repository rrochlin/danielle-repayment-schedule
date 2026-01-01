// Loan constants
const ANNUAL_TUITION = 96000;
const QUARTERS_PER_YEAR = 3;
const SCHOOL_YEARS = 2;
const TOTAL_QUARTERS = SCHOOL_YEARS * QUARTERS_PER_YEAR;
const QUARTERLY_DISBURSEMENT = ANNUAL_TUITION / QUARTERS_PER_YEAR;
const ANNUAL_INTEREST_RATE = 0.08;
const QUARTERLY_INTEREST_RATE = ANNUAL_INTEREST_RATE / 4; // Quarterly compounding
const MONTHLY_INTEREST_RATE = ANNUAL_INTEREST_RATE / 12;

let chart = null;

/**
 * Calculate loan balance during school phase
 * Returns array of {month, balance} objects
 */
function calculateSchoolPhase() {
    const data = [];
    let balance = 0;

    // Month 0
    data.push({ month: 0, balance: 0 });

    // Iterate through each quarter
    for (let quarter = 0; quarter < TOTAL_QUARTERS; quarter++) {
        const quarterStartMonth = quarter * 3;

        // Add disbursement at start of quarter
        balance += QUARTERLY_DISBURSEMENT;

        // Apply interest for each month of the quarter
        for (let monthInQuarter = 0; monthInQuarter < 3; monthInQuarter++) {
            const month = quarterStartMonth + monthInQuarter + 1;

            // Apply monthly interest
            balance *= (1 + MONTHLY_INTEREST_RATE);

            data.push({ month, balance });
        }
    }

    return data;
}

/**
 * Calculate repayment phase
 * Returns array of {month, balance} objects
 */
function calculateRepaymentPhase(startingBalance, monthlyPayment) {
    const data = [];
    let balance = startingBalance;
    const schoolEndMonth = TOTAL_QUARTERS * 3;
    let month = schoolEndMonth;

    // Maximum 50 years to prevent infinite loops
    const MAX_MONTHS = 50 * 12 + schoolEndMonth;

    while (balance > 0 && month < MAX_MONTHS) {
        // Apply monthly interest
        balance *= (1 + MONTHLY_INTEREST_RATE);

        // Make payment
        balance -= monthlyPayment;

        // Don't go negative
        if (balance < 0) balance = 0;

        month++;
        data.push({ month, balance });
    }

    return data;
}

/**
 * Calculate complete loan timeline
 */
function calculateLoanTimeline(monthlyPayment) {
    const schoolPhase = calculateSchoolPhase();
    const graduationBalance = schoolPhase[schoolPhase.length - 1].balance;

    // Check if monthly payment is sufficient
    const minimumPayment = graduationBalance * MONTHLY_INTEREST_RATE;

    if (monthlyPayment <= minimumPayment) {
        // Payment not sufficient to cover interest
        return {
            timeline: schoolPhase,
            graduationBalance,
            payoffMonths: Infinity,
            insufficientPayment: true
        };
    }

    const repaymentPhase = calculateRepaymentPhase(graduationBalance, monthlyPayment);
    const timeline = [...schoolPhase, ...repaymentPhase];

    const payoffMonths = repaymentPhase.length;

    return {
        timeline,
        graduationBalance,
        payoffMonths,
        insufficientPayment: false
    };
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format time duration
 */
function formatDuration(months) {
    if (months === Infinity || isNaN(months)) {
        return 'Never (payment too low)';
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
        return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
        return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
}

/**
 * Update the chart
 */
function updateChart(timeline, graduationMonth) {
    const labels = timeline.map(d => d.month);
    const balances = timeline.map(d => d.balance);

    // Create background colors (different for school vs repayment)
    const backgroundColors = labels.map(month =>
        month <= graduationMonth ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)'
    );

    const borderColors = labels.map(month =>
        month <= graduationMonth ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)'
    );

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = balances;
        chart.data.datasets[0].segment = {
            borderColor: ctx => {
                const month = labels[ctx.p0DataIndex];
                return month <= graduationMonth ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)';
            },
            backgroundColor: ctx => {
                const month = labels[ctx.p0DataIndex];
                return month <= graduationMonth ? 'rgba(255, 99, 132, 0.1)' : 'rgba(75, 192, 192, 0.1)';
            }
        };
        chart.update();
    } else {
        const ctx = document.getElementById('loanChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Loan Balance',
                    data: balances,
                    borderWidth: 2,
                    fill: true,
                    segment: {
                        borderColor: ctx => {
                            const month = labels[ctx.p0DataIndex];
                            return month <= graduationMonth ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)';
                        },
                        backgroundColor: ctx => {
                            const month = labels[ctx.p0DataIndex];
                            return month <= graduationMonth ? 'rgba(255, 99, 132, 0.1)' : 'rgba(75, 192, 192, 0.1)';
                        }
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const month = context[0].label;
                                const years = Math.floor(month / 12);
                                const months = month % 12;
                                return `Month ${month} (Year ${years}, Month ${months})`;
                            },
                            label: function(context) {
                                return 'Balance: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Months'
                        },
                        ticks: {
                            callback: function(value, index) {
                                // Show every 12 months
                                if (value % 12 === 0) {
                                    return 'Year ' + (value / 12);
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Loan Balance ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * Update the UI
 */
function updateUI() {
    const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value);

    // Update payment amount display
    document.getElementById('paymentAmount').textContent = formatCurrency(monthlyPayment);

    // Calculate timeline
    const { timeline, graduationBalance, payoffMonths, insufficientPayment } = calculateLoanTimeline(monthlyPayment);

    // Update summary cards
    document.getElementById('totalAtGraduation').textContent = formatCurrency(graduationBalance);
    document.getElementById('payoffTime').textContent = formatDuration(payoffMonths);

    // Update chart
    const graduationMonth = TOTAL_QUARTERS * 3;
    updateChart(timeline, graduationMonth);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('monthlyPayment');

    slider.addEventListener('input', updateUI);

    // Initial render
    updateUI();
});
