/**
 * Draws the background grid on the canvas.
 */
export class GridController {
    constructor(canvas, app) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.app = app;
        // Redraw grid if the window is resized
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(canvas.parentElement);
        this.resize();
    }

    /** Resizes the canvas to fill its parent container. */
    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    }

    /** Draws the background grid, respecting pan and zoom. */
    draw() {
        // CRITICAL FIX: Ensure app.graph and app.graph.pan exist before destructuring
        if (!this.app.graph || !this.app.graph.pan) {
            // Draw a simple background if initialization is incomplete
            this.ctx.fillStyle = '#222222';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        const { pan, zoom } = this.app.graph;
        const { width, height } = this.canvas;

        this.ctx.fillStyle = '#151515'; // Authentic UE5 Dark Background
        this.ctx.fillRect(0, 0, width, height);

        const gridSizeSmall = 16 * zoom; // UE5 uses 16/128 typically
        const gridSizeLarge = 128 * zoom;

        // Calculate offsets for pan
        const transX = pan.x % gridSizeSmall;
        const transY = pan.y % gridSizeSmall;
        const transXLarge = pan.x % gridSizeLarge;
        const transYLarge = pan.y % gridSizeLarge;

        // Draw small grid lines
        this.ctx.strokeStyle = '#262626'; // Subtle minor lines
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let x = transX; x < width; x += gridSizeSmall) {
            this.ctx.moveTo(x, 0); this.ctx.lineTo(x, height);
        }
        for (let y = transY; y < height; y += gridSizeSmall) {
            this.ctx.moveTo(0, y); this.ctx.lineTo(width, y);
        }
        this.ctx.stroke();

        // Draw large grid lines
        this.ctx.strokeStyle = '#353535'; // Visible major lines
        this.ctx.lineWidth = 1; // Keep thin but distinct color
        this.ctx.beginPath();
        for (let x = transXLarge; x < width; x += gridSizeLarge) {
            this.ctx.moveTo(x, 0); this.ctx.lineTo(x, height);
        }
        for (let y = transYLarge; y < height; y += gridSizeLarge) {
            this.ctx.moveTo(0, y); this.ctx.lineTo(width, y);
        }
        this.ctx.stroke();
    }
}
