// Mock data generator for demonstration
// In a real implementation, this would fetch data from your git scripts
function generateMockData() {
  const contributors = [
    'Martin Odersky', 'Hamza Remmal', 'Dale Wijnand', 'noti0na1', 
    'Eugene Flesselle', 'Wojciech Mazur', 'Sébastien Doeraene', 'Matt Bovel',
    'Guillaume Martres', 'Jan Chyb', 'Som Snytt', 'Jamie Thompson',
    'Kacper Korban', 'Nicolas Stucki', 'Tomasz Godzik', 'Adrien Piquerez'
  ];

  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  const timePoints = [];

  // Generate monthly time points
  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    timePoints.push(new Date(d));
  }

  const data = {
    timePoints: timePoints,
    contributors: contributors.map((name, index) => {
      const baseCommits = Math.max(50, Math.random() * 200 - index * 8);
      const baseLinesChanged = baseCommits * (100 + Math.random() * 500);
      
      return {
        name: name,
        color: generateColor(index),
        totalCommits: Math.floor(baseCommits * timePoints.length * (0.7 + Math.random() * 0.6)),
        totalLinesChanged: Math.floor(baseLinesChanged * timePoints.length * (0.7 + Math.random() * 0.6)),
        data: timePoints.map((_, timeIndex) => {
          const commitTrend = Math.sin(timeIndex * 0.3 + index) * 0.3 + 1;
          const randomVariation = 0.8 + Math.random() * 0.4;
          const commits = Math.floor(baseCommits * commitTrend * randomVariation);
          const linesChanged = Math.floor(commits * (100 + Math.random() * 500));
          
          return {
            time: timePoints[timeIndex],
            commits: Math.max(0, commits),
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

function generateColor(index) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#85C1E9', '#D7BDE2', '#A3E4D7'
  ];
  return colors[index % colors.length];
}

class ContributorChart {
  constructor() {
    this.data = null;
    this.chart = null;
    this.showCommits = true; // true for commits, false for lines changed
    this.selectedContributors = new Set();
    this.timeRange = { start: 0, end: 0 };
    
    this.loadData();
  }

  async loadData() {
    try {
      // Try to load real data first, fall back to mock data
      const response = await fetch('contributors_data.json');
      if (response.ok) {
        this.data = await response.json();
        // Convert time points to Date objects if they're strings
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
      this.data = generateMockData();
    }

    this.timeRange = { start: 0, end: this.data.timePoints.length - 1 };
    
    // Select top 8 contributors by default
    this.data.contributors.slice(0, 8).forEach(c => this.selectedContributors.add(c.name));
    
    this.init();
  }

  init() {
    this.setupChart();
    this.setupTimeSlider();
    this.setupMetricToggle();
    this.setupContributorsList();
    this.updateChart();
  }

  setupChart() {
    const ctx = document.getElementById('contributorChart').getContext('2d');
    
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
          mode: 'index',
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
            display: false // We'll use custom legend
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                const date = new Date(context[0].label);
                return date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                });
              },
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
              text: 'Number of Commits'
            },
            grid: {
              display: true,
              color: 'rgba(0,0,0,0.1)'
            },
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.3,
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

  setupTimeSlider() {
    const startHandle = document.getElementById('startHandle');
    const endHandle = document.getElementById('endHandle');
    let isDragging = null;

    const updateHandlePosition = (handle, percentage) => {
      handle.style.left = `${percentage}%`;
    };

    const updateTimeRange = () => {
      const startPercentage = parseFloat(startHandle.style.left.replace('%', ''));
      const endPercentage = parseFloat(endHandle.style.left.replace('%', ''));
      
      this.timeRange.start = Math.floor((startPercentage / 100) * (this.data.timePoints.length - 1));
      this.timeRange.end = Math.floor((endPercentage / 100) * (this.data.timePoints.length - 1));
      
      this.updateTimeDescription();
      this.updateChart();
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const slider = document.querySelector('.slider-wrapper');
      const rect = slider.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      
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

    const handleMouseUp = () => {
      isDragging = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

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

    // Initialize positions
    updateHandlePosition(startHandle, 20);
    updateHandlePosition(endHandle, 80);
    updateTimeRange();
  }

  setupMetricToggle() {
    const toggle = document.getElementById('metricToggle');
    const label = document.getElementById('metricLabel');

    toggle.addEventListener('change', () => {
      this.showCommits = !toggle.checked;
      label.textContent = this.showCommits ? 'Total Commits' : 'Lines Changed';
      this.updateChart();
      this.updateContributorsList();
    });
  }

  setupContributorsList() {
    const container = document.getElementById('contributorsList');
    
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

    // Add event listeners
    container.addEventListener('click', (e) => {
      const item = e.target.closest('.contributor-item');
      if (!item) return;

      const name = item.dataset.name;
      const checkbox = item.querySelector('.contributor-checkbox');
      
      if (this.selectedContributors.has(name)) {
        this.selectedContributors.delete(name);
        item.classList.remove('active');
        checkbox.checked = false;
      } else {
        this.selectedContributors.add(name);
        item.classList.add('active');
        checkbox.checked = true;
      }
      
      this.updateChart();
    });
  }

  updateContributorsList() {
    const items = document.querySelectorAll('.contributor-item');
    items.forEach(item => {
      const name = item.dataset.name;
      const contributor = this.data.contributors.find(c => c.name === name);
      const statsElement = item.querySelector('.contributor-stats');
      
      if (contributor && statsElement) {
        statsElement.textContent = this.showCommits 
          ? contributor.totalCommits.toLocaleString() + ' commits'
          : contributor.totalLinesChanged.toLocaleString() + ' lines';
      }
    });
  }

  updateTimeDescription() {
    const startDate = this.data.timePoints[this.timeRange.start];
    const endDate = this.data.timePoints[this.timeRange.end];
    
    const options = { year: 'numeric', month: 'long' };
    const startStr = startDate.toLocaleDateString('en-US', options);
    const endStr = endDate.toLocaleDateString('en-US', options);
    
    document.getElementById('timeRange').textContent = `${startStr} - ${endStr}`;
  }

  updateChart() {
    const filteredData = this.getFilteredData();
    
    this.chart.data.labels = filteredData.labels;
    this.chart.data.datasets = filteredData.datasets;
    
    // Update Y-axis title
    this.chart.options.scales.y.title.text = this.showCommits ? 'Number of Commits' : 'Lines Changed';
    
    this.chart.update('none');
  }

  getFilteredData() {
    const selectedContributors = this.data.contributors.filter(c => 
      this.selectedContributors.has(c.name)
    );

    const timeSlice = this.data.timePoints.slice(this.timeRange.start, this.timeRange.end + 1);
    const labels = timeSlice.map(date => date.toISOString().substr(0, 7)); // YYYY-MM format

    const datasets = selectedContributors.map(contributor => {
      const dataSlice = contributor.data.slice(this.timeRange.start, this.timeRange.end + 1);
      const values = dataSlice.map(d => this.showCommits ? d.commits : (d.linesChanged || d.lines_changed || 0));

      return {
        label: contributor.name,
        data: values,
        borderColor: contributor.color,
        backgroundColor: contributor.color + '20', // Add transparency
        yAxisID: this.showCommits ? 'commits' : 'lines',
        fill: false,
        tension: 0.3
      };
    });

    return { labels, datasets };
  }
}

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new ContributorChart();
});
