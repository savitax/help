import { RainEffect, SquareEffect, FadeEffect, ScrollFadeEffect } from './effect.js';
import GridRenderer from './grid.js';

// 网格基础配置
const gridConfig = {
    rows: 30,
    cols: 30,
    canvasSize: 300,
    color: "#4a9eff",
    bgColor: "#0a0e21",
};

const select = document.getElementById("select");
const canvas = document.getElementById("canvas");
const gridToggle = document.getElementById("gridToggle");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

function applyDpr() {
    canvas.width = gridConfig.canvasSize * dpr;
    canvas.height = gridConfig.canvasSize * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}

applyDpr();

const grid = new GridRenderer(gridConfig);
const rainEffect = new RainEffect(ctx, grid);
rainEffect.setBackgroundRenderer(grid);

const squareEffect = new SquareEffect(ctx, grid, ["#ff6b6b", "#ffd93d", "#6bcB77", "#4a9eff"]);
squareEffect.setBackgroundRenderer(grid);

const fadeEffect = new FadeEffect(ctx, grid);
fadeEffect.setBackgroundRenderer(grid);

const scrollFadeEffect = new ScrollFadeEffect(ctx, grid);
scrollFadeEffect.setBackgroundRenderer(grid);

let currentEffect = null;

gridToggle.addEventListener("click", () => {
    grid.toggle();
    gridToggle.textContent = grid.visible ? "隐藏网格" : "显示网格";
    if (!currentEffect || !currentEffect.animationId) {
        grid.draw(ctx);
    }
});

select.addEventListener("change", (e) => {
    switch (e.target.value) {
        case "none":
            if (currentEffect) currentEffect.stop();
            currentEffect = null;
            break;
        case "Falling Object":
            if (currentEffect) currentEffect.stop();
            currentEffect = rainEffect;
            rainEffect.start();
            break;
        case "Expanding Object":
            if (currentEffect) currentEffect.stop();
            currentEffect = squareEffect;
            squareEffect.start();
            break;
        case "Fade":
            if (currentEffect) currentEffect.stop();
            currentEffect = fadeEffect;
            fadeEffect.start();
            break;
        case "Scrolling Fade":
            if (currentEffect) currentEffect.stop();
            currentEffect = scrollFadeEffect;
            scrollFadeEffect.start();
            break;
    }
});

window.addEventListener('load', () => {
    grid.draw(ctx);
});

window.addEventListener('resize', () => {
    applyDpr();
    if (currentEffect && currentEffect.animationId) {
        currentEffect.stop();
        currentEffect.start();
    } else {
        grid.draw(ctx);
    }
});
