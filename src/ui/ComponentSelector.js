/**
 * Component Selector Modal
 * Displays a searchable list of components organized by category
 */

export const COMPONENT_DEFINITIONS = {
    'Common': [
        { name: 'New Blueprint Script Component...', type: 'BlueprintScriptComponent', icon: 'fa-file-code' },
        { name: 'New C++ Component...', type: 'CppComponent', icon: 'fa-code' }
    ],
    'Audio': [
        { name: 'Audio', type: 'AudioComponent', icon: 'fa-volume-up' },
        { name: 'Niagara Particle System Component', type: 'NiagaraComponent', icon: 'fa-magic' }
    ],
    'Rendering': [
        { name: 'Point Light', type: 'PointLightComponent', icon: 'fa-lightbulb' },
        { name: 'Spot Light', type: 'SpotLightComponent', icon: 'fa-lightbulb' },
        { name: 'Directional Light', type: 'DirectionalLightComponent', icon: 'fa-sun' },
        { name: 'Scene', type: 'SceneComponent', icon: 'fa-layer-group' },
        { name: 'Skeletal Mesh', type: 'SkeletalMeshComponent', icon: 'fa-bone' },
        { name: 'Static Mesh', type: 'StaticMeshComponent', icon: 'fa-cube' },
        { name: 'Sphere', type: 'SphereComponent', icon: 'fa-circle' },
        { name: 'Cube', type: 'CubeComponent', icon: 'fa-cube' },
        { name: 'Plane', type: 'PlaneComponent', icon: 'fa-square' }
    ],
    'AI': [
        { name: 'AIPerception', type: 'AIPerceptionComponent', icon: 'fa-eye' },
        { name: 'AIPerception Stimuli Source', type: 'AIPerceptionStimuliSourceComponent', icon: 'fa-broadcast-tower' },
        { name: 'Behavior Tree', type: 'BehaviorTreeComponent', icon: 'fa-sitemap' },
        { name: 'Blackboard', type: 'BlackboardComponent', icon: 'fa-database' },
        { name: 'Pawn Noise Emitter', type: 'PawnNoiseEmitterComponent', icon: 'fa-volume-up' },
        { name: 'Pawn Sensing', type: 'PawnSensingComponent', icon: 'fa-radar' },
        { name: 'State Tree AI', type: 'StateTreeAIComponent', icon: 'fa-project-diagram' },
        { name: 'State Tree', type: 'StateTreeComponent', icon: 'fa-stream' }
    ],
    'Physics': [
        { name: 'Box Collision', type: 'BoxComponent', icon: 'fa-vector-square' },
        { name: 'Capsule Collision', type: 'CapsuleComponent', icon: 'fa-capsules' },
        { name: 'Sphere Collision', type: 'SphereCollisionComponent', icon: 'fa-circle' }
    ],
    'Camera': [
        { name: 'Camera', type: 'CameraComponent', icon: 'fa-video' },
        { name: 'Spring Arm', type: 'SpringArmComponent', icon: 'fa-arrows-alt' }
    ],
    'Effects': [
        { name: 'Particle System', type: 'ParticleSystemComponent', icon: 'fa-snowflake' },
        { name: 'Decal', type: 'DecalComponent', icon: 'fa-stamp' }
    ]
};

