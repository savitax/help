class PacManEffect {
    constructor(ctx, grid) {
        this.ctx = ctx;                     // 画布上下文
        this.grid = grid;                   // GridRenderer类的实例化对象
        this.animationId = null;            // 动画ID，用于取消动画
        this.backgroundRenderer = null;     // 背景渲染器
        this.config = {
            color: "#0000FE",    // 颜色
            radius: 12,            // 半径
            // speed: 1,              // 速度
            // currentX: -12,           // 当前X坐标
            duration: 2000, // 2秒完成单程
        };
        this.startTime = 0;
    }
    // 后续在javascript里面通过xxxEffect.setBackgroundRenderer(grid);将GridRenderer类的实例化对象传递给this.backgroundRenderer
    setBackgroundRenderer(renderer) {
        this.backgroundRenderer = renderer;
    }
    // 动画启动器
    start() {
        // 如果当前存在已启动的动画，则取消
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.startTime = performance.now();
        // 然后开始自己的动画
        this.#animate();
    }

    // 动画停止器
    stop() {
        // 存在正在运行的动画就停止
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;    // 清除动画ID
        }
        // 存在背景渲染器就绘制背景
        if (this.backgroundRenderer) {
            // 调用GridRenderer类的实例化对象包含的绘制器绘制网格
            this.backgroundRenderer.draw(this.ctx);
        }
    }
    #animate() {
        const { canvasSize, radius, duration } = this.config;
        const now = performance.now();      // 当前时间
        const elapsed = (now - this.startTime) % duration;
        const progress = elapsed / duration;
        const x = -radius + (canvasSize + radius * 2) * progress;
        // const x = (currentX + speed) % (canvasSize + radius * 2);
        // this.config.currentX = x;
        const y = this.grid.canvasSize / 2;
        // 清空画布
        this.ctx.clearRect(0, 0, canvasSize * window.devicePixelRatio, canvasSize * window.devicePixelRatio);
        // 绘制 PacMan 
        this.#drawPacMan(x, y);
        // 绘制背景/网格
        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx, null);
        }

        this.animationId = requestAnimationFrame(() => this.#animate());
    }
    #drawPacMan(x, y) {
        const { radius, color } = this.config;
        const { rows, cols, cellSize } = this.grid;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // 如果(x-c)^2+(y-r)^2小于半径的平方，就绘制一个矩形
                if ((x - c) ** 2 + (y - r) ** 2 <= radius ** 2) {
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                }
            }
        }
    }
}