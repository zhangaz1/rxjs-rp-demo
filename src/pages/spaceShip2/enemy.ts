import * as r from 'ramda';
import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	getRandomInt,
	scanner,
} from './utils';

import { IConfig, IEnemy } from './interfaces';

export function createEnemiesStream(refresh$: rx.Observable<number>, config$: rx.Observable<IConfig>) {
	const enemySource$ = config$.pipe(
		rxo.map(config => rx.interval(config.enemyFreq)),
		rxo.switchAll(),
	);

	const enemies$ = enemySource$.pipe(
		rxo.withLatestFrom(config$),
		rxo.map(createEnemy),
		rxo.scan(scanner, [] as IEnemy[]),
	);

	const movingEnemies$ = refresh$.pipe(
		rxo.withLatestFrom(config$, enemies$),
		rxo.map(moveEnemies),
	);

	return movingEnemies$;
}

function moveEnemies(crb: any) {
	const [n, config, enemies] = crb as [number, IConfig, IEnemy[]];
	return r.forEach((enemy: IEnemy) => {
		enemy.y += config.enemySpeed;
		enemy.x += getRandomInt(-config.enemyWidthRange, config.enemyWidthRange);
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
	};
}