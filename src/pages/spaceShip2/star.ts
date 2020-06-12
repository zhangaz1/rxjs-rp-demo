import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';
import { getRandomInt } from './utils';
import { IConfig, IStar } from './interfaces';

export function createStarsStream(refresh$: rx.Observable<number>, config: IConfig) {
	return rx.range(0, 256)
		.pipe(
			rxo.map(() => ({
				x: getRandomInt(0, config.width),
				y: getRandomInt(0, config.height),
			})),
			rxo.scan((stars, star) => {
				stars.push(star);
				return stars;
			}, [] as IStar[])
		);
}