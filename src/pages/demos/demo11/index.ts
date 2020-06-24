import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

import { observer } from '../utils';

const duration = 30;

let stop$$ = new rx.Subject();

let source1$ = rx.interval(1000)
	.pipe(
		// watch('source1$', duration),
		rxo.takeUntil(stop$$),
	);

let subscription = source1$.subscribe(observer);

rx.fromEvent(document, 'click')
	.subscribe(() => {
		if (stop$$) {
			stop$$.next();
			stop$$.complete();
			subscription.unsubscribe();

			clear();
		}
	});

function clear() {
	stop$$ = null;
	subscription = null;
	source1$ = null;
}