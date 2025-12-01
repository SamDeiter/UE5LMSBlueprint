import { createCollapsibleHeader } from './ui-helpers.js';

export class GraphsController {
    constructor(app) {
        this.app = app;
        this.listContainer = document.getElementById('graphs-list');
        this.render();
    }

    render() {
        if (!this.listContainer) return;

        this.listContainer.innerHTML = '';

        const section = document.createElement('div');
        section.className = 'sidebar-section';

        const content = document.createElement('div');
        content.style.display = 'block';

        // Header
        createCollapsibleHeader(section, 'Graphs', content, {
            isExpanded: true,
            iconClass: 'fas fa-caret-down'
        });

        // EventGraph Item
        this.createGraphItem(content, 'EventGraph', 'Event Graph', 'fa-project-diagram');

        // ConstructionScript Item
        this.createGraphItem(content, 'ConstructionScript', 'Construction Script', 'fa-tools');

        section.appendChild(content);
        this.listContainer.appendChild(section);
    }

    createGraphItem(container, graphId, labelText, iconClass) {
        const item = document.createElement('div');
        item.className = 'tree-item';
        item.dataset.graphId = graphId;

        const icon = document.createElement('i');
        icon.className = `fas ${iconClass}`;
        icon.style.marginRight = '6px';
        icon.style.color = '#ccc';
        icon.style.fontSize = '10px';

        const label = document.createElement('span');
        label.className = 'tree-item-label';
        label.textContent = labelText;

        item.appendChild(icon);
        item.appendChild(label);

        // Click to switch
        item.addEventListener('click', (e) => {
            console.log(`Switching to graph: ${graphId}`);
            this.app.switchGraph(graphId);

            // Update selection visually
            document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');

            e.stopPropagation();
        });

        container.appendChild(item);
    }
}
