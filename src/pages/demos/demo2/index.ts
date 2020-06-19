import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

import { observer } from './../utils';

const duration = 30;

const source1$ = rx.interval(3000)
	.pipe(
		watch('source1$', duration),
		rxo.take(3),
	);

const refresh$ = rx.interval(1000)
	.pipe(
		watch('refresh$', duration),
		rxo.take(15),
	);

const game$ = refresh$.pipe(
	rxo.withLatestFrom(source1$),
	rxo.scan((acc, [refresh, current]) => {
		let data = acc[0] !== current
			? [...acc[1], current]
			: acc[1];

		data = r.filter(() => true)(data);

		return [current, data];
	}, [undefined, []]),
	watch('game$', duration),
	rxo.map(([c, arr]) => arr),
);


game$.subscribe(observer);
