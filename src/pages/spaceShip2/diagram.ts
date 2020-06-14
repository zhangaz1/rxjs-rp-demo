import * as r from 'ramda';

import {
	Direction,
	IConfig,
	IStar,
	ISpaceShip,
} from "./interfaces";

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

export function drawSpaceShip(ctx: CanvasRenderingContext2D, config: IConfig, spaceShip: ISpaceShip) {
	drawTriangle(ctx, spaceShip.x, spaceShip.y, config.spaceshipWidth, config.spaceShipColor, config.spaceShipDirection);
}

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, color: string, direction: string) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(x - width, y);
	ctx.lineTo(x, direction === Direction.Up ? y - width : y + width);
	ctx.lineTo(x + width, y);
	ctx.lineTo(x - width, y);
	ctx.fill();
}