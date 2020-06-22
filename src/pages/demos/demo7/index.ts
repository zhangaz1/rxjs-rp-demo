import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

import { observer } from '../utils';

const duration = 30;

const source1$ = rx.Observable.create(function subscribe(observer: rx.Observer<number>) {
	let unsb = false;

	try {
		if (!unsb) {
			observer.next(1);
		}
		if (!unsb) {
			observer.next(2);
		}
		if (!unsb) {
			observer.next(3);
		}
		if (!unsb) {
			observer.complete();
		}
	} catch (err) {
		observer.error(err);
	}

	return function unsubscribe(...params: any[]) {
		console.log('unsb:', params);
		unsb = true;
	}
}).pipe(
	watch('source1', duration),
);

// source1$.subscribe(observer);
const subscription: rx.SubscriptionLike = source1$.subscribe((n: number) => {
	console.log(n);
	subscription.unsubscribe();
});

console.log(subscription);