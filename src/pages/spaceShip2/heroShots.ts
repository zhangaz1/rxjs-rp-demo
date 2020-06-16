import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { scanner } from './utils';

import {
	IConfig,
	ISpaceShip,
	IHeroShot,
} from './interfaces';

export function createHeroShotsStream(canvas: HTMLCanvasElement, documentKeydonw$: rx.Observable<KeyboardEvent>, refresh$: rx.Observable<number>, config$: rx.Observable<IConfig>, spaceShip$: rx.Observable<ISpaceShip>) {
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
		rxo.scan(scanner, [] as IHeroShot[]),
		rxo.startWith([]),
	);

	const movingShots$ = refresh$.pipe(
		rxo.withLatestFrom(config$, shots$),
		rxo.map(moveShots),
	);

	return movingShots$;
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
		r.forEach((shot: IHeroShot) => {
			shot.y += config.heroShotSpeed;
		}),
		r.filter((shot: IHeroShot) => {
			return shot.y > 0;
		})
	)(shots);
}
