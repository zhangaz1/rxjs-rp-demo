import * as r from 'ramda';

import {
	Direction,
	IConfig,
	IStar,
	ISpaceShip,
	IHeroShot,
	IEnemy,
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
};

export function drawStars(ctx: CanvasRenderingContext2D, config: IConfig, stars: IStar[]) {
	ctx.fillStyle = config.starColor;
	r.forEach(r.curry(drawStar)(ctx))(stars);
};

export function drawStar(ctx: CanvasRenderingContext2D, star: IStar) {
	ctx.fillRect(star.x, star.y, star.width, star.height);
}

export function drawSpaceShip(ctx: CanvasRenderingContext2D, config: IConfig, spaceShip: ISpaceShip) {
	drawTriangle(ctx, spaceShip.x, spaceShip.y, config.spaceshipWidth, config.spaceShipColor, config.spaceShipDirection);
};

export function drawHeroShot(ctx: CanvasRenderingContext2D, config: IConfig, heroShot: IHeroShot) {
	drawTriangle(ctx, heroShot.x, heroShot.y, config.heroShotWidth, config.heroShotColor, config.heroShotDirection);
};

export function drawEnemy(ctx: CanvasRenderingContext2D, config: IConfig, enemy: IEnemy) {
	drawTriangle(ctx, enemy.x, enemy.y, config.enemyWidth, (enemy.isDead ? '#f00' : config.enemyColor), config.enemyDirection);
};

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, color: string, direction: string) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(x - width, y);
	ctx.lineTo(x, direction === Direction.Up ? y - width : y + width);
	ctx.lineTo(x + width, y);
	ctx.lineTo(x - width, y);
	ctx.fill();
}