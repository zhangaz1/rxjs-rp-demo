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

import { collision } from './utils';

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
			winSize$.subscribe(size => {
				canvas.width = size.width;
				canvas.height = size.height;
			});
			const config$: rx.Observable<IConfig> = winSize$.pipe(
				rxo.map(size => {
					return r.merge(config, size);
				}),
			);


			const refresh$ = createRefreshStream(config$);
			const stars$ = createStarsStream(refresh$, config$);
			const spaceShip$ = createSpaceShipStream(canvas, refresh$, config$);
			const enemies$ = createEnemiesStream(refresh$, config$);

			const documentKeydown$ = createDocumentKeydownStream(win);
			const heroShots$ = createHeroShotsStream(
				canvas,
				documentKeydown$ as rx.Observable<KeyboardEvent>,
				refresh$,
				config$,
				spaceShip$,
			);

			const animation$ = rx.animationFrames();
			const collision$ = config$.pipe(
				rxo.map(config => r.partial(collision, [config.collisionDistance])),
			);
			const game$ = rx.combineLatest(refresh$, stars$, spaceShip$, heroShots$, enemies$)
				.pipe(
					rxo.map((cbr: any) => {
						const [refresh, stars, spaceShip, heroShots, enemies] = cbr as [
							number,
							ITimestampData<IStar[]>,
							ITimestampData<ISpaceShip>,
							ITimestampData<IHeroShot[]>,
							ITimestampData<IEnemy[]>,
						];

						return {
							refresh,
							stars,
							spaceShip,
							heroShots,
							enemies,
						};
					}),
					rxo.filter((game: any) => {
						return game.refresh === game.stars.timestamp
							&& game.refresh === game.spaceShip.timestamp
							&& game.refresh === game.heroShots.timestamp
							&& game.refresh === game.enemies.timestamp;
					}),
					rxo.sample(animation$),
					rxo.withLatestFrom(config$),
					rxo.map((cbr: any) => {
						const [game, config] = cbr;

						return {
							config,
							stars: game.stars.data,
							spaceShip: game.spaceShip.data,
							heroShots: game.heroShots.data,
							enemies: game.enemies.data,
						} as IGameContext;
					}),
					rxo.withLatestFrom(collision$),
					rxo.map(([game, collision]) => {
						processCollision(game, collision as Function);
						return game;
					}),
				);

			game$.subscribe((game: IGameContext) => {
				refreshDiagram(canvas, game);
			});

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

// let refreshCount: number = 0;
function refreshDiagram(canvas: HTMLCanvasElement, game: IGameContext) {
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	const { config, stars, spaceShip, heroShots, enemies } = game;

	diagram.clearDiagram(ctx, config);
	diagram.drawStars(ctx, config, stars);
	diagram.drawSpaceShip(ctx, config, spaceShip);
	diagram.drawHeroShots(ctx, config, heroShots);
	diagram.drawEnemies(ctx, config, enemies);
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