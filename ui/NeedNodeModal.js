/**
 * NeedNodeModal - UI for creating and editing NeedNode assessment criteria
 */
export class NeedNodeModal {
    constructor(app) {
        this.app = app;
        this.currentNode = null;
        this.createModal();
    }

    /**
     * Create the modal HTML structure
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'need-node-modal';
        modal.className = 'modal';
        modal.style.display = 'none';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Configure Need Node</h2>
                    <button class="modal-close" id="need-node-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="need-title">Title</label>
                        <input type="text" id="need-title" placeholder="e.g., Connect Light Component" />
                    </div>
                    
                    <div class="form-group">
                        <label for="need-description">Description</label>
                        <textarea id="need-description" rows="3" placeholder="Detailed explanation of what students need to accomplish..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="need-hidden" />
                            Hidden from students (assessment mode)
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label for="need-threshold">Pass Threshold: <span id="threshold-value">80</span>%</label>
                        <input type="range" id="need-threshold" min="0" max="100" value="80" step="5" />
                    </div>
                    
                    <div class="form-group">
                        <label>Criteria</label>
                        <div id="criteria-list"></div>
                        <button type="button" id="add-criterion" class="btn-secondary">+ Add Criterion</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="need-node-cancel" class="btn-secondary">Cancel</button>
                    <button id="need-node-save" class="btn-primary">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
        this.bindEvents();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close buttons
        document.getElementById('need-node-close').addEventListener('click', () => this.close());
        document.getElementById('need-node-cancel').addEventListener('click', () => this.close());

        // Save button
        document.getElementById('need-node-save').addEventListener('click', () => this.save());

        // Threshold slider
        const thresholdSlider = document.getElementById('need-threshold');
        const thresholdValue = document.getElementById('threshold-value');
        thresholdSlider.addEventListener('input', (e) => {
            thresholdValue.textContent = e.target.value;
        });

        // Add criterion button
        document.getElementById('add-criterion').addEventListener('click', () => this.addCriterion());

        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
    }

    /**
     * Open modal for a specific node
     * @param {Object} nodeData - The node data to edit (or null for new)
     */
    open(nodeData = null) {
        this.currentNode = nodeData;

        // Populate fields
        if (nodeData && (nodeData.customData?.needNodeData || nodeData.needNodeData)) {
            // Handle both new location (customData) and legacy/temp location
            const data = nodeData.customData?.needNodeData || nodeData.needNodeData;
            document.getElementById('need-title').value = data.title || '';
            document.getElementById('need-description').value = data.description || '';
            document.getElementById('need-hidden').checked = data.hidden || false;
            document.getElementById('need-threshold').value = data.passThreshold || 80;
            document.getElementById('threshold-value').textContent = data.passThreshold || 80;

            // Load criteria
            const criteriaList = document.getElementById('criteria-list');
            criteriaList.innerHTML = '';
            (data.criteria || []).forEach(criterion => {
                this.addCriterion(criterion);
            });
        } else {
            // Reset for new node
            document.getElementById('need-title').value = 'New Need';
            document.getElementById('need-description').value = '';
            document.getElementById('need-hidden').checked = false;
            document.getElementById('need-threshold').value = 80;
            document.getElementById('threshold-value').textContent = '80';
            document.getElementById('criteria-list').innerHTML = '';
            this.addCriterion(); // Start with one empty criterion
        }

        this.modal.style.display = 'flex';
    }

    /**
     * Add a criterion input row
     * @param {Object} criterion - Existing criterion data (optional)
     */
    addCriterion(criterion = null) {
        const criteriaList = document.getElementById('criteria-list');
        // Removed unused criterionId

        const row = document.createElement('div');
        row.className = 'criterion-row';
        row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';

        row.innerHTML = `
            <input 
                type="text" 
                class="criterion-input" 
                placeholder="e.g., Light component is connected to BeginPlay"
                value="${criterion ? criterion.description : ''}"
                style="flex: 1;"
            />
            <button type="button" class="btn-icon criterion-delete" title="Delete criterion">🗑️</button>
        `;

        // Delete button
        row.querySelector('.criterion-delete').addEventListener('click', () => {
            row.remove();
        });

        criteriaList.appendChild(row);
    }

    /**
     * Save the NeedNode configuration
     */
    save() {
        const title = document.getElementById('need-title').value.trim();
        const description = document.getElementById('need-description').value.trim();
        const hidden = document.getElementById('need-hidden').checked;
        const passThreshold = parseInt(document.getElementById('need-threshold').value);

        // Collect criteria
        const criteriaInputs = document.querySelectorAll('.criterion-input');
        const criteria = Array.from(criteriaInputs)
            .map((input, index) => ({
                id: `criterion-${index}`,
                description: input.value.trim(),
                passed: false
            }))
            .filter(c => c.description.length > 0);

        if (!title) {
            window.alert('Please enter a title for the Need Node');
            return;
        }

        if (criteria.length === 0) {
            window.alert('Please add at least one criterion');
            return;
        }

        const needNodeData = {
            title,
            description,
            hidden,
            passThreshold,
            criteria
        };

        // If editing existing node, update it
        if (this.currentNode) {
            if (!this.currentNode.customData) this.currentNode.customData = {};
            this.currentNode.customData.needNodeData = needNodeData;

            const nodeEl = document.getElementById(this.currentNode.id);
            if (nodeEl) {
                const titleEl = nodeEl.querySelector('.node-title');
                if (titleEl) titleEl.textContent = title;
            }
            this.app.persistence.autoSave();
        } else {
            // Create new node at the pending location
            if (this._pendingLocation) {
                const node = this.app.graph.addNode('NeedNode', this._pendingLocation.x, this._pendingLocation.y);
                if (node) {
                    if (!node.customData) node.customData = {};
                    node.customData.needNodeData = needNodeData;

                    // Update the node title in the DOM
                    const nodeEl = document.getElementById(node.id);
                    if (nodeEl) {
                        const titleEl = nodeEl.querySelector('.node-title');
                        if (titleEl) titleEl.textContent = title;
                    }
                } else {
                    console.error('Failed to create NeedNode - addNode returned null');
                }
                this._pendingLocation = null;
                this.app.persistence.autoSave();
            } else {
                console.error('Cannot create NeedNode: _pendingLocation is not set!');
            }
        }

        this.close();
    }

    /**
     * Close the modal
     */
    close() {
        this.modal.style.display = 'none';
        this.currentNode = null;
    }
}
