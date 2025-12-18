// 雨点下坠
class RainEffect {
    constructor(ctx, layout) {
        this.ctx = ctx;
        this.layout = layout;
        this.gridCellSize = layout.cellSize;
        this.animationId = null;
        this.backgroundRenderer = null;
        this.config = {
            rainCount: 50,
            baseSpeed: 0.5,
            speedRange: 0.3,
            tailLength: 9,
            color: "rgba(74, 158, 255, {alpha})"
        };
        this.rainDrops = [];
    }

    // 生成单个雨点的数据
    #createRainDrop() {
        return {
            colIndex: Math.floor(Math.random() * this.layout.cols),
            y: -Math.floor(Math.random() * this.layout.rows) * this.gridCellSize,
            speed: this.config.baseSpeed + Math.random() * this.config.speedRange,
            size: this.gridCellSize
        };
    }

    // 初始化所有雨点
    #initDrops() {
        this.rainDrops = [];
        for (let i = 0; i < this.config.rainCount; i++) {
            this.rainDrops.push(this.#createRainDrop());
        }
    }

    // 更新单个雨点位置
    #updateDrop(drop) {
        drop.y += drop.speed * this.gridCellSize;
        if (drop.y > this.layout.canvasSize) {
            drop.colIndex = Math.floor(Math.random() * this.layout.cols);
            drop.y = -Math.floor(Math.random() * this.layout.rows) * this.gridCellSize;
        }
    }

    // 绘制单个雨点
    #drawDrop(drop) {
        const x = drop.colIndex * this.gridCellSize;
        const ctx = this.ctx;

        // 绘制渐变拖尾
        for (let i = 0; i < this.config.tailLength; i++) {
            const alpha = 1 - (i / this.config.tailLength);
            if (alpha < 0.05) break;
            const tailY = drop.y - (i * this.gridCellSize);
            const color = this.config.color.replace("{alpha}", alpha);
            ctx.fillStyle = color;
            ctx.fillRect(x + 0.5, tailY + 0.5, drop.size, drop.size);
        }

        // 绘制雨点主体
        ctx.fillStyle = this.config.color.replace("{alpha}", 1);
        ctx.fillRect(x + 0.5, drop.y + 0.5, drop.size, drop.size);
    }

    setBackgroundRenderer(renderer) {
        this.backgroundRenderer = renderer;
    }

    // 动画主循环
    #animate() {
        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx);
        }
        this.rainDrops.forEach(drop => {
            this.#updateDrop(drop);
            this.#drawDrop(drop);
        });
        this.animationId = requestAnimationFrame(() => this.#animate());
    }

    // 对外暴露：启动特效
    start() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.#initDrops();
        this.#animate();
    }

    // 对外暴露：停止特效
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx);
        }
    }

    renderFrame() {
        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx);
        }
        this.rainDrops.forEach(drop => {
            this.#updateDrop(drop);
            this.#drawDrop(drop);
        });
    }
}

// 方块扩散
class SquareEffect {
    constructor(ctx, layout, palette = []) {
        this.ctx = ctx;
        this.layout = layout;
        this.cellSize = layout.cellSize || (layout.canvasSize / layout.cols);
        this.animationId = null;
        this.backgroundRenderer = null;
        this.palette = Array.isArray(palette) ? palette.slice() : [];
        this.config = {
            duration: 500,
            initialSizeCells: 5
        };
        this.square = null;
        this.startTime = 0;
    }

    setBackgroundRenderer(renderer) {
        this.backgroundRenderer = renderer;
    }

    start() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.square = this.#createSquare();
        this.startTime = performance.now();
        this.#animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx);
        }
    }

    #createSquare() {
        const size = this.config.initialSizeCells * this.cellSize;
        const maxX = this.layout.canvasSize - size;
        const maxY = this.layout.canvasSize - size;
        const x = Math.floor(Math.random() * (maxX / this.cellSize)) * this.cellSize;
        const y = Math.floor(Math.random() * (maxY / this.cellSize)) * this.cellSize;
        const cx = x + size / 2;
        const cy = y + size / 2;
        const color = this.#pickColor();
        return { cx, cy, size, color };
    }

    #pickColor() {
        if (this.palette.length > 0) {
            const idx = Math.floor(Math.random() * this.palette.length);
            return this.#toRgb(this.palette[idx]);
        }
        return this.#randomBrightRgb();
    }

    #toRgb(color) {
        if (Array.isArray(color)) {
            return { r: color[0] | 0, g: color[1] | 0, b: color[2] | 0 };
        }
        if (typeof color === 'string' && /^#([0-9a-fA-F]{6})$/.test(color)) {
            const n = parseInt(color.slice(1), 16);
            return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
        }
        return this.#randomBrightRgb();
    }

    #randomBrightRgb() {
        const h = Math.random();
        const s = 0.7 + Math.random() * 0.3;
        const l = 0.5 + Math.random() * 0.2;
        const rgb = this.#hslToRgb(h, s, l);
        return rgb;
    }

    #hslToRgb(h, s, l) {
        const f = (n) => {
            const k = (n + h * 12) % 12;
            const a = s * Math.min(l, 1 - l);
            return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
        };
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    }

    #rgba(rgb, a) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    }

    #drawSquare(square, scale, alpha) {
        const size = square.size * scale;
        const x = square.cx - size / 2;
        const y = square.cy - size / 2;
        const sw = this.cellSize; // 边框宽度（单元格尺寸）
        const ctx = this.ctx;
        const color = this.#rgba(square.color, alpha);

        ctx.fillStyle = color;
        ctx.imageSmoothingEnabled = false;

        // 1. 绘制顶部边框（无重叠：从左到右，高度sw）
        ctx.fillRect(x, y, size, sw);
        // 2. 绘制底部边框（无重叠：从左到右，高度sw）
        ctx.fillRect(x, y + size - sw, size, sw);
        // 3. 绘制左侧边框（排除上下已绘制的部分，避免重叠）
        ctx.fillRect(x, y + sw, sw, size - 2 * sw);
        // 4. 绘制右侧边框（排除上下已绘制的部分，避免重叠）
        ctx.fillRect(x + size - sw, y + sw, sw, size - 2 * sw);
    }

    #animate() {
        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx);
        }
        const now = performance.now();
        const t = Math.min(1, (now - this.startTime) / this.config.duration);
        const scale = 1.5 + t;
        const alpha = 1 - t;
        this.#drawSquare(this.square, scale, alpha);
        if (t >= 1) {
            this.square = this.#createSquare();
            this.startTime = performance.now();
        }
        this.animationId = requestAnimationFrame(() => this.#animate());
    }
}
// 整体背景色渐变
class FadeEffect {
    constructor(ctx, layout) {
        this.ctx = ctx;
        this.layout = layout;
        this.animationId = null;
        this.backgroundRenderer = null;
        this.config = {
            duration: 4000, // 3秒一个周期
            colors: [
                { r: 255, g: 0,   b: 0   }, // 红
                { r: 255, g: 165, b: 0   }, // 橙
                { r: 255, g: 255, b: 0   }, // 黄
                { r: 0,   g: 255, b: 0   }, // 绿
                { r: 0,   g: 255, b: 255 }, // 青
                { r: 0,   g: 0,   b: 255 }, // 蓝
                { r: 128, g: 0,   b: 128 }  // 紫
            ]
        };
        this.startTime = 0;
    }

