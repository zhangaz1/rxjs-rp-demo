import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { IConfig, IStar, ITimestampData } from './interfaces';

import {
	getRandomInt,
	scanner,
	autoUnsubscribe,
	toStoppable,
	withLatest,
} from './utils';

export function createStarsStream(refresh$: rx.Observable<any>) {
	return refresh$.pipe(
		rxo.map(({ config }) => config.stars),
		rxo.distinctUntilChanged(),
		rxo.map(createStars),
		rxo.startWith(null),
		rxo.pairwise(),
		// rxo.take(3),
	);

	function createStars(n: number) {
		const stop$$ = new rx.Subject();
		return {
			stars$: rx.range(0, n).pipe(
				rxo.map(
					n => toStoppable(refresh$, stop$$).pipe(
						rxo.map((ctx: any) => {
							ctx.star = createStar(ctx.config);
							return ctx;
						}),
						rxo.scan(
							(last: { star: { y: number } }, current) => {
								current.star = last
									? r.mergeRight(last.star, { y: moveStarY(last, current) })
									: createStar(current.config);
								return current;
							},
							null
						),
						// rxo.take(3))
					),
					rxo.take(1),
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

function moveStarY(last, current) {
	return (last.star.y + current.config.starSpeed) % current.config.height;
}

export function drawStars(starsSource$: rx.Observable<any>, drawStar: (star: IStar) => void) {
	autoUnsubscribe({
		source$: starsSource$,
		next: ([old, { stars$ }]) => {
			if (old) {
				old.stop();
			}

			stars$.subscribe(star$ => star$.subscribe(ctx => {
				drawStar(ctx.star);
			}));
		},
	});
}