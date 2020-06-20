import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	IConfig,
	ISpaceShip,
	IHeroShot,
	ITimestampData,
} from './interfaces';

export function createHeroShotsStream(
	canvas: HTMLCanvasElement,
	documentKeydonw$: rx.Observable<KeyboardEvent>,
	refresh$: rx.Observable<number>,
	config$: rx.Observable<IConfig>,
	spaceShip$: rx.Observable<ITimestampData<ISpaceShip>>,
): rx.Observable<ITimestampData<IHeroShot[]>> {
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
		rxo.withLatestFrom(spaceShip$),
		rxo.map(createHeroShot),
	);

	const visable = r.filter((shot: IHeroShot) => shot.y > 0);
	const shots$ = shotSources$
		.pipe(
			rxo.buffer(refresh$),
			rxo.scan((preShots: IHeroShot[], newShots: IHeroShot[]) => {
				return visable([...preShots, ...newShots]);
			}, [] as IHeroShot[]),
			rxo.startWith([]),
		);

	const movingShots$ = shots$.pipe(
		rxo.withLatestFrom(config$, shots$),
		rxo.map(moveShots),
	);

	const withTimestamp$ = refresh$.pipe(
		rxo.withLatestFrom(movingShots$),
		rxo.map(([refresh, shots]) => ({
			timestamp: refresh,
			data: shots,
		} as ITimestampData<IHeroShot[]>)),
	);

	return withTimestamp$.pipe(rxo.share());
}

function createHeroShot(cbr: any) {
	const [event, { data: spaceShip }] = cbr as [Event, ITimestampData<ISpaceShip>];
	return {
		x: spaceShip.x,
		y: spaceShip.y,
	};
}

function moveShots(cbr: any) {
	const [n, config, shots] = cbr as [number, IConfig, IHeroShot[]];
	return r.forEach((shot: IHeroShot) => shot.y += config.heroShotSpeed)(shots);
}