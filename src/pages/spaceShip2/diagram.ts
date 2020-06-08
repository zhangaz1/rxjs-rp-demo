import { IConfig } from "./interfaces";

export function createCanvas(win: Window, config: IConfig) {
	const doc = win.document;
	const canvas = doc.createElement('canvas');
	canvas.width = win.innerWidth;
	canvas.height = win.innerHeight;

	doc.body.appendChild(canvas);
	return canvas;
};

export function clearDiagram(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, config: IConfig) {
	ctx.fillStyle = config.playgroundBackground;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}