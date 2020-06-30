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

import { createBackgroundStream, drawBackground } from './background';
import { createStarsStream, drawStars } from './star';
import { createSpaceShipStream, drawSpaceShip } from './spaceShip';
import { createEnemiesStream, drawEnemies } from './enemy';
import { createHeroShotsStream, drawHeroShots } from './heroShots';

export function initGame(win: Window, config: IConfig) {

	const game = {
		start: function () {
			const canvas = diagram.createCanvas(win);

			const gameStop$$ = new rx.Subject();

			const refresh$ = rx.interval(config.refreshFreq)
				.pipe(
					rxo.takeUntil(gameStop$$),
					rxo.timeInterval(),
					rxo.map(({ interval }) => interval),
					rxo.share(),
				);

			const winSize$ = createWindowSizeStream(refresh$, gameStop$$, win);
			autoUnsubscribe({
				source$: winSize$, next: size => {
					canvas.width = size.width;
					canvas.height = size.height;
				}
			});

			const config$$ = new rx.BehaviorSubject(config);
			winSize$.pipe(
				rxo.map(size => {
					return r.mergeRight(config, size);
				}),
			).subscribe(config$$);


			const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

			drawBackground(
				createBackgroundStream(refresh$),
				config$$,
				r.partial(diagram.clearDiagram, [ctx])
			);

			drawStars(
				createStarsStream(refresh$, config$$),
				star => {
					ctx.fillStyle = config.starColor;
					diagram.drawStar(ctx, star);
				}
			);

			const spaceShip$ = createSpaceShipStream(canvas, refresh$, config$$);
			drawSpaceShip(spaceShip$, config$$, r.partial(diagram.drawSpaceShip, [ctx]));

			const enemies$ = createEnemiesStream(refresh$, gameStop$$, config$$);
			drawEnemies(enemies$, r.partial(diagram.drawEnemy, [ctx]));

			const documentKeydown$ = createDocumentKeydownStream(win);
			const heroShots$ = createHeroShotsStream(
				canvas,
				documentKeydown$ as rx.Observable<KeyboardEvent>,
				refresh$,
				config$$,
				gameStop$$,
				spaceShip$,
			);
			drawHeroShots(heroShots$, r.partial(diagram.drawHeroShot, [ctx]));

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