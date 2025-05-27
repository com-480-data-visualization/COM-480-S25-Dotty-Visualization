import * as d3 from "d3";
import * as data from "./data";

export class ForceDirectedGraph {
    constructor(rootid, startingData) {
        this.canvas = d3.select(`#${rootid} .graph`);
        this.context = this.canvas.node().getContext("2d");
        this.tooltip = d3.select(`#${rootid} .tooltip`);

        this.width = +this.canvas.attr("width");
        this.height = +this.canvas.attr("height");

        // Transform state for zooming and panning
        this.transform = d3.zoomIdentity;

        // Drag state
        this.draggedNode = null;
        this.isDragging = false;

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(80))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))

        this.setupEventListeners();
        this.render(startingData)
    }

    setupEventListeners() {
        // Setup zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", (event) => {
                this.transform = event.transform;
                this.ticked();
            });

        this.canvas.call(zoom);

        // Canvas mouse events for dragging and tooltips
        this.canvas
            .on("mousedown", (event) => this.handleMouseDown(event))
            .on("mousemove", (event) => this.handleMouseMove(event))
            .on("mouseup", () => this.handleMouseUp())
            .on("mouseleave", () => {
                this.hideTooltip();
                this.handleMouseUp();
            });
    }

    render(data) {
        // Create nodes and links
        const nodeMap = new Map();
        const links = [];

        data.forEach(d => {
            const source = d.from;
            const target = d.to;
            const weight = +d.weight || 1;

            // Add nodes if they don't exist
            if (!nodeMap.has(source)) {
                nodeMap.set(source, {
                    id: source,
                    fullPath: source,
                    shortPath: this.shortenPath(source),
                    incomingWeight: 0,
                    degree: 0
                });
            }
            if (!nodeMap.has(target)) {
                nodeMap.set(target, {
                    id: target,
                    fullPath: target,
                    shortPath: this.shortenPath(target),
                    incomingWeight: 0,
                    degree: 0
                });
            }

            // Increment degree for both nodes
            nodeMap.get(source).degree++;
            nodeMap.get(target).degree++;

            // Add incoming weight to target node
            nodeMap.get(source).incomingWeight += weight;
            nodeMap.get(target).incomingWeight += weight;

            // Add link
            links.push({
                source: source,
                target: target,
                weight: weight
            });
        });

        const nodes = Array.from(nodeMap.values());

        // Set up color scale based on incoming weights
        const maxWeight = d3.max(nodes, d => d.incomingWeight);
        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, maxWeight]);

        nodes.forEach(node => {
            node.color = colorScale(node.incomingWeight);
        });

        this.renderGraph(nodes, links);
    }

    shortenPath(path) {
        const parts = path.split('/');
        if (parts.length <= 2) return path;
        return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
    }

    renderGraph(nodes, links) {
        this.nodes = nodes;
        this.links = links;
        this.maxWeight = d3.max(nodes, d => d.incomingWeight);

        // Update simulation
        this.simulation
            .nodes(nodes)
            .on("tick", () => this.ticked());

        const maxLinkWeight = d3.max(links, d => d.weight);
        this.simulation.force("link")
            .links(links)
            .strength(d => Math.min(d.weight / maxLinkWeight, 1));

        this.simulation
            .force("charge")
            .strength(d => -100 * Math.pow(1 / this.maxWeight * d.incomingWeight, -0.5));

        this.simulation.alpha(1).restart();
    }

    ticked() {
        this.context.save();
        this.context.clearRect(0, 0, this.width, this.height);

        // Apply transform for zoom/pan
        this.context.translate(this.transform.x, this.transform.y);
        this.context.scale(this.transform.k, this.transform.k);

        // Draw links
        this.context.strokeStyle = "#666";
        this.context.lineWidth = 0.5 / this.transform.k; // Scale line width inversely with zoom
        this.links.forEach(d => {
            this.context.beginPath();
            this.context.moveTo(d.source.x, d.source.y);
            this.context.lineTo(d.target.x, d.target.y);
            this.context.stroke();
        });

        // Draw nodes
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.font = `${10 / this.transform.k}px Arial`; // Scale font inversely with zoom

        this.nodes.forEach(d => {
            // Draw node circle - size based on incoming weight
            const baseRadius = 6 + (50 - 6) * d.incomingWeight / this.maxWeight;
            const radius = baseRadius / this.transform.k;
            this.context.beginPath();
            this.context.arc(d.x, d.y, radius, 0, 2 * Math.PI);
            this.context.fillStyle = d.color;
            this.context.fill();
            this.context.strokeStyle = "#fff";
            this.context.lineWidth = 1 / this.transform.k;
            this.context.stroke();

            // Draw text label
            this.context.fillStyle = "#fff";
            this.context.strokeStyle = "#000";
            this.context.lineWidth = 3 / this.transform.k;
            this.context.strokeText(d.shortPath, d.x, d.y + radius + 12 / this.transform.k);
            this.context.fillText(d.shortPath, d.x, d.y + radius + 12 / this.transform.k);
        });

        this.context.restore();
    }

    handleMouseDown(event) {
        const [mouseX, mouseY] = d3.pointer(event);
        const transformedPoint = this.screenToWorld(mouseX, mouseY);

        // Find node under mouse
        const clickedNode = this.nodes.find(d => {
            const baseRadius = Math.max(6, Math.min(20, 6 + d.incomingWeight * 1.5));
            const radius = baseRadius / this.transform.k;
            const dx = transformedPoint[0] - d.x;
            const dy = transformedPoint[1] - d.y;
            return Math.sqrt(dx * dx + dy * dy) < radius + 15 / this.transform.k;
        });

        if (clickedNode) {
            this.draggedNode = clickedNode;
            this.isDragging = true;

            // Fix the node position during drag
            clickedNode.fx = clickedNode.x;
            clickedNode.fy = clickedNode.y;

            // Restart simulation to handle the fixed node
            this.simulation.alphaTarget(0.3).restart();

            event.preventDefault();
        }
    }

    handleMouseUp() {
        if (this.isDragging && this.draggedNode) {
            // Release the node
            this.draggedNode.fx = null;
            this.draggedNode.fy = null;

            // Let simulation settle
            this.simulation.alphaTarget(0);
        }

        this.draggedNode = null;
        this.isDragging = false;
    }

    screenToWorld(screenX, screenY) {
        return [
            (screenX - this.transform.x) / this.transform.k,
            (screenY - this.transform.y) / this.transform.k
        ];
    }

    handleMouseMove(event) {
        const [mouseX, mouseY] = d3.pointer(event);

        if (this.isDragging && this.draggedNode) {
            // Update dragged node position
            const transformedPoint = this.screenToWorld(mouseX, mouseY);
            this.draggedNode.fx = transformedPoint[0];
            this.draggedNode.fy = transformedPoint[1];
            return;
        }

        // Handle tooltip for hover
        const transformedPoint = this.screenToWorld(mouseX, mouseY);
        const hoveredNode = this.nodes.find(d => {
            const radius = Math.max(8, Math.min(15, d.degree * 2)) / this.transform.k;
            const dx = transformedPoint[0] - d.x;
            const dy = transformedPoint[1] - d.y;
            return Math.sqrt(dx * dx + dy * dy) < radius + 15 / this.transform.k;
        });

        if (hoveredNode) {
            this.showTooltip(event, hoveredNode);
        } else {
            this.hideTooltip();
        }
    }
    showTooltip(event, node) {
        const [mouseX, mouseY] = d3.pointer(event, document.body);

        this.tooltip
            .style("display", "block")
            .style("left", (mouseX + 10) + "px")
            .style("top", (mouseY - 10) + "px")
            .html(`
                        <strong>File:</strong> ${node.fullPath}<br>
                        <strong>Weight:</strong> ${node.incomingWeight}<br>
                        <strong>Total Connections:</strong> ${node.degree}<br>
                    `);
    }

    hideTooltip() {
        this.tooltip.style("display", "none");
    }
}