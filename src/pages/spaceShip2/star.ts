import * as r from 'ramda';
import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';
import {
	getRandomInt,
	scanner,
} from './utils';
import { IConfig, IStar, ITimestampData } from './interfaces';

export function createStarsStream(refresh$: rx.Observable<number>, config$: rx.Observable<IConfig>): rx.Observable<ITimestampData<IStar[]>> {
	const starNumber$ = rx.range(0, 256)
		.pipe(
			rxo.scan(scanner, [] as number[]),
		);

	const star$ = starNumber$.pipe(
		rxo.withLatestFrom(config$),
		rxo.map(createStars),
	);

	const movingStars = refresh$.pipe(
		rxo.withLatestFrom(config$, star$),
		rxo.map(moveStars)
	);

	const withTimestamp$ = movingStars.pipe(
		rxo.withLatestFrom(refresh$),
		rxo.map(([stars, refresh]) => ({
			timestamp: refresh as number,
			data: stars,
		})),
	);

	return withTimestamp$.pipe(rxo.share());
}

function moveStars(cbr: any) {
	const [refresh, config, stars] = cbr as [number, IConfig, IStar[]];
	return r.map((star: IStar) => {
		star.y += config.starSpeed;
		if (star.y > config.height) {
			star.y -= config.height;
		}
		return star;
	})(stars);
}

function createStars(cbr: any) {
	const [stars, config] = cbr as [number[], IConfig];
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