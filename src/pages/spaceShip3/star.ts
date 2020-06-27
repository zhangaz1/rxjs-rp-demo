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
	toStoppable,
} from './utils';

export function createStarsStream(refresh$: rx.Observable<{ config: IConfig }>, config$: rx.Observable<IConfig>) {
	return config$.pipe(
		rxo.map(config => config.stars),
		rxo.map(createStars),
		rxo.startWith(null),
		rxo.pairwise(),
	);

	function createStars(n: number) {
		const stop$$ = new rx.Subject();
		return {
			stars$: rx.range(0, n).pipe(
				rxo.map(
					n => toStoppable(refresh$, stop$$).pipe(
						rxo.scan(
							(last: { star: IStar }, current: { star: IStar, config: IConfig }) => {
								current.star = last
									? r.mergeRight(last.star, { y: moveStarY(last, current) })
									: createStar(current.config);
								return current;
							},
							null
						),
					),
				),
			),
			stop: () => {
				stop$$.next();
				stop$$.complete();
			}
		};
	}

	function createStar(config: IConfig) {
		return {
			x: getRandomInt(0, config.width),
			y: getRandomInt(0, config.height),
			width: getRandomInt(1, config.starSize),
			height: getRandomInt(1, config.starSize),
		};
	}
}

function moveStarY(last: { star: IStar }, current: { config: IConfig }) {
	return (last.star.y + current.config.starSpeed) % current.config.height;
}

export function drawStars(starsSource$: rx.Observable<any>, drawStar: (star: IStar) => void) {
	autoUnsubscribe({
		source$: starsSource$,
		next: ([old, { stars$ }]) => {
			if (old) {
				old.stop();
			}

			stars$.subscribe((star$: rx.Observable<{ star: IStar }>) =>
				star$.pipe(
					rxo.map((ctx) => ctx.star)
				)
					.subscribe(drawStar)
			);
		},
	});
}