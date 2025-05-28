/**
 * Mock data generator for demonstration purposes
 * In a real implementation, this would fetch data from your git scripts
 * @returns {Object} Mock contributor data with time points and contributor statistics
 */
function generateMockData() {
  // List of actual Scala 3 (Dotty) contributors for realistic mock data
  const contributors = [
    'Martin Odersky', 'Hamza Remmal', 'Dale Wijnand', 'noti0na1', 
    'Eugene Flesselle', 'Wojciech Mazur', 'Sébastien Doeraene', 'Matt Bovel',
    'Guillaume Martres', 'Jan Chyb', 'Som Snytt', 'Jamie Thompson',
    'Kacper Korban', 'Nicolas Stucki', 'Tomasz Godzik', 'Adrien Piquerez'
  ];

  // Define the time range for the mock data (2-year period)
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  const timePoints = [];

  // Generate monthly time points for the visualization
  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    timePoints.push(new Date(d));
  }

  const data = {
    timePoints: timePoints,
    contributors: contributors.map((name, index) => {
      // Generate base activity levels with variation based on contributor position
      // More prominent contributors (lower index) tend to have higher activity
      const baseCommits = Math.max(50, Math.random() * 200 - index * 8);
      const baseLinesChanged = baseCommits * (100 + Math.random() * 500);
      
      return {
        name: name,
        color: generateColor(index), // Assign unique color for visualization
        // Calculate total statistics across all time points
        totalCommits: Math.floor(baseCommits * timePoints.length * (0.7 + Math.random() * 0.6)),
        totalLinesChanged: Math.floor(baseLinesChanged * timePoints.length * (0.7 + Math.random() * 0.6)),
        // Generate time-series data with realistic trends and variations
        data: timePoints.map((_, timeIndex) => {
          // Create sinusoidal trend for realistic activity patterns
          const commitTrend = Math.sin(timeIndex * 0.3 + index) * 0.3 + 1;
          const randomVariation = 0.8 + Math.random() * 0.4;
          const commits = Math.floor(baseCommits * commitTrend * randomVariation);
          const linesChanged = Math.floor(commits * (100 + Math.random() * 500));
          
          return {
            time: timePoints[timeIndex],
            commits: Math.max(0, commits), // Ensure non-negative values
            linesChanged: Math.max(0, linesChanged)
          };
        })
      };
    })
  };

  // Sort contributors by total commits (descending)
  data.contributors.sort((a, b) => b.totalCommits - a.totalCommits);
  
  return data;
}

/**
 * Generates distinct colors for contributor visualization
 * @param {number} index - Index of the contributor for color assignment
 * @returns {string} Hex color code
 */
function generateColor(index) {
  // Predefined color palette for good visual distinction
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#85C1E9', '#D7BDE2', '#A3E4D7'
  ];
  return colors[index % colors.length]; // Cycle through colors if more contributors than colors
}

/**
 * Main class for managing the contributor activity visualization
 * Handles data loading, chart setup, user interactions, and updates
 */
class ContributorChart {
  constructor() {
    this.data = null; // Will store contributor data
    this.chart = null; // Chart.js instance
    this.showCommits = true; // Toggle between commits and lines changed metrics
    this.selectedContributors = new Set(); // Track which contributors are selected for display
    this.timeRange = { start: 0, end: 0 }; // Current time range selection
    
    this.loadData(); // Initialize data loading
  }

  /**
   * Loads contributor data from JSON file or falls back to mock data
   * Handles data format conversion for proper date handling
   */
  async loadData() {
    try {
      // Attempt to load real data from contributors_data.json
      const response = await fetch('contributors_data.json');
      if (response.ok) {
        this.data = await response.json();
        
        // Convert string dates to Date objects if necessary
        if (this.data.timePoints && this.data.timePoints.length > 0) {
          if (typeof this.data.timePoints[0] === 'string') {
            this.data.timePoints = this.data.timePoints.map(tp => new Date(tp + '-01'));
          }
          
          // Update contributor data time points as well
          this.data.contributors.forEach(contributor => {
            contributor.data.forEach((point, index) => {
              if (typeof point.time === 'string') {
                point.time = new Date(point.time + '-01');
              }
            });
          });
        }
        console.log('Loaded real contributor data');
      } else {
        throw new Error('Real data not available');
      }
    } catch (error) {
      console.log('Loading mock data:', error.message);
      this.data = generateMockData(); // Fall back to mock data
    }

    // Initialize time range to show all data
    this.timeRange = { start: 0, end: this.data.timePoints.length - 1 };
    
    // Select top 8 contributors by default for better initial visualization
    this.data.contributors.slice(0, 8).forEach(c => this.selectedContributors.add(c.name));
    
    this.init(); // Initialize UI components
  }

