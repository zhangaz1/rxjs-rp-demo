import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

import { observer } from '../utils';

const duration = 30;

const source1$ = rx.interval(1000)
	.pipe(
		watch('source1$', duration),
		rxo.share(),
	);

const source2$ = source1$.pipe(
	rxo.filter(v => v % 2 === 0),
	watch('filter result', duration),
	rxo.take(5),
);

source2$.subscribe(observer);
source2$.subscribe(observer);
source1$.subscribe(observer);