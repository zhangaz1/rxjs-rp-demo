import * as rx from 'rxjs';

import {
	IConfig,
	IStar,
} from './interfaces';

import * as diagram from './diagram';
import { createStarsStream } from './star';

export function initGame(win: Window, config: IConfig) {
	const canvas = diagram.createCanvas(win, config);
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

	const game = {
		clear: function () {
			diagram.clearDiagram(ctx, canvas, config);
		},
		start: function () {
			this.clear();

			const refresh$ = createRefreshStream(config);
			const stars$ = createStarsStream(refresh$, config);

			const game$ = createGameStream(stars$);
		},
	};

	return {
		start: game.start.bind(game),
	};
}

function createRefreshStream(config: IConfig) {
	return rx.interval(config.refreshFreq);
}

function createGameStream(star$: rx.Observable<IStar[]>) {

}