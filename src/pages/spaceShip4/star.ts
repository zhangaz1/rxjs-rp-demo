import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	IConfig,
	IStar,
} from './interfaces';

import {
	getRandomInt,
	autoUnsubscribe,
} from './utils';

export function createStarsStream(
	refresh$: rx.Observable<number>,
	config$: rx.Observable<IConfig>
) {
	return config$.pipe(
		rxo.map(config => config.stars),
		rxo.map(createStars),
		rxo.startWith(null),
		rxo.pairwise(),
	);

	function createStars(n: number) {
		const stopStars$$ = new rx.Subject();
		return {
			stars$: rx.range(0, n).pipe(
				rxo.map(
					n => refresh$.pipe(
						rxo.takeUntil(stopStars$$),
						rxo.withLatestFrom(config$),
						rxo.scan(
							(last: IStar | null, [interval, config]) =>
								last
									? r.mergeRight(last, { y: moveStarY(last, config) })
									: createStar(config),
							null
						),
					),
				),
			),
			stop: () => {
				stopStars$$.next();
				stopStars$$.complete();
			}
		};
	}

	function createStar(config: IConfig): IStar {
		return {
			x: getRandomInt(0, config.width),
			y: getRandomInt(0, config.height),
			width: getRandomInt(1, config.starSize),
			height: getRandomInt(1, config.starSize),
		};
	}
}

function moveStarY(last: IStar, config: IConfig) {
	return (last.y + config.starSpeed) % config.height;
}

export function drawStars(
	starsSource$: rx.Observable<any>,
	drawStar: (star: IStar) => void
) {
	autoUnsubscribe({
		source$: starsSource$,
		next: ([old, { stars$ }]) => {
			if (old) {
				old.stop();
			}

			stars$.subscribe((star$: rx.Observable<IStar>) => star$.subscribe(drawStar));
		},
	});
}