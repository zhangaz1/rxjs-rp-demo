import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	getRandomInt,
	scanner,
} from './utils';

import { IConfig, IEnemy, ITimestampData, IEnemyShot } from './interfaces';

const isDead = r.propEq('isDead', true);
const isAlive = r.complement(isDead);
// @ts-ignore
const hasShots = r.compose(r.lt(0), r.prop('length'), r.prop('shotsBuffer'));
const hasNoShots = r.complement(hasShots);
const canDestroy = r.both(isDead, hasNoShots);
const shouldKeep = r.complement(canDestroy);

export function createEnemiesStream(refresh$: rx.Observable<number>, config$: rx.Observable<IConfig>): rx.Observable<ITimestampData<IEnemy[]>> {
	const enemySource$ = config$.pipe(
		rxo.map(config => rx.interval(config.enemyFreq)),
		rxo.switchAll(),
		rxo.withLatestFrom(config$),
		rxo.map(createEnemy),
		rxo.share(),
	);

	const enemies$ = refresh$.pipe(
		rxo.withLatestFrom(
			enemySource$.pipe(
				rxo.buffer(refresh$)
			)
		),
		// @ts-ignore
		rxo.scan((preEnemies: IEnemy[], [refresh, newEnemies]) => r.filter(shouldKeep)([...preEnemies, ...newEnemies]), []),
	);

	const enemiesForShots$ = enemySource$.pipe(
		rxo.scan((enemies: IEnemy[], enemy: IEnemy) => [...enemies, enemy], []),
	);

	const enemiesWithShots$ = config$.pipe(
		rxo.map(config => rx.interval(config.enemyShotFreq)),
		rxo.switchAll(),
		rxo.withLatestFrom(enemiesForShots$),
		rxo.map(([n, enemies]) => {
			return r.forEach((enemy: IEnemy) => {
				if (isAlive(enemy)) {
					enemy.shotsBuffer.push({
						x: enemy.x,
						y: enemy.y,
					});
				}
			})(enemies as IEnemy[]);
		}),
	);

	const movingEnemiesShots$ = refresh$.pipe(
		rxo.withLatestFrom(config$, enemiesWithShots$),
		rxo.map((crb: any) => {
			const [refresh, config, enemies] = crb as [number, IConfig, IEnemy[]];
			return r.forEach((enemy: IEnemy) => {
				const transducer = r.pipe(
					r.map((enemyShot: IEnemyShot) => {
						enemyShot.y += config.enemyShotSpeed;
						return enemyShot;
					}),
					r.filter((enemyShot: IEnemyShot) => enemyShot.y < config.height)
				);

				// @ts-ignore
				enemy.shotsBuffer = r.transduce(transducer, r.flip(r.append), [] as IEnemyShot[], enemy.shotsBuffer);

			})(enemies);
		}),
	);

	const movingEnemies$ = enemies$.pipe(
		rxo.withLatestFrom(movingEnemiesShots$, config$),
		rxo.map(moveEnemies),
	);

	const withTimestamp$ = refresh$.pipe(
		rxo.withLatestFrom(movingEnemies$),
		rxo.map((cbr: any) => {
			const [refresh, enemies] = cbr as [number, IEnemy[]];
			return {
				timestamp: refresh,
				data: enemies,
			}
		}),
	);

	return withTimestamp$.pipe(rxo.share());
}

function moveEnemies(crb: any) {
	const [enemies, enemies2, config] = crb as [IEnemy[], IEnemy[], IConfig];
	return r.forEach((enemy: IEnemy) => {
		enemy.shots = [...enemy.shotsBuffer];

		if (isAlive(enemy)) {
			enemy.y += config.enemySpeed;
			enemy.x += getRandomInt(-config.enemyWidthRange, config.enemyWidthRange);

			if (enemy.x < 0) {
				enemy.x += config.width;
			}
			if (enemy.x > config.width) {
				enemy.x -= config.width;
			}
			if (enemy.y > config.height) {
				enemy.y -= config.height;
			}
		}
	})(enemies);
}

function createEnemy(crb: any): IEnemy {
	const [n, config] = crb as [number, IConfig];
	return {
		x: getRandomInt(0, config.width),
		y: 0,
		isDead: false,
		shots: [],
		shotsBuffer: [],
	};
}