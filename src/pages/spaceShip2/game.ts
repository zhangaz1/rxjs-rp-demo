import * as r from 'ramda';
import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';
import { createWindowSizeStream } from './sources';

import {
	IConfig,
	IStar,
} from './interfaces';

import * as diagram from './diagram';
import { createStarsStream } from './star';

export function initGame(win: Window, config: IConfig) {

	const game = {
		start: function () {
			const canvas = diagram.createCanvas(win);

			const winSize$ = createWindowSizeStream(win);
			const config$: rx.Observable<IConfig> = winSize$.pipe(
				rxo.map(size => r.merge(config, size)),
			);

			const canvas$ = config$.pipe(
				rxo.map(config => {
					canvas.width = config.width;
					canvas.height = config.height;
					return canvas;
				})
			);

			const refresh$ = createRefreshStream(config);
			const stars$ = createStarsStream(refresh$, config);

			const game$ = rx.combineLatest(refresh$, config$, canvas$, stars$);

			// @ts-ignore
			game$.subscribe(refreshDiagram);

		},
	};

	return {
		start: game.start.bind(game),
	};
}

function createRefreshStream(config: IConfig) {
	return rx.interval(config.refreshFreq);
}

function refreshDiagram(cbr: [number, IConfig, HTMLCanvasElement, IStar[]]) {
	const [refresh, config, canvas, stars] = cbr;
	console.log('refresh:', stars);

	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	diagram.clearDiagram(ctx, config as IConfig);
}