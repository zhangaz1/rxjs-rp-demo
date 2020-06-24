import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import { watch } from 'rxjs-watcher';

import { observer } from '../utils';

const duration = 30;

let refresh$ = rx.interval(1000);

let canvas$ = rx.interval(500).pipe(
	rxo.map(() => ({ name: 'canvas', size: { height: 100, width: 150, } }))
);
let config$ = rx.interval(700).pipe(
	rxo.map(() => ({ speed: 50, size: { height: 500, width: 700 } })),
);

let source1$ = r.pipe(
	toObject,
	createStoppable,
	withTimestamp,
	r.partialRight(withLatest, [{ canvas: canvas$, config: config$ }])
)(refresh$);

let shot$ = createShotStream(source1$);

autoUnsubscribe({ source$: shot$ });

function autoUnsubscribe<T>({ source$, next, error, complete, log }: {
	source$: rx.Observable<T>,
	next?: (t: T) => void,
	error?: (err: any) => void,
	complete?: () => void,
	log?: (msg: any) => void,
}) {
	log = (log || console.log);

	const defaultObserver = {
		next: next || log,
		error: (err: any) => {
			// @ts-ignore
			(error || log)(err);
			unsubscribe();
		},
		complete: () => {
			// @ts-ignore
			(complete || log)('compelete');
			unsubscribe();
		},
	};

	const subscription = source$.subscribe(defaultObserver);

	function unsubscribe() {
		setTimeout(() => subscription.unsubscribe(), 0);
	}
}


function createShotStream(source$: rx.Observable<object>) {
	return source$.pipe(
		rxo.scan((acc, obj: any) => {
			let value = acc.value;

			obj.value = {
				x: value.x,
				y: value.y + obj.config.speed,
			};
			return obj;
		}, { value: { x: 100, y: 100, } }),
		rxo.takeWhile((o: any) => {
			if (o.value.y > o.config.size.height) {
				o.stop();
				return false;
			}
			return true;
		}),
	);
}

function withTimestamp(source$: rx.Observable<object>) {
	return source$.pipe(
		rxo.timeInterval(),
		rxo.map(obj => r.mergeRight(obj.value, { interval: obj.interval })),
	);
}

function createStoppable(source$: rx.Observable<object>) {
	const stop$$ = new rx.Subject();
	return source$.pipe(
		rxo.takeUntil(stop$$),
		rxo.map(
			(obj: any) => r.mergeRight(obj, {
				stop: () => {
					stop$$.next();
					stop$$.complete();
				}
			})
		),
	);
}

function withLatest(source$: rx.Observable<object>, withs: object) {
	const combineWiths$ = conbineLatests(withs);
	return source$.pipe(
		rxo.withLatestFrom(combineWiths$),
		rxo.map(([obj, withsValues]) => r.mergeRight(obj, withsValues as object)),
	);
}

function conbineLatests(withs: any) {
	const streams = r.values(withs);
	return rx.combineLatest(streams)
		.pipe(
			rxo.map(values => r.zipObj(r.keys(withs) as string[], values)),
		);
}

function toObject(source$: rx.Observable<any>): rx.Observable<object> {
	return source$.pipe(
		rxo.map(value => ({ value })),
	);
}