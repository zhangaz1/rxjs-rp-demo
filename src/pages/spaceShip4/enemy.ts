import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	getRandomInt,
	scanner,
} from './utils';

import { IConfig, IEnemy, ITimestampData, IEnemyShot } from './interfaces';
import { autoUnsubscribe } from '~pages/spaceShip3/utils';

export function createEnemiesStream(
	refresh$: rx.Observable<number>,
	gameStop$$: rx.Observable<any>,
	config$: rx.Observable<IConfig>
) {
	const enemySource$ = config$.pipe(
		rxo.map((config: IConfig) => rx.interval(config.enemyFreq)),
		rxo.switchAll(),
		rxo.take(3),// for temp test
		rxo.takeUntil(gameStop$$),
		rxo.map(createEnemyStream),
	);

	return enemySource$;


	function createEnemyStream() {
		const enemyStop$$ = new rx.Subject();
		return refresh$.pipe(
			rxo.takeUntil(enemyStop$$),
			rxo.withLatestFrom(config$),
			rxo.scan(
				(last: IEnemy | null, [n, config]) => last
					? r.mergeRight(last, {
						x: (last.x + getRandomInt(-config.enemyWidthRange, config.enemyWidthRange)) % config.width,
						y: (last.y + config.enemySpeed) % config.height
					})
					: createEnemy(config, enemyStop$$),
				null
			),
		) as rx.Observable<IEnemy>;
	}

	function createEnemy(config: IConfig, enemyStop$$: rx.Subject<void>): IEnemy {
		return {
			x: getRandomInt(0, config.width),
			y: 0,
			isDead: false,
			stop: () => {
				enemyStop$$.next();
				enemyStop$$.complete();
			},
			config,
		};
	}
}



export function drawEnemies(
	enemiesSource$: rx.Observable<rx.Observable<IEnemy>>,
	drawEnemy: (config: IConfig, enemy: IEnemy) => void
) {
	autoUnsubscribe({
		source$: enemiesSource$,
		next: enemy$ => autoUnsubscribe({
			source$: enemy$,
			next: enemy => drawEnemy(enemy.config as IConfig, enemy),
		}),
	});
}