import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	IConfig,
	ISpaceShip,
	IHeroShot,
} from './interfaces';
import { autoUnsubscribe } from '~pages/spaceShip3/utils';

export function createHeroShotsStream(
	canvas: HTMLCanvasElement,
	documentKeydonw$: rx.Observable<KeyboardEvent>,
	refresh$: rx.Observable<number>,
	config$: rx.Observable<IConfig>,
	gameStop$$: rx.Subject<void>,
	spaceShip$: rx.Observable<ISpaceShip>,
) {
	const shotSample$ = config$.pipe(
		rxo.map(config => rx.interval(config.heroShotLimit)),
		rxo.switchAll(),
	);

	const shotsSources$ = rx.merge(
		rx.fromEvent(canvas, 'click'),
		documentKeydonw$.pipe(
			rxo.filter((event: KeyboardEvent) => event.keyCode === 32),
		)
	).pipe(
		rxo.takeUntil(gameStop$$),
		rxo.sample(shotSample$),
		rxo.map(createHeroShotStream),
	);

	return shotsSources$;

	function createHeroShotStream() {
		const heroShotStop$$ = new rx.Subject();

		return refresh$.pipe(
			rxo.takeUntil(heroShotStop$$),
			rxo.withLatestFrom(spaceShip$, config$),
			rxo.scan(
				(last: IHeroShot | null, [n, spaceShip, config]) => {
					const current = last
						? r.mergeRight(last, { y: last.y + config.heroShotSpeed })
						: createHeroShot(spaceShip, config, heroShotStop$$);
					if (current.y < 0) {
						current.stop();
					}
					return current;
				},
				null
			) ,
		) as rx.Observable<IHeroShot>;
	}

	function createHeroShot(spaceShip: ISpaceShip, config: IConfig, heroShotStop$$: rx.Subject<void>) {
		return {
			x: spaceShip.x,
			y: spaceShip.y,
			config,
			stop: () => {
				heroShotStop$$.next();
				heroShotStop$$.complete();
			}
		} as IHeroShot;
	}

}

export function drawHeroShots(
	heroShots$: rx.Observable<rx.Observable<IHeroShot>>,
	drawHeroShot: (config: IConfig, heroShot: IHeroShot) => void
) {
	autoUnsubscribe({
		source$: heroShots$,
		next: heroShot$ => autoUnsubscribe({
			source$: heroShot$,
			next: heroShot => drawHeroShot(heroShot.config as IConfig, heroShot),
		}),
	});
}