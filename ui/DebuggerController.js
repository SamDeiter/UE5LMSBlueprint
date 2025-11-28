
export class DebuggerController {
    constructor(app) {
        this.app = app;
        this.panel = null;
        this.createPanel();
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'call-stack-panel';
        this.panel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 220px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #444;
            border-radius: 4px;
            padding: 10px;
            color: #fff;
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            display: none;
            z-index: 100;
            min-width: 200px;
        `;
        this.panel.innerHTML = '<div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #555; padding-bottom: 3px;">Call Stack</div><div id="call-stack-list"></div>';

        const editor = document.getElementById('graph-editor');
        if (editor) {
            editor.appendChild(this.panel);
        }
    }

    update() {
        const list = this.panel.querySelector('#call-stack-list');
        if (!list) return;

        list.innerHTML = '';

        const stack = this.app.sim.callStack;
        // Only show if we are paused or have a stack
        if (stack.length === 0 && !this.app.sim.isPaused) {
            this.panel.style.display = 'none';
            return;
        }

        this.panel.style.display = 'block';

        // 1. Current Frame (Active Graph)
        const currentFrame = document.createElement('div');
        currentFrame.textContent = `> ${this.app.activeGraph}`;
        currentFrame.style.color = '#4CAF50';
        currentFrame.style.fontWeight = 'bold';
        currentFrame.style.cursor = 'pointer';
        currentFrame.style.padding = '2px 0';
        currentFrame.addEventListener('click', () => {
            this.app.switchGraph(this.app.activeGraph);
        });
        list.appendChild(currentFrame);

        // 2. Stack Frames (Reverse Order)
        for (let i = stack.length - 1; i >= 0; i--) {
            const frame = stack[i];
            const el = document.createElement('div');
            el.textContent = frame.callerGraph;
            el.style.paddingLeft = '10px';
            el.style.color = '#aaa';
            el.style.cursor = 'pointer';
            el.style.padding = '2px 0 2px 10px';

            el.addEventListener('click', () => {
                // Switch to that graph
                this.app.switchGraph(frame.callerGraph);
                // Highlight the caller node
                const callerNode = this.app.graph.nodes.get(frame.callerNodeId);
                if (callerNode) {
                    this.app.graph.selectNode(callerNode.id);
                    // Optional: Pan to it
                    // this.app.graph.panToNode(callerNode);
                }
            });
            list.appendChild(el);
        }
    }
}
