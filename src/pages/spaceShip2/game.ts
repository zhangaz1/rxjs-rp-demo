import * as r from 'ramda';
import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	IConfig,
	IStar,
	ISpaceShip,
	IHeroShot,
	IEnemy,
} from './interfaces';

import {
	createWindowSizeStream,
	createDocumentKeydownStream,
} from './sources';

import * as diagram from './diagram';
import { createStarsStream } from './star';
import { createSpaceShipStream } from './spaceShip';
import { createEnemiesStream } from './enemy';
import { createHeroShotsStream } from './heroShots';

export function initGame(win: Window, config: IConfig) {

	const game = {
		start: function () {
			const canvas = diagram.createCanvas(win);

			const winSize$ = createWindowSizeStream(win);
			const config$: rx.Observable<IConfig> = winSize$.pipe(
				rxo.map(size => {
					return r.merge(config, size);
				}),
			);

			const canvas$ = config$.pipe(
				rxo.map(config => {
					canvas.width = config.width;
					canvas.height = config.height;
					return canvas;
				})
			);

			const refresh$ = rx.animationFrames(); // createRefreshStream(config$);
			const stars$ = createStarsStream(refresh$, config$);
			const spaceShip$ = createSpaceShipStream(canvas, config$);
			const documentKeydown$ = createDocumentKeydownStream(win);
			const heroShots$ = createHeroShotsStream(canvas, documentKeydown$, refresh$, config$, spaceShip$);
			const enemies$ = createEnemiesStream(refresh$, config$);

			const game$ = rx.combineLatest(config$, canvas$, stars$, spaceShip$, heroShots$, enemies$)
				.pipe(
					rxo.sample(refresh$),
				);

			// @ts-ignore
			game$.subscribe(refreshDiagram);

		},
	};

	return {
		start: game.start.bind(game),
	};
}

function createRefreshStream(config$: rx.Observable<IConfig>) {
	return config$.pipe(
		rxo.switchMap(config => rx.interval(config.refreshFreq))
	);
}

// let refreshCount: number = 0;
function refreshDiagram(cbr: [IConfig, HTMLCanvasElement, IStar[], ISpaceShip, IHeroShot[], IEnemy[]]) {
	// console.log('refresh count:', refreshCount++);

	const [config, canvas, stars, spaceShip, heroShots, enemies] = cbr;

	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	diagram.clearDiagram(ctx, config as IConfig);
	diagram.drawStars(ctx, config, stars);
	diagram.drawSpaceShip(ctx, config, spaceShip);
	diagram.drawHeroShots(ctx, config, heroShots);
	diagram.drawEnemies(ctx, config, enemies);
}