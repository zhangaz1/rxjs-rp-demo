import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

import { observer } from '../utils';

const duration = 30;

const source1$ = new rx.Subject();

const subscription1 = source1$.pipe(
	watch('source1', duration),
).subscribe(observer);

// const subscription2 = source1$.pipe(
// 	watch('source1-2', duration),
// ).subscribe(observer);


const source0$ = rx.interval(1000)
	.pipe(
		rxo.take(6),
		watch('source0$', duration),
	);

source0$.subscribe(source1$);


setTimeout(() => subscription1.unsubscribe(), 3000);