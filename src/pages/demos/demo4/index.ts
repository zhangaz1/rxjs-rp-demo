import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

import { observer } from '../utils';

const duration = 30;

const source1$ = rx.interval(1000).pipe(
	watch('source1$', duration),
	rxo.take(5),
);

const source2$ = rx.interval(1500).pipe(
	watch('source2', duration),
	rxo.take(3),
);

const game$ = rx.combineLatest(source1$, source2$).pipe(
	watch('game$', duration),
);

game$.subscribe(observer);