export default class GridRenderer {
    constructor(config) {
        this.canvasSize = config.canvasSize;
        this.rows = config.rows;
        this.cols = config.cols;
        this.bgColor = config.bgColor;
        this.color = config.color;
        this.visible = true;
        this.cellSize = this.canvasSize / this.cols;
    }

    toggle() {
        this.visible = !this.visible;
    }

    setVisible(visible) {
        this.visible = !!visible;
    }

    draw(ctx, bgColor = this.bgColor) {
        if (bgColor !== null) {
            ctx.clearRect(0, 0, this.canvasSize * window.devicePixelRatio, this.canvasSize * window.devicePixelRatio);
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        }

        if (!this.visible) return;

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.imageSmoothingEnabled = false;

        for (let i = 0; i <= this.canvasSize; i += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(i + 0.5, 0);
            ctx.lineTo(i + 0.5, this.canvasSize);
            ctx.stroke();
        }

        for (let i = 0; i <= this.canvasSize; i += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, i + 0.5);
            ctx.lineTo(this.canvasSize, i + 0.5);
            ctx.stroke();
        }
    }
}
