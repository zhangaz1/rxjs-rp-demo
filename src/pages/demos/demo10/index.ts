import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

import { observer } from '../utils';

const duration = 30;

const source1$ = rx.of(1, 2, 3, 4, 5, rx.asyncScheduler) // rx.queueScheduler
	.pipe(
		watch('source1$', duration),
		rxo.filter(v => v % 2 === 0),
		watch('filter result', duration),
		rxo.take(5),
	);

source1$.subscribe(observer);
console.log('subscribe');