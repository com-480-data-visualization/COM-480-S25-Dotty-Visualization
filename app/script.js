import { ScalaFileMap } from "./graphs";
import contributorsUrl from 'url:./contributors_data.json'

let scalaFileMap = null;

// Contributors chart variables
let contributorsChart = null;
let contributorsData = null;
let currentMetric = 'commits';
let timeRange = { start: 0, end: 100 };

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");
  const overviewContainer = document.querySelector("#overview .card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(target).classList.add("active");

      if (target === "overview") {
        fetchGitHubReadme();
      } else if (target === "panel1") {
        // Initialize ScalaFileMap only when panel1 is first accessed
        if (!scalaFileMap) {
          scalaFileMap = new ScalaFileMap("panel1");
        }
        scalaFileMap.draw();
      } else if (target === "panel2") {
        initializeContributorsChart();
      }
    });
  });

  function fetchGitHubReadme() {
    const rawReadmeUrl = "https://raw.githubusercontent.com/com-480-data-visualization/COM-480-S25-Dotty-Visualization/refs/heads/master/README.md"; // Replace with your actual link

    fetch(rawReadmeUrl)
      .then(response => {
        if (!response.ok) throw new Error("README not found.");
        return response.text();
      })
      .then(data => {
        const htmlContent = marked.parse(data);
        overviewContainer.innerHTML = `${htmlContent}`;
      })
      .catch(err => {
        overviewContainer.innerHTML = `<p style="color: red;">Error loading README: ${err.message}</p>`;
      });
  }

  // Load once on page load
  fetchGitHubReadme();
});

// Contributors Chart Functions
async function initializeContributorsChart() {
  if (contributorsChart) return; // Already initialized
  
  try {
    const response = await fetch(contributorsUrl);
    if (!response.ok) throw new Error('Failed to load contributors data');

    contributorsData = await response.json();

    setupContributorsChart();
    setupTimeSliders();
    setupMetricToggle();
    setupContributorControls();
    populateContributorsList();
    
  } catch (error) {
    console.error('Error loading contributors data:', error);
    document.getElementById('contributorsChart').parentElement.innerHTML = 
      '<p style="color: red;">Error loading contributors data. Please ensure contributors_data.json exists.</p>';
  }
}

function setupContributorsChart() {
  const ctx = document.getElementById('contributorsChart').getContext('2d');
  
  contributorsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: contributorsData.timePoints,
      datasets: []
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
          display: false // We'll use custom legend
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          callbacks: {
            title: function(context) {
              return `Month: ${context[0].label}`;
            },
            label: function(context) {
              const metricLabel = currentMetric === 'commits' ? 'Commits' : 'Lines Changed';
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} ${metricLabel}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time',
            color: 'var(--text-color)'
          },
          ticks: {
            color: 'var(--text-color)',
            maxTicksLimit: 10
          },
          grid: {
            color: 'rgba(128, 128, 128, 0.2)'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: currentMetric === 'commits' ? 'Total Commits' : 'Total Lines Changed',
            color: 'var(--text-color)'
          },
          ticks: {
            color: 'var(--text-color)',
            callback: function(value) {
              return value.toLocaleString();
            }
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
  
  updateChartData();
}

function setupTimeSliders() {
  const startSlider = document.getElementById('startTimeSlider');
  const endSlider = document.getElementById('endTimeSlider');
  const startLabel = document.getElementById('startTimeLabel');
  const endLabel = document.getElementById('endTimeLabel');
  
  function updateTimeLabels() {
    const startIndex = Math.floor((timeRange.start / 100) * (contributorsData.timePoints.length - 1));
    const endIndex = Math.floor((timeRange.end / 100) * (contributorsData.timePoints.length - 1));
    
    startLabel.textContent = contributorsData.timePoints[startIndex];
    endLabel.textContent = contributorsData.timePoints[endIndex];
  }
  
  startSlider.addEventListener('input', function() {
    timeRange.start = Math.min(parseInt(this.value), timeRange.end - 1);
    this.value = timeRange.start;
    updateTimeLabels();
    updateChartData();
  });
  
  endSlider.addEventListener('input', function() {
    timeRange.end = Math.max(parseInt(this.value), timeRange.start + 1);
    this.value = timeRange.end;
    updateTimeLabels();
    updateChartData();
  });
  
  updateTimeLabels();
}

function setupMetricToggle() {
  const metricToggle = document.getElementById('metricToggle');
  const currentMetricLabel = document.getElementById('currentMetric');
  
  metricToggle.addEventListener('change', function() {
    currentMetric = this.checked ? 'linesChanged' : 'commits';
    currentMetricLabel.textContent = this.checked ? 'Lines Changed' : 'Commits';
    
    // Update chart y-axis title
    contributorsChart.options.scales.y.title.text = 
      currentMetric === 'commits' ? 'Total Commits' : 'Total Lines Changed';
    
    updateChartData();
  });
}

function setupContributorControls() {
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  
  selectAllBtn.addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#contributorsList input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      if (!checkbox.checked) {
        checkbox.checked = true;
      }
    });
    updateChartData();
  });
  
  deselectAllBtn.addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#contributorsList input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        checkbox.checked = false;
      }
    });
    updateChartData();
  });
}

function populateContributorsList() {
  const contributorsList = document.getElementById('contributorsList');
  contributorsList.innerHTML = '';
  
  contributorsData.contributors.forEach((contributor, index) => {
    const contributorItem = document.createElement('div');
    contributorItem.className = 'contributor-item';
    
    const totalValue = currentMetric === 'commits' ? 
      contributor.totalCommits : contributor.totalLinesChanged;
    
    contributorItem.innerHTML = `
      <label class="contributor-checkbox">
        <input type="checkbox" checked data-contributor-index="${index}">
        <span class="checkmark" style="background-color: ${contributor.color}"></span>
        <div class="contributor-info">
          <div class="contributor-name">${contributor.name}</div>
          <div class="contributor-stats">${totalValue.toLocaleString()} ${currentMetric === 'commits' ? 'commits' : 'lines'}</div>
        </div>
      </label>
    `;
    
    const checkbox = contributorItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
      updateChartData();
    });
    
    contributorsList.appendChild(contributorItem);
  });
}

function updateChartData() {
  if (!contributorsChart || !contributorsData) return;
  
  const startIndex = Math.floor((timeRange.start / 100) * (contributorsData.timePoints.length - 1));
  const endIndex = Math.floor((timeRange.end / 100) * (contributorsData.timePoints.length - 1));
  
  const timePoints = contributorsData.timePoints.slice(startIndex, endIndex + 1);
  const datasets = [];
  
  // Get selected contributors
  const checkboxes = document.querySelectorAll('#contributorsList input[type="checkbox"]');
  
  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      const contributor = contributorsData.contributors[index];
      const data = contributor.data.slice(startIndex, endIndex + 1).map(point => {
        return currentMetric === 'commits' ? point.commits : point.linesChanged;
      });
      
      // Calculate cumulative values
      const cumulativeData = [];
      let sum = 0;
      for (const value of data) {
        sum += value;
        cumulativeData.push(sum);
      }
      
      datasets.push({
        label: contributor.name,
        data: cumulativeData,
        borderColor: contributor.color,
        backgroundColor: contributor.color + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: contributor.color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      });
    }
  });
  
  contributorsChart.data.labels = timePoints;
  contributorsChart.data.datasets = datasets;
  contributorsChart.update('none');
}