    setBackgroundRenderer(renderer) {
        this.backgroundRenderer = renderer;
    }

    start() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.startTime = performance.now();
        this.#animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx);
        }
    }

    #lerpColor(c1, c2, t) {
        return {
            r: Math.round(c1.r + (c2.r - c1.r) * t),
            g: Math.round(c1.g + (c2.g - c1.g) * t),
            b: Math.round(c1.b + (c2.b - c1.b) * t)
        };
    }

    #animate() {
        const now = performance.now();
        const elapsed = (now - this.startTime) % this.config.duration;
        const t = elapsed / this.config.duration; // 0~1
        const segment = 1 / (this.config.colors.length - 1);
        const index = Math.floor(t / segment);
        const localT = (t % segment) / segment;

        const c1 = this.config.colors[index];
        const c2 = this.config.colors[(index + 1) % this.config.colors.length];
        const color = this.#lerpColor(c1, c2, localT);
        const rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx, rgbColor);
        } else {
             // 填充整体背景色
            this.ctx.fillStyle = rgbColor;
            this.ctx.fillRect(0, 0, this.layout.canvasSize, this.layout.canvasSize);
        }

        this.animationId = requestAnimationFrame(() => this.#animate());
    }
}
// 滚动渐变背景
class ScrollFadeEffect {
    constructor(ctx, layout) {
        this.ctx = ctx; // 获取画布
        this.layout = layout;   // 传递网格渲染器
        this.animationId = null;    // 初始化动画ID
        this.backgroundRenderer = null;
        this.config = {
            speed: 1, // 每帧向上移动的像素数
            bandHeight: Math.floor(layout.canvasSize / 3), // 颜色带高度≈1/3画布边长
            colors: [
                { r: 255, g: 0,   b: 0   }, // 红
                { r: 255, g: 165, b: 0   }, // 橙
                { r: 255, g: 255, b: 0   }, // 黄
                { r: 0,   g: 255, b: 0   }, // 绿
                { r: 0,   g: 255, b: 255 }, // 青
                { r: 0,   g: 0,   b: 255 }, // 蓝
                { r: 128, g: 0,   b: 128 }  // 紫
            ]
        };
        this.offset = 0; // 当前垂直偏移
    }

    setBackgroundRenderer(renderer) {
        this.backgroundRenderer = renderer;
    }

    start() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.offset = 0;
        this.#animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx);
        }
    }

    #lerpColor(c1, c2, t) {
        return {
            r: Math.round(c1.r + (c2.r - c1.r) * t),
            g: Math.round(c1.g + (c2.g - c1.g) * t),
            b: Math.round(c1.b + (c2.b - c1.b) * t)
        };
    }

    #getColorAt(y) {
        const totalHeight = this.config.bandHeight;
        const segmentHeight = totalHeight / (this.config.colors.length - 1);
        const t = ((y % totalHeight) + totalHeight) % totalHeight / totalHeight; // 归一化到0~1
        const index = Math.floor(t * (this.config.colors.length - 1));
        const localT = (t * (this.config.colors.length - 1)) % 1;
        const c1 = this.config.colors[index];
        const c2 = this.config.colors[(index + 1) % this.config.colors.length];
        const color = this.#lerpColor(c1, c2, localT);
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    #animate() {
        const { canvasSize } = this.layout;
        const bandHeight = this.config.bandHeight;

        // 先画背景（若存在）
        if (this.backgroundRenderer) {
            this.backgroundRenderer.draw(this.ctx);
        }

        // 绘制循环滚动的彩色带
        for (let y = 0; y < canvasSize; y++) {
            const colorY = y + this.offset;
            this.ctx.fillStyle = this.#getColorAt(colorY);
            this.ctx.fillRect(0, y, canvasSize, 1);
        }

        // 更新偏移，实现向上滚动
        this.offset = (this.offset + this.config.speed - bandHeight) % bandHeight;

        this.animationId = requestAnimationFrame(() => this.#animate());
    }
}


export {
    RainEffect,
    SquareEffect,
    FadeEffect,
    ScrollFadeEffect
}
