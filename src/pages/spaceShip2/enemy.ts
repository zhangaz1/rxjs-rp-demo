import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	getRandomInt,
	scanner,
} from './utils';

import { IConfig, IEnemy, ITimestampData } from './interfaces';

export function createEnemiesStream(refresh$: rx.Observable<number>, config$: rx.Observable<IConfig>): rx.Observable<ITimestampData<IEnemy[]>> {
	const enemySource$ = config$.pipe(
		rxo.map(config => rx.interval(config.enemyFreq)),
		rxo.switchAll(),
		rxo.withLatestFrom(config$),
		rxo.map(createEnemy),
	);

	const alive = r.filter(r.propEq('isDead', false));
	const enemies = enemySource$.pipe(
		rxo.buffer(refresh$),
		rxo.scan((preEnemies: IEnemy[], newEnemies: IEnemy[]) => {
			return alive([...preEnemies, ...newEnemies]);
		}, []),
	);

	const movingEnemies$ = enemies.pipe(
		rxo.withLatestFrom(config$),
		rxo.map(moveEnemies),
	);

	const withTimestamp = refresh$.pipe(
		rxo.withLatestFrom(movingEnemies$),
		rxo.map((cbr: any) => {
			const [refresh, enemies] = cbr as [number, IEnemy[]];
			return {
				timestamp: refresh,
				data: enemies,
			}
		}),
	);

	return withTimestamp.pipe(rxo.share());
}

function moveEnemies(crb: any) {
	const [enemies, config] = crb as [IEnemy[], IConfig];
	return r.forEach((enemy: IEnemy) => {
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
	})(enemies);
}

function createEnemy(crb: any) {
	const [n, config] = crb as [number, IConfig];
	return {
		x: getRandomInt(0, config.width),
		y: 0,
		isDead: false,
	};
}