export class ComponentSelector {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.searchInput = null;
        this.componentsContainer = null;
        this.onSelectCallback = null;
        this.createModal();
    }

    createModal() {
        // Create modal overlay
        this.modal = document.createElement('div');
        this.modal.className = 'component-selector-modal';
        this.modal.classList.add('hidden');

        this.modal.innerHTML = `
            <div class="component-selector-content">
                <div class="component-selector-title-bar">
                    <i class="fas fa-cube component-selector-header-icon"></i>
                    <span>Components</span>
                    <button class="component-selector-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="component-selector-toolbar">
                    <div class="search-box flex-1">
                        <i class="fas fa-search"></i>
                        <input type="text" class="component-search-input" placeholder="Search Components">
                    </div>
                    <button class="component-selector-settings">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
                <div class="component-selector-body">
                    <!-- Components will be rendered here -->
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        this.searchInput = this.modal.querySelector('.component-search-input');
        this.componentsContainer = this.modal.querySelector('.component-selector-body');
        const closeBtn = this.modal.querySelector('.component-selector-close');

        // Events
        this.searchInput.addEventListener('input', () => this.filterComponents());
        closeBtn.addEventListener('click', () => this.hide());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        this.renderComponents();
    }

    renderComponents(filter = '') {
        this.componentsContainer.innerHTML = '';

        const filterLower = filter.toLowerCase();

        const categoryIcons = {
            'Common': 'fa-file',
            'Audio': 'fa-volume-up',
            'Rendering': 'fa-lightbulb',
            'AI': 'fa-brain',
            'Physics': 'fa-cube',
            'Camera': 'fa-video',
            'Effects': 'fa-magic'
        };

        Object.entries(COMPONENT_DEFINITIONS).forEach(([category, components]) => {
            // Filter components
            const filteredComponents = components.filter(comp =>
                comp.name.toLowerCase().includes(filterLower)
            );

            if (filteredComponents.length === 0) return;

            // Category header (collapsible)
            const categorySection = document.createElement('div');
            categorySection.className = 'component-category-section';

            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'component-category-header-collapsible';

            const arrow = document.createElement('i');
            arrow.className = 'fas fa-caret-down';
            arrow.className = 'fas fa-caret-down component-selector-arrow';

            const icon = document.createElement('i');
            icon.className = `fas ${categoryIcons[category] || 'fa-folder'}`;
            icon.classList.add('component-selector-header-icon');

            const label = document.createElement('span');
            label.textContent = category;

            categoryHeader.appendChild(arrow);
            categoryHeader.appendChild(icon);
            categoryHeader.appendChild(label);

            // Content container
            const contentContainer = document.createElement('div');
            contentContainer.className = 'component-category-content';
            contentContainer.classList.remove('hidden'); // Start expanded

            // Toggle collapse
            let isExpanded = true;
            categoryHeader.addEventListener('click', () => {
                isExpanded = !isExpanded;
                if (isExpanded) contentContainer.classList.remove('hidden'); else contentContainer.classList.add('hidden');
                arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
            });

            // Component items
            filteredComponents.forEach(comp => {
                const item = document.createElement('div');
                item.className = 'component-selector-item';
                item.classList.add('pl-4'); // Indent

                const compIcon = document.createElement('i');
                compIcon.className = `fas ${comp.icon}`;
                compIcon.className = `fas ${comp.icon} component-selector-item-icon`;

                const compName = document.createElement('span');
                compName.textContent = comp.name;

                item.appendChild(compIcon);
                item.appendChild(compName);

                item.addEventListener('click', () => {
                    this.selectComponent(comp);
                });

                contentContainer.appendChild(item);
            });

            categorySection.appendChild(categoryHeader);
            categorySection.appendChild(contentContainer);
            this.componentsContainer.appendChild(categorySection);
        });
    }

    filterComponents() {
        const filter = this.searchInput.value;
        this.renderComponents(filter);
    }

    selectComponent(componentDef) {
        if (this.onSelectCallback) {
            this.onSelectCallback(componentDef);
        }
        this.hide();
    }

    show(onSelect, triggerButton) {
        this.onSelectCallback = onSelect;
        this.modal.classList.remove('hidden');
        this.searchInput.value = '';
        this.renderComponents();

        // Position the modal
        const content = this.modal.querySelector('.component-selector-content');

        if (triggerButton) {
            // Position below the button, aligned to its left edge
            const rect = triggerButton.getBoundingClientRect();
            content.style.position = 'absolute';
            content.style.left = `${rect.left}px`;
            content.style.top = `${rect.bottom + 4}px`;
            content.style.transform = 'none';
        } else {
            // Center on screen
            content.style.position = 'fixed';
            content.style.left = '50%';
            content.style.top = '50%';
            content.style.transform = 'translate(-50%, -50%)';
        }

        // Focus search input
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);
    }

    hide() {
        this.modal.classList.add('hidden');
        this.onSelectCallback = null;
    }
}
