const { timelineData } = require("./data");

// Timeline visualization for issues status over time
export class TimelineVisualization {
    constructor() {
        this.timelineData = [];
        this.chart = null;
        this.aggregation = 'month';
        this.showTotalIssues = true;

        this.initializeEventListeners();
        this.loadData();
    }

    loadData() {
        this.timelineData = timelineData.visualizationTimeline;
        this.processTimelineData();
    }

    initializeEventListeners() {
        // Aggregation selector
        const aggregationSelect = document.getElementById('timelineAggregation');
        if (aggregationSelect) {
            aggregationSelect.addEventListener('change', (e) => {
                this.aggregation = e.target.value;
                this.processTimelineData();
            });
        }

        // Show total issues checkbox
        const showTotalCheckbox = document.getElementById('showTotalIssues');
        if (showTotalCheckbox) {
            showTotalCheckbox.addEventListener('change', (e) => {
                this.showTotalIssues = e.target.checked;
                this.updateChart();
            });
        }
    }

    processTimelineData() {
        if (!this.timelineData || this.timelineData.length === 0) {
            return;
        }

        // Sort data by date
        const sortedData = [...this.timelineData].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Track issue states over time
        const issueStates = new Map(); // issue number -> current state
        const timelineMap = new Map(); // date -> {open, closed, totalOpen, totalClosed}

        // Process each event
        sortedData.forEach(event => {
            const date = new Date(event.date);
            const periodKey = this.getPeriodKey(date);

            if (!timelineMap.has(periodKey)) {
                timelineMap.set(periodKey, {
                    date: periodKey,
                    created: 0,
                    closed: 0,
                    totalOpen: 0,
                    totalClosed: 0
                });
            }

            const periodData = timelineMap.get(periodKey);

            if (event.type === 'created') {
                issueStates.set(event.number, 'open');
                periodData.created++;
            } else if (event.type === 'closed') {
                issueStates.set(event.number, 'closed');
                periodData.closed++;
            }
        });

        // Calculate cumulative counts and percentages
        let cumulativeOpen = 0;
        let cumulativeClosed = 0;

        const processedData = Array.from(timelineMap.values())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(period => {
                cumulativeOpen += period.created - period.closed;
                cumulativeClosed += period.closed;

                // Ensure we don't have negative open issues
                if (cumulativeOpen < 0) cumulativeOpen = 0;

                const totalIssues = cumulativeOpen + cumulativeClosed;
                const openPercentage = totalIssues > 0 ? (cumulativeOpen / totalIssues) * 100 : 0;
                const closedPercentage = totalIssues > 0 ? (cumulativeClosed / totalIssues) * 100 : 0;

                return {
                    ...period,
                    cumulativeOpen,
                    cumulativeClosed,
                    totalIssues,
                    openPercentage,
                    closedPercentage
                };
            });

        this.aggregatedData = processedData;
        this.updateChart();
        this.updateStatistics();
    }

    getPeriodKey(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        switch (this.aggregation) {
            case 'month':
                return `${year}-${String(month + 1).padStart(2, '0')}`;
            case 'quarter':
                const quarter = Math.floor(month / 3) + 1;
                return `${year}-Q${quarter}`;
            case 'year':
                return `${year}`;
            default:
                return `${year}-${String(month + 1).padStart(2, '0')}`;
        }
    }

    updateChart() {
        if (!this.aggregatedData || this.aggregatedData.length === 0) {
            return;
        }

        const ctx = document.getElementById('timelineChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = this.aggregatedData.map(d => d.date);
        const datasets = [];

        // Always show percentage data
        datasets.push({
            label: 'Open Issues (%)',
            data: this.aggregatedData.map(d => d.openPercentage),
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: true,
            yAxisID: 'percentage',
            tension: 0.4
        });

        datasets.push({
            label: 'Closed Issues (%)',
            data: this.aggregatedData.map(d => d.closedPercentage),
            borderColor: '#51cf66',
            backgroundColor: 'rgba(81, 207, 102, 0.1)',
            fill: true,
            yAxisID: 'percentage',
            tension: 0.4
        });

        // Optionally show total issues count
        if (this.showTotalIssues) {
            datasets.push({
                label: 'Total Issues Count',
                data: this.aggregatedData.map(d => d.totalIssues),
                borderColor: '#339af0',
                backgroundColor: 'rgba(51, 154, 240, 0.1)',
                type: 'line',
                yAxisID: 'count',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 2
            });
        }

        const scales = {
            percentage: {
                type: 'linear',
                display: true,
                position: 'left',
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'Percentage (%)'
                },
                grid: {
                    drawOnChartArea: true
                }
            }
        };

        if (this.showTotalIssues) {
            scales.count = {
                type: 'linear',
                display: true,
                position: 'right',
                min: 0,
                title: {
                    display: true,
                    text: 'Total Issues Count'
                },
                grid: {
                    drawOnChartArea: false
                }
            };
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Issues Status Over Time (${this.aggregation}ly)`
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                if (label.includes('%')) {
                                    return `${label}: ${context.parsed.y.toFixed(1)}%`;
                                } else {
                                    return `${label}: ${context.parsed.y}`;
                                }
                            }
                        }
                    }
                },
                scales: scales
            }
        });
    }

    updateStatistics() {
        if (!this.aggregatedData || this.aggregatedData.length === 0) {
            return;
        }

        const latest = this.aggregatedData[this.aggregatedData.length - 1];
        const totalCreated = this.timelineData.filter(d => d.type === 'created').length;
        const totalClosed = this.timelineData.filter(d => d.type === 'closed').length;

        // Calculate peak open issues
        const peakOpen = Math.max(...this.aggregatedData.map(d => d.cumulativeOpen));

        // Calculate average open rate
        const avgOpenRate = this.aggregatedData.reduce((sum, d) => sum + d.openPercentage, 0) / this.aggregatedData.length;

        // Update DOM elements
        this.updateStatElement('currentOpenIssues', latest.cumulativeOpen);
        this.updateStatElement('currentClosedIssues', latest.cumulativeClosed);
        this.updateStatElement('currentOpenPercentage', `${latest.openPercentage.toFixed(1)}%`);
        this.updateStatElement('peakOpenIssues', peakOpen);
        this.updateStatElement('averageOpenRate', `${avgOpenRate.toFixed(1)}%`);
        this.updateStatElement('createdClosedRatio', `${(totalCreated / Math.max(totalClosed, 1)).toFixed(2)}:1`);
    }

    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}
