import { timelineData } from "./data";

/**
 * Load real GitHub Issues data from timeline visualization data
 * Processes timeline events to reconstruct issue lifecycles
 * @returns {Promise<Array>} Real issues data with creation, closure times, and metadata
 */
function loadRealIssuesData() {
  const timeline = timelineData.visualizationTimeline;

  // Group timeline events by issue number
  const issueMap = new Map();

  timeline.forEach(event => {
    const number = event.number;
    if (!issueMap.has(number)) {
      issueMap.set(number, {
        number: number,
        events: [],
        labels: new Set()
      });
    }

    const issue = issueMap.get(number);
    issue.events.push(event);

    // Collect all labels that were ever associated with this issue
    if (event.labels) {
      event.labels.forEach(label => issue.labels.add(label));
    }
  });

  // Convert to issue objects
  const allIssues = [];
  issueMap.forEach((issueData, number) => {
    const processedIssue = processTimelineIssue(issueData);
    if (processedIssue) {
      allIssues.push(processedIssue);
    }
  });

  return allIssues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * Process timeline data for a single issue
 * Reconstructs issue lifecycle from timeline events
 * @param {Object} issueData - Issue data with events and labels
 * @returns {Object} Processed issue data for visualization
 */
function processTimelineIssue(issueData) {
  const { number, events, labels } = issueData;

  // Find creation and closure events
  const createdEvent = events.find(e => e.type === 'created');
  const closedEvent = events.find(e => e.type === 'closed');

  if (!createdEvent) {
    // Skip issues without creation event
    return null;
  }

  const createdAt = new Date(createdEvent.date);
  const closedAt = closedEvent ? new Date(closedEvent.date) : null;
  const isOpen = !closedAt;

  // Calculate duration for closed issues
  let durationHours = null;
  let durationDays = null;

  if (closedAt && createdAt) {
    durationHours = (closedAt - createdAt) / (1000 * 60 * 60);
    durationDays = durationHours / 24;
  }

  // Determine issue type and color based on labels
  const labelsArray = Array.from(labels);
  const { type, color } = determineIssueType(labelsArray);

  return {
    id: `timeline_${number}`,
    number: number,
    title: `Issue #${number}`,
    type: type,
    color: color,
    createdAt: createdAt,
    closedAt: closedAt,
    durationHours: durationHours,
    durationDays: durationDays,
    isOpen: isOpen,
    labels: labelsArray,
    author: 'unknown', // Timeline data doesn't include author info
    comments: 0, // Timeline data doesn't include comment count
    url: `https://github.com/scala/scala3/issues/${number}`
  };
}

/**
 * Determine issue type and color based on GitHub labels
 * Maps Scala 3 repository labels to visualization categories
 * @param {Array} labels - Array of label names
 * @returns {Object} Type and color information
 */
function determineIssueType(labels) {
  // Define label mapping with priorities (higher priority = checked first)
  const typeMapping = [
    {
      patterns: ['itype:bug', 'stat:needs triage', 'regression'],
      type: 'Bug',
      color: '#dc3545'
    },
    {
      patterns: ['itype:enhancement', 'itype:feature'],
      type: 'Feature Request',
      color: '#28a745'
    },
    {
      patterns: ['itype:improvement', 'itype:optimization'],
      type: 'Improvement',
      color: '#17a2b8'
    },
    {
      patterns: ['itype:question', 'stat:needs spec', 'discussion'],
      type: 'Question',
      color: '#ffc107'
    },
    {
      patterns: ['documentation', 'docs'],
      type: 'Documentation',
      color: '#6f42c1'
    }
  ];

  // Check each type mapping
  for (const mapping of typeMapping) {
    for (const pattern of mapping.patterns) {
      if (labels.some(label =>
        typeof label === 'string' && label.toLowerCase().includes(pattern.toLowerCase())
      )) {
        return { type: mapping.type, color: mapping.color };
      }
    }
  }

  // Default type if no specific type found
  return { type: 'Other', color: '#6c757d' };
}

/**
 * Fallback mock data generator (kept for compatibility)
 * Used only if real data loading fails
 */
function generateMockIssuesData() {
  console.warn('Using fallback mock data - real data loading failed');

  const issueTypes = [
    { name: 'Bug', weight: 0.4, color: '#FF6B6B' },
    { name: 'Enhancement', weight: 0.3, color: '#4ECDC4' },
    { name: 'Improvement', weight: 0.2, color: '#45B7D1' },
    { name: 'Question', weight: 0.1, color: '#96CEB4' }
  ];

  const issues = [];
  const currentDate = new Date();
  const twoYearsAgo = new Date(currentDate.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);

  // Generate around 200 issues (smaller set for fallback)
  for (let i = 0; i < 200; i++) {
    const createdAt = new Date(
      twoYearsAgo.getTime() + Math.random() * (currentDate.getTime() - twoYearsAgo.getTime())
    );

    let typeIndex = 0;
    const random = Math.random();
    let cumulative = 0;
    for (let j = 0; j < issueTypes.length; j++) {
      cumulative += issueTypes[j].weight;
      if (random <= cumulative) {
        typeIndex = j;
        break;
      }
    }

    const issueType = issueTypes[typeIndex];

    // 70% chance the issue is closed
    const isClosed = Math.random() < 0.7;
    let closedAt = null;
    let durationHours = null;
    let durationDays = null;

    if (isClosed) {
      // Random closure time between creation and now
      closedAt = new Date(
        createdAt.getTime() + Math.random() * (currentDate.getTime() - createdAt.getTime())
      );
      durationHours = (closedAt - createdAt) / (1000 * 60 * 60);
      durationDays = durationHours / 24;
    }

    issues.push({
      id: `mock_${i}`,
      number: 1000 + i,
      title: `Mock Issue ${i + 1}`,
      type: issueType.name,
      color: issueType.color,
      createdAt: createdAt,
      closedAt: closedAt,
      durationHours: durationHours,
      durationDays: durationDays,
      isOpen: !isClosed,
      labels: [issueType.name.toLowerCase()],
      author: `author${(i % 10) + 1}`,
      comments: Math.floor(Math.random() * 20),
      url: `https://github.com/scala/scala3/issues/${1000 + i}`
    });
  }

  return issues;
}

// Issues Chart Management
let issuesChart = null;
let issuesData = null;
let filteredIssuesData = null;

/**
 * Initialize the issues chart
 * Called when panel3 tab is activated
 */
export function initializeIssuesChart() {
  if (issuesChart) return; // Already initialized

  // Load real issues data
  issuesData = loadRealIssuesData();
  filteredIssuesData = issuesData.slice(); // Start with all data

  console.log(`Loaded ${issuesData.length} issues from timeline data`);

  setupIssuesChart();
  setupIssueFilters();
  updateIssuesChart();
  updateIssueStatistics();
}

/**
 * Setup the Chart.js histogram chart
 */
function setupIssuesChart() {
  const ctx = document.getElementById('issuesHistogram').getContext('2d');

  issuesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          callbacks: {
            title: function (context) {
              const label = context[0].label;
              if (label.startsWith('>')) {
                return `Duration: ${label} days`;
              }
              const binStart = Math.round(parseFloat(label));
              const binSize = getBinSize();
              const binEnd = binStart + binSize;
              return `Duration: ${binStart}-${binEnd} days`;
            },
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y} issues`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Issue Duration (Days)',
            color: 'var(--text-color)'
          },
          ticks: {
            color: 'var(--text-color)',
            callback: function (value, index) {
              return Math.round(parseFloat(this.getLabelForValue(value)));
            }
          },
          grid: {
            color: 'rgba(128, 128, 128, 0.2)'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Number of Issues',
            color: 'var(--text-color)'
          },
          ticks: {
            color: 'var(--text-color)',
            precision: 0
          },
          grid: {
            color: 'rgba(128, 128, 128, 0.2)'
          }
        }
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      }
    }
  });
}

/**
 * Setup issue type filters and bin size slider
 */
function setupIssueFilters() {
  // Issue type filters
  const filterIds = ['bugFilter', 'featureFilter', 'improvementFilter', 'questionFilter'];
  filterIds.forEach(filterId => {
    const filter = document.getElementById(filterId);
    if (filter) {
      filter.addEventListener('change', () => {
        updateFilteredData();
        updateIssuesChart();
        updateIssueStatistics();
      });
    }
  });

  // Bin size slider
  const binSizeSlider = document.getElementById('binSizeSlider');
  const binSizeValue = document.getElementById('binSizeValue');

  if (binSizeSlider && binSizeValue) {
    binSizeSlider.addEventListener('input', function () {
      binSizeValue.textContent = this.value;
      updateIssuesChart();
    });
  }
}

/**
 * Update filtered data based on active filters
 */
function updateFilteredData() {
  const activeFilters = {
    bug: document.getElementById('bugFilter')?.checked ?? true,
    feature: document.getElementById('featureFilter')?.checked ?? true,
    improvement: document.getElementById('improvementFilter')?.checked ?? true,
    question: document.getElementById('questionFilter')?.checked ?? true
  };

  filteredIssuesData = issuesData.filter(issue => {
    const type = issue.type.toLowerCase();

    if (type.includes('bug') && activeFilters.bug) return true;
    if ((type.includes('feature') || type.includes('enhancement')) && activeFilters.feature) return true;
    if (type.includes('improvement') && activeFilters.improvement) return true;
    if (type.includes('question') && activeFilters.question) return true;

    // Include 'Other' and 'Documentation' types if any filter is active
    if ((type.includes('other') || type.includes('documentation')) &&
      (activeFilters.bug || activeFilters.feature || activeFilters.improvement || activeFilters.question)) {
      return true;
    }

    return false;
  });
}

/**
 * Get current bin size from slider
 */
function getBinSize() {
  const slider = document.getElementById('binSizeSlider');
  return slider ? parseInt(slider.value) : 7;
}

/**
 * Update the histogram chart with current data
 */
function updateIssuesChart() {
  if (!issuesChart || !filteredIssuesData) return;

  // Filter only closed issues for duration analysis
  const closedIssues = filteredIssuesData.filter(issue => !issue.isOpen && issue.durationDays !== null);

  if (closedIssues.length === 0) {
    issuesChart.data.labels = [];
    issuesChart.data.datasets = [];
    issuesChart.update();
    return;
  }

  const binSize = getBinSize();
  const maxDisplayDuration = 365; // Issues > 500 days go into a special bin

  // Separate issues into regular bins and long-duration bin
  const regularIssues = closedIssues.filter(issue => issue.durationDays <= maxDisplayDuration);
  const longDurationIssues = closedIssues.filter(issue => issue.durationDays > maxDisplayDuration);

  // Calculate number of bins for regular issues
  const numRegularBins = Math.ceil(maxDisplayDuration / binSize);

  // Create regular bins
  const bins = Array(numRegularBins).fill(0).map((_, i) => ({
    start: i * binSize,
    end: (i + 1) * binSize,
    count: 0,
    issues: [],
    isLongDuration: false
  }));

  // Add special bin for long-duration issues (> 500 days)
  if (longDurationIssues.length > 0) {
    bins.push({
      start: maxDisplayDuration,
      end: Infinity,
      count: longDurationIssues.length,
      issues: longDurationIssues,
      isLongDuration: true
    });
  }

  // Populate regular bins
  regularIssues.forEach(issue => {
    const binIndex = Math.min(Math.floor(issue.durationDays / binSize), numRegularBins - 1);
    bins[binIndex].count++;
    bins[binIndex].issues.push(issue);
  });

  // Create chart data with special labeling for long-duration bin
  const labels = bins.map(bin => {
    if (bin.isLongDuration) {
      return `>${maxDisplayDuration}`;
    }
    return bin.start.toString();
  });
  const data = bins.map(bin => bin.count);

  // Use different colors for regular and long-duration bins
  const backgroundColor = bins.map(bin => {
    if (bin.isLongDuration) {
      return 'rgba(255, 99, 132, 0.6)'; // Red for long-duration
    }
    return 'rgba(54, 162, 235, 0.6)'; // Blue for regular
  });

  const borderColor = bins.map(bin => {
    if (bin.isLongDuration) {
      return 'rgba(255, 99, 132, 1)'; // Red border
    }
    return 'rgba(54, 162, 235, 1)'; // Blue border
  });

  issuesChart.data.labels = labels;
  issuesChart.data.datasets = [{
    label: 'Issues',
    data: data,
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderWidth: 1
  }];

  issuesChart.update();
}

/**
 * Update issue statistics display
 */
function updateIssueStatistics() {
  if (!filteredIssuesData) return;

  const totalIssues = filteredIssuesData.length;
  const closedIssues = filteredIssuesData.filter(issue => !issue.isOpen && issue.durationDays !== null);

  // Update total issues
  const totalElement = document.getElementById('totalIssues');
  if (totalElement) {
    totalElement.textContent = totalIssues.toLocaleString();
  }

  if (closedIssues.length === 0) {
    // Clear statistics if no closed issues
    ['medianDuration', 'averageDuration', 'longestDuration'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = 'N/A';
    });
    return;
  }

  // Calculate statistics
  const durations = closedIssues.map(issue => issue.durationDays).sort((a, b) => a - b);

  const median = durations.length % 2 === 0
    ? (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2
    : durations[Math.floor(durations.length / 2)];

  const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const longest = Math.max(...durations);

  // Update statistics display
  const medianElement = document.getElementById('medianDuration');
  if (medianElement) {
    medianElement.textContent = `${median.toFixed(1)} days`;
  }

  const averageElement = document.getElementById('averageDuration');
  if (averageElement) {
    averageElement.textContent = `${average.toFixed(1)} days`;
  }

  const longestElement = document.getElementById('longestDuration');
  if (longestElement) {
    longestElement.textContent = `${longest.toFixed(1)} days`;
  }

  // Update type distribution
  updateTypeDistribution();
}

/**
 * Update issue type distribution display
 */
function updateTypeDistribution() {
  const typeDistElement = document.getElementById('typeDistribution');
  if (!typeDistElement || !filteredIssuesData) return;

  // Count issues by type
  const typeCounts = {};
  filteredIssuesData.forEach(issue => {
    const type = issue.type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  // Create distribution display
  typeDistElement.innerHTML = '';
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .forEach(([type, count]) => {
      const percentage = ((count / filteredIssuesData.length) * 100).toFixed(1);

      const typeItem = document.createElement('div');
      typeItem.className = 'type-item';
      typeItem.innerHTML = `
        <div class="type-info">
          <span class="type-name">${type}</span>
          <span class="type-count">${count} (${percentage}%)</span>
        </div>
      `;

      typeDistElement.appendChild(typeItem);
    });
}
