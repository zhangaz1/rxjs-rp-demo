import * as r from 'ramda';
import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';
import { getRandomInt } from './utils';
import { IConfig, IStar } from './interfaces';

export function createStarsStream(refresh$: rx.Observable<number>, config$: rx.Observable<IConfig>) {
	const starNumber$ = rx.range(0, 256)
		.pipe(
			// @ts-ignore
			rxo.scan(r.flip(r.append), [] as number[])
		);

	const star$ = rx.combineLatest(starNumber$, config$)
		.pipe(
			// @ts-ignore
			rxo.map(createStars),
		);

	return star$;
}

function createStars(cbr: [number[], IConfig]) {
	const [stars, config] = cbr;
	return r.map(r.partial(createStar, [config]))(stars);
}

function createStar(config: IConfig) {
	return {
		x: getRandomInt(0, config.width),
		y: getRandomInt(0, config.height),
		width: getRandomInt(1, config.starSize),
		height: getRandomInt(1, config.starSize),
	};
}