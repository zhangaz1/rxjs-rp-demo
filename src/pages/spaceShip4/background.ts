import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	IConfig,
} from './interfaces';

import {
	autoUnsubscribe,
} from './utils';

export function createBackgroundStream(refresh$: rx.Observable<number>) {
	return refresh$;
}

export function drawBackground(source$: rx.Observable<any>, config$: rx.Observable<IConfig>, drawBackground: (config: IConfig) => void) {
	autoUnsubscribe({
		source$: source$.pipe(
			rxo.withLatestFrom(config$),
			rxo.map(([n, config]) => config),
		),
		next: drawBackground,
	});
}