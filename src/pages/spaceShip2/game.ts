import {
	IConfig,
} from './interfaces';

import * as diagram from './diagram';

export function initGame(win: Window, config: IConfig) {
	const canvas = diagram.createCanvas(win, config);
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	const game = {
		clear: diagram.clearDiagram
	};

	game.clear(ctx, canvas, config);

	return {
		start() {
			console.log('init game!');
		},
	};
}