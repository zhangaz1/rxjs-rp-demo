import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	IEnemy,
	IEnemyShot,
} from './interfaces';
import { IConfig, IHeroShot } from '~pages/spaceShip2/interfaces';

export function createCollisionStream(refresh$: rx.Observable<number>) {
	return refresh$.pipe(
		rxo.map(
			n => ({
				enemies: [],
				enemiesShots: [],
			})
		),
	);
}

export function checkCollision(
	collision$: rx.Observable<{ enemies: IEnemy[]; enemieseShots: IEnemyShot[]; }>,
	config$: rx.Observable<IConfig>,
	enemies$: rx.Observable<rx.Observable<IEnemy>>,
	heroShots$: rx.Observable<rx.Observable<IHeroShot>>,
) {

}