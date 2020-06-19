import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

import { observer } from './../utils';

const duration = 30;

const source$ = rx.interval(1000)
	.pipe(
		watch('interval(1000)', duration),
		rxo.filter(v => v % 2 === 0),
		watch('filter result', duration),
		rxo.take(5),
		watch('take(5)', duration),
	);

source$.subscribe(observer);

setTimeout(() => source$.subscribe(observer), 5000);