import {
	IConfig,
} from './interfaces';

import * as diagram from './diagram';

export function initGame(win: Window, config: IConfig) {
	const canvas = diagram.createCanvas(win, config);
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

	const game = {
		clear: function () {
			diagram.clearDiagram(ctx, canvas, config);
		},
		start: function () {
			this.clear();
		},
	};

	return {
		start: game.start.bind(game),
	};
}