import * as r from 'ramda';
import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	ITimestampData,
	IConfig,
	IPoint,
	IStar,
	ISpaceShip,
	IHeroShot,
	IEnemy,
	IGameContext,
} from './interfaces';

import {
	collision,
	autoUnsubscribe,
	toObject,
	toStoppable,
	withTimestamp,
	withLatest,
} from './utils';

import {
	createWindowSizeStream,
	createDocumentKeydownStream,
} from './sources';

import * as diagram from './diagram';
import { createStarsStream, drawStars } from './star';
import { createSpaceShipStream } from './spaceShip';
import { createEnemiesStream } from './enemy';
import { createHeroShotsStream } from './heroShots';

export function initGame(win: Window, config: IConfig) {

	const game = {
		start: function () {
			const canvas = diagram.createCanvas(win);


			const rootSource$ = r.compose(
				toStoppable,
				toObject
			)
				(rx.interval(config.refreshFreq))
				.pipe(rxo.share());

			const winSize$ = createWindowSizeStream(rootSource$, win);
			autoUnsubscribe({
				source$: winSize$, next: size => {
					canvas.width = size.width;
					canvas.height = size.height;
				}
			});

			const config$: rx.Observable<IConfig> = winSize$.pipe(
				rxo.map(size => {
					return r.merge(config, size);
				}),
				rxo.sample(rootSource$),
			);

			const refresh$ = r.compose(
				r.partialRight(withLatest, [{ config: config$ }]),
				withTimestamp
			)(rootSource$)
				.pipe(
					rxo.share(),
				);

			const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

			autoUnsubscribe({ source$: refresh$, next: ({ config }: { config: IConfig }) => diagram.clearDiagram(ctx, config) });

			drawStars(createStarsStream(refresh$, config$), star => {
				ctx.fillStyle = config.starColor;
				diagram.drawStar(ctx, star);
			});


			// const game$ = refresh$;

			// autoUnsubscribe({ source$: game$ })

			// const refresh$ = createRefreshStream(config$);
			// const stars$ = createStarsStream(refresh$, config$);
			// const spaceShip$ = createSpaceShipStream(canvas, refresh$, config$);
			// const enemies$ = createEnemiesStream(refresh$, config$);

			// const documentKeydown$ = createDocumentKeydownStream(win);
			// const heroShots$ = createHeroShotsStream(
			// 	canvas,
			// 	documentKeydown$ as rx.Observable<KeyboardEvent>,
			// 	refresh$,
			// 	config$,
			// 	spaceShip$,
			// );

			// const collision$ = config$.pipe(
			// 	rxo.map(config => r.partial(collision, [config.collisionDistance])),
			// );

			// const game$ = animation$.pipe(
			// 	rxo.withLatestFrom(config$),
			// 	rxo.map(([n, config]) => config as IConfig),
			// );
			// const gameSubscription = game$.subscribe((config) => {
			// 	const canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;
			// 	diagram.clearDiagram(canvasContext, config);
			// });

		},
	};

	return {
		start: game.start.bind(game),
	};
}

function createRefreshStream(config$: rx.Observable<IConfig>) {
	return config$.pipe(
		rxo.map(config => rx.interval(config.refreshFreq)),
		rxo.switchAll(),
		rxo.map(n => Date.now()),
		rxo.share(),
	) as rx.Observable<number>;
}




function processCollision(game: IGameContext, collision: Function) {
	r.forEach((shot: IHeroShot) => {
		if (shot.y < 0) {
			return;
		}
		const enemy: IEnemy | undefined = r.find((enemy: IEnemy) => {
			return !enemy.isDead
				&& collision(shot as IPoint, enemy as IPoint);
		})(game.enemies);

		if (enemy) {
			shot.y = -10;
			enemy.isDead = true;
		}
	})(game.heroShots);
}