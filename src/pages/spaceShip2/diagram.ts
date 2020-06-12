import * as r from 'ramda';

import { IConfig, IStar } from "./interfaces";

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

export function drawStars(ctx: CanvasRenderingContext2D, config: IConfig, stars: IStar[]) {
	ctx.fillStyle = config.starColor;
	r.forEach(r.curry(drawStar)(ctx))(stars);
}

function drawStar(ctx: CanvasRenderingContext2D, star: IStar) {
	ctx.fillRect(star.x, star.y, star.width, star.height);
}