  /**
   * Initialize all UI components and chart
   */
  init() {
    this.setupChart();
    this.setupTimeSlider();
    this.setupMetricToggle();
    this.setupContributorsList();
    this.updateChart(); // Initial chart render
  }

  /**
   * Sets up the Chart.js line chart with proper configuration
   */
  setupChart() {
    const ctx = document.getElementById('contributorsChart').getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index', // Show data for all datasets at the same x position
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: 'Contributor Activity Over Time',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false // Use custom legend in the contributors list instead
          },
          tooltip: {
            callbacks: {
              // Format tooltip title to show readable date
              title: function(context) {
                const date = new Date(context[0].label);
                return date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                });
              },
              // Format tooltip labels with contributor name and metric
              label: function(context) {
                const contributor = context.dataset.label;
                const value = context.parsed.y;
                const metric = context.chart.data.datasets[0].yAxisID === 'commits' ? 'commits' : 'lines changed';
                return `${contributor}: ${value.toLocaleString()} ${metric}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time Period'
            },
            grid: {
              display: true,
              color: 'rgba(0,0,0,0.1)'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Number of Commits' // Will be updated based on selected metric
            },
            grid: {
              display: true,
              color: 'rgba(0,0,0,0.1)'
            },
            ticks: {
              // Format large numbers with thousands separators
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.3, // Smooth curves
            borderWidth: 2.5
          },
          point: {
            radius: 4,
            hoverRadius: 6,
            borderWidth: 2,
            backgroundColor: 'white'
          }
        }
      }
    });
  }

  /**
   * Sets up the time range slider with draggable handles
   * Implements custom dual-handle slider for selecting time ranges
   * Note: This expects custom HTML elements that may not exist in the current DOM
   */
  setupTimeSlider() {
    const startHandle = document.getElementById('startHandle');
    const endHandle = document.getElementById('endHandle');
    let isDragging = null; // Track which handle is being dragged

    // Update handle position as a percentage of the slider width
    const updateHandlePosition = (handle, percentage) => {
      handle.style.left = `${percentage}%`;
    };

    // Calculate and update the time range based on handle positions
    const updateTimeRange = () => {
      const startPercentage = parseFloat(startHandle.style.left.replace('%', ''));
      const endPercentage = parseFloat(endHandle.style.left.replace('%', ''));
      
      // Convert percentages to array indices
      this.timeRange.start = Math.floor((startPercentage / 100) * (this.data.timePoints.length - 1));
      this.timeRange.end = Math.floor((endPercentage / 100) * (this.data.timePoints.length - 1));
      
      this.updateTimeDescription(); // Update display text
      this.updateChart(); // Refresh chart with new time range
    };

    // Handle mouse movement during drag operations
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const slider = document.querySelector('.slider-wrapper');
      const rect = slider.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      
      // Ensure start handle doesn't go past end handle and vice versa
      if (isDragging === 'start') {
        const endPercentage = parseFloat(endHandle.style.left.replace('%', ''));
        if (percentage < endPercentage) {
          updateHandlePosition(startHandle, percentage);
          updateTimeRange();
        }
      } else if (isDragging === 'end') {
        const startPercentage = parseFloat(startHandle.style.left.replace('%', ''));
        if (percentage > startPercentage) {
          updateHandlePosition(endHandle, percentage);
          updateTimeRange();
        }
      }
    };

    // Clean up event listeners when dragging ends
    const handleMouseUp = () => {
      isDragging = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    // Set up event listeners for drag start
    startHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = 'start';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });

    endHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = 'end';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });

    // Initialize handle positions (20% and 80% of the slider)
    updateHandlePosition(startHandle, 20);
    updateHandlePosition(endHandle, 80);
    updateTimeRange();
  }

  /**
   * Sets up the metric toggle switch (commits vs lines changed)
   */
  setupMetricToggle() {
    const toggle = document.getElementById('metricToggle');
    const label = document.getElementById('metricLabel');

    toggle.addEventListener('change', () => {
      // Toggle between commits and lines changed metrics
      this.showCommits = !toggle.checked;
      label.textContent = this.showCommits ? 'Total Commits' : 'Lines Changed';
      this.updateChart(); // Update chart with new metric
      this.updateContributorsList(); // Update contributor statistics display
    });
  }

  /**
   * Creates and populates the contributors list with checkboxes and statistics
   */
  setupContributorsList() {
    const container = document.getElementById('contributorsList');
    
    // Generate HTML for each contributor item
    container.innerHTML = this.data.contributors.map(contributor => {
      const isSelected = this.selectedContributors.has(contributor.name);
      return `
        <div class="contributor-item ${isSelected ? 'active' : ''}" data-name="${contributor.name}">
          <div class="contributor-color" style="background-color: ${contributor.color}"></div>
          <div class="contributor-info">
            <div class="contributor-name">${contributor.name}</div>
            <div class="contributor-stats">
              ${this.showCommits ? contributor.totalCommits.toLocaleString() + ' commits' : contributor.totalLinesChanged.toLocaleString() + ' lines'}
            </div>
          </div>
          <input type="checkbox" class="contributor-checkbox" ${isSelected ? 'checked' : ''}>
        </div>
      `;
    }).join('');

    // Add click event listener for contributor selection
    container.addEventListener('click', (e) => {
      const item = e.target.closest('.contributor-item');
      if (!item) return;

      const name = item.dataset.name;
      const checkbox = item.querySelector('.contributor-checkbox');
      
      // Toggle contributor selection
      if (this.selectedContributors.has(name)) {
        this.selectedContributors.delete(name);
        item.classList.remove('active');
        checkbox.checked = false;
      } else {
        this.selectedContributors.add(name);
        item.classList.add('active');
        checkbox.checked = true;
      }
      
      this.updateChart(); // Update chart with new selection
    });
  }

  /**
   * Updates the statistics display for all contributors based on current metric
   */
  updateContributorsList() {
    const items = document.querySelectorAll('.contributor-item');
    items.forEach(item => {
      const name = item.dataset.name;
      const contributor = this.data.contributors.find(c => c.name === name);
      const statsElement = item.querySelector('.contributor-stats');
      
      if (contributor && statsElement) {
        // Update stats text based on current metric selection
        statsElement.textContent = this.showCommits 
          ? contributor.totalCommits.toLocaleString() + ' commits'
          : contributor.totalLinesChanged.toLocaleString() + ' lines';
      }
    });
  }

  /**
   * Updates the time range description text
   */
  updateTimeDescription() {
    const startDate = this.data.timePoints[this.timeRange.start];
    const endDate = this.data.timePoints[this.timeRange.end];
    
    const options = { year: 'numeric', month: 'long' };
    const startStr = startDate.toLocaleDateString('en-US', options);
    const endStr = endDate.toLocaleDateString('en-US', options);
    
    // Note: This assumes there's a timeRange element in the DOM
    document.getElementById('timeRange').textContent = `${startStr} - ${endStr}`;
  }

  /**
   * Updates the chart with current filters and selections
   */
  updateChart() {
    const filteredData = this.getFilteredData();
    
    // Update chart data
    this.chart.data.labels = filteredData.labels;
    this.chart.data.datasets = filteredData.datasets;
    
    // Update Y-axis title based on current metric
    this.chart.options.scales.y.title.text = this.showCommits ? 'Number of Commits' : 'Lines Changed';
    
    // Update chart without animation for better performance
    this.chart.update('none');
  }

  /**
   * Filters and formats data based on current selections
   * @returns {Object} Formatted data for Chart.js
   */
  getFilteredData() {
    // Filter contributors based on current selection
    const selectedContributors = this.data.contributors.filter(c => 
      this.selectedContributors.has(c.name)
    );

    // Get time slice based on current time range
    const timeSlice = this.data.timePoints.slice(this.timeRange.start, this.timeRange.end + 1);
    const labels = timeSlice.map(date => date.toISOString().substr(0, 7)); // YYYY-MM format

    // Create datasets for each selected contributor
    const datasets = selectedContributors.map(contributor => {
      const dataSlice = contributor.data.slice(this.timeRange.start, this.timeRange.end + 1);
      // Handle both property name variations (linesChanged vs lines_changed)
      const values = dataSlice.map(d => this.showCommits ? d.commits : (d.linesChanged || d.lines_changed || 0));

      return {
        label: contributor.name,
        data: values,
        borderColor: contributor.color,
        backgroundColor: contributor.color + '20', // Add transparency for fill areas
        yAxisID: this.showCommits ? 'commits' : 'lines',
        fill: false,
        tension: 0.3 // Smooth curves
      };
    });

    return { labels, datasets };
  }
}

/**
 * Initialize the contributor chart when the DOM is fully loaded
 * This ensures all HTML elements are available before trying to access them
 */
document.addEventListener('DOMContentLoaded', () => {
  new ContributorChart();
});
