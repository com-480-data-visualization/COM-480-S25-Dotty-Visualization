# Dotty Visualization Overview

## Introduction

This project aims to visualize the development progress, maintenance status, and adoption of new language features 
within the Dotty (Scala 3) compiler.
Dotty is a compiler implementation of a mainstream programming language with hundreds of thousands of users,
ranging from enterprise companies to academics to personal hobbyists.
Unlike many other mainstream programming languages, Dotty is completely developed in the open: while a sizeable
portion of the maintenance and experimental feature developement are done by LAMP (EPFL),
the compiler welcomes and hugely benefits from external contributors: from ideas, proposals to implementation and
bugfixes.
On the other hand, Dotty is a complex project with multiple parts (a code compiler with multiple advanced features,
a comprehensive language test framework, documentation tools, IDE integration tools,...) evolving rapidly over time.

Our goal is to provide an navigable interactive visualization of development and maintenance history across both axes:
developers and feature modules (with granularity down to source files); as well as over the evolution of the project
by both time and release timelines.

The project will be utilizing data from:
1. **Git Commits**: Analysis will include commit history data such as author details, commit messages, timestamps, and code changes to track the development process.
2. **Issues and Pull Requests**: We will extract issues and pull requests via GitHub API (JSON format) to analyze issue lifecycle, contributor engagement, and maintenance workflows.
3. **Codebase**: We will compute file-level metrics (e.g., modification frequency, feature adoption) to identify hotspots and stability trends.

## Tools and Lectures

The following tools and lectures from the course syllabus will be essential for this project:

1. The web stack:
- HTML, CSS, DOM: For the webpage structure and styling the visualization.
- JavaScript, specifically D3.js: For providing the interactive charts and time/location controls,
  as well as the file explorer.

2. Visualization fundamentals:
- Extracting and processing data (2.1, 2.2) from Git and GitHub and structuring them to fit our vision.
- Chart & controls design (2.3 - 2.5) for filtering changes over time/feature - section - files and contributers.

3. Techniques and algorithms:
- Trees and Graphs (3.3) for visualizing changes close to the project's natural organization of a filesystem,
  as well as showing the growing dependencies between features and modules in the project over time.
- Tabular data (3.4) for handling structured data from APIs and calculating aggregations for visualization.

## Project Timeline

### MVP structure

#### Repository Structure Visualization
- Interactive tree/graph visualization of the Dotty codebase structure
- Highlight main components and their relationships
- Basic filtering options to focus on specific packages/modules

#### Contributor Network
- Basic network graph showing main contributors
- Visualize collaboration patterns between developers
- Filter by time period and project area

### Performance Metrics Dashboard
- Simple charts showing compiler performance metrics

### Possible enhancements

#### Advanced Features
1. **Interactive Code Explorer**
   - Clickable visualization of code dependencies
   - Animated code flow visualization during compilation phases
   - Syntax highlighting and code preview integration

2. **Git History Playback**
   - Animated replay of repository evolution
   - Visual diff of key architectural changes
   - Highlight critical refactoring points

3. **Contributor Activity Heatmap**
   - Time-based visualization of developer activity
   - Geographic distribution of contributors
   - Topic specialization analysis

4. **Performance Comparison Tool**
   - Side-by-side visualization of performance between Dotty and Scala 2
   - Interactive benchmarking visualization
   - Hardware impact analysis

#### Visual Enhancements
1. **3D Visualization Options**
   - 3D code structure visualization
   - VR/AR compatibility for immersive code exploration

2. **Real-time Data Integration**
   - Live updates from repository changes
   - CI/CD pipeline visualization integration

3. **Custom Theming and Accessibility**
   - Dark/light mode toggle
   - Configurable color schemes for better accessibility
   - Screen reader optimizations

4. **Export and Sharing Features**
   - Generate shareable visualizations
   - Export to various formats (PNG, SVG, interactive HTML)
   - Embeddable widgets for documentation

### Implementation Approach
- Process the data into a small set and a large set.
  * Small set: conatains all essential data from last year
  * Large set: contains all data from the repository
  We use the small set for development and testing, and the large set for the final visualization.
- Build a modular architecture where each visualization panel is independent
- Start with the core features in simplified form
- Use progressive enhancement to add features without breaking core functionality
- Implement responsive design from the beginning

## Sketches

### Compiler Network

![](sketch/Network-dotty.svg)

The network graph shows the dependencies between a selected range of files in the compiler. 
The size of each node represents the number of usgaes of the file.
By forcusing on a given module, we can see how the files are interconnected and which files are most important in terms of dependencies, without being distracted by some commonly used helper files.
Similarly, by clicking on a node, the user will be redirected to the corresponding file in the GitHub repository.

### Treemap

![](sketch/Treemap-dotty.svg)

