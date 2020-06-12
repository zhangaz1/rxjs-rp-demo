import { IConfig } from './interfaces';
import * as rx from 'rxjs';

export function createStarsStream(refresh$: rx.Observable<number>, config: IConfig) {
	return rx.range(0, config.stars);
}