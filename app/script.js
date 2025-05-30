import { ScalaFileMap } from "./graphs";
import { contributorsData } from "./data";
import { initializeIssuesChart } from "./issues";
import { initializeContributorsChart } from "./contributors";
import { TimelineVisualization } from "./timeline";

let scalaFileMap = null;
let timeline = null;

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
      } else if (target === "panel3") {
        initializeIssuesChart();
      } else if (target === "panel4") {
        if (timeline) {
          timeline.processTimelineData();
        } else {
          timeline = new TimelineVisualization();
        }
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

