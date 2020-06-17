import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { scanner } from './utils';

import {
	IPoint,
	IConfig,
	ISpaceShip,
	IHeroShot,
	IEnemy,
} from './interfaces';

export function createHeroShotsStream(
	canvas: HTMLCanvasElement,
	documentKeydonw$: rx.Observable<KeyboardEvent>,
	refresh$: rx.Observable<number>,
	config$: rx.Observable<IConfig>,
	spaceShip$: rx.Observable<ISpaceShip>,
	enemies$: rx.Observable<IEnemy[]>,
	collision$: rx.Observable<(p1: IPoint, p2: IPoint) => boolean>
) {
	const shotSample$ = config$.pipe(
		rxo.map((config: IConfig) => rx.interval(config.heroShotLimit)),
		rxo.switchAll(),
	);

	const shotSources$ = rx.merge(
		rx.fromEvent(canvas, 'click'),
		documentKeydonw$.pipe(
			rxo.filter((event: KeyboardEvent) => event.keyCode === 32),
		)
	).pipe(
		rxo.sample(shotSample$),
	);

	const shots$ = shotSources$.pipe(
		rxo.withLatestFrom(config$, spaceShip$),
		rxo.map(createHeroShot),
		rxo.scan(function (shots: IHeroShot[], shot: IHeroShot) {
			shots.push(shot);
			return r.filter((shot: IHeroShot) => shot.y > 0)(shots);
		}, [] as IHeroShot[]),
		rxo.startWith([]),
		rxo.share(),
	);

	const movingShots$ = refresh$.pipe(
		rxo.withLatestFrom(config$, shots$),
		rxo.map(moveShots),

		rxo.withLatestFrom(collision$, enemies$),
		rxo.map(processCollision),
	);

	return movingShots$;
}

function processCollision(cbr: any) {
	const [shots, collision, enemies] = cbr as [IHeroShot[], (p1: IPoint, p2: IPoint) => boolean, IEnemy[]];
	return r.forEach((shot: IHeroShot) => {
		if (shot.y < 0) {
			return;
		}
		const enemy: IEnemy | undefined = r.find((enemy: IEnemy) => {
			return !enemy.isDead
				&& collision(shot as IPoint, enemy as IPoint);
		})(enemies);

		if (enemy) {
			shot.y = -10;
			enemy.isDead = true;
		}
	})(shots);
}

function createHeroShot(cbr: any) {
	const [event, config, spaceShip] = cbr as [Event, IConfig, ISpaceShip];
	return {
		x: spaceShip.x,
		y: spaceShip.y,
	};
}

function moveShots(cbr: any) {
	const [n, config, shots] = cbr as [number, IConfig, IHeroShot[]];
	return r.pipe(
		r.filter((shot: IHeroShot) => shot.y > 0),
		r.forEach((shot: IHeroShot) => shot.y += config.heroShotSpeed)
	)(shots);
}