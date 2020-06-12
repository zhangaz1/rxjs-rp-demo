import { IConfig } from "./interfaces";

export function createCanvas(win: Window) {
	const doc = win.document;
	const canvas = doc.createElement('canvas');

	doc.body.appendChild(canvas);
	return canvas;
};

export function clearDiagram(ctx: CanvasRenderingContext2D, config: IConfig) {
	ctx.fillStyle = config.playgroundBackground;
	ctx.fillRect(0, 0, config.width, config.height);
}