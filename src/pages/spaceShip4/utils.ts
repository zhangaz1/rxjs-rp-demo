import * as r from 'ramda';

import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';

import {
	IPoint,
} from './interfaces';

export function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// export function scanner<T>(acc: T[], curt: T) {
// 	acc.push(curt);
// 	return acc;
// }

type scannerT = <T>(acc: T[], curt: T) => T[];
export const scanner = r.flip(r.append) as unknown as scannerT;

export function collision(minDistance: number, p1: IPoint, p2: IPoint) {
	return Math.abs(p1.x - p2.x) < minDistance
		&& Math.abs(p1.y - p2.y) < minDistance;
}


export function autoUnsubscribe<T>({ source$, next, error, complete, log }: {
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

	const ps = Promise.resolve(source$.subscribe(defaultObserver));

	function unsubscribe() {
		ps.then(subscription => subscription.unsubscribe());
	}
}

export function withTimestamp(source$: rx.Observable<object>) {
	return source$.pipe(
		rxo.timeInterval(),
		rxo.map(obj => r.mergeRight(obj.value, { interval: obj.interval })),
	);
}

export function toStoppable(source$: rx.Observable<object>, stop$$ = new rx.Subject()) {
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

export function withLatest(source$: rx.Observable<object>, withs: object) {
	const combineWiths$ = conbineLatests(withs);
	return source$.pipe(
		rxo.withLatestFrom(combineWiths$),
		rxo.map(([obj, withsValues]) => r.mergeRight(obj, withsValues as object)),
	);
}

export function conbineLatests(withs: any) {
	const streams = r.values(withs);
	return rx.combineLatest(streams)
		.pipe(
			rxo.map(values => r.zipObj(r.keys(withs) as string[], values)),
		);
}

export function toObject(source$: rx.Observable<any>): rx.Observable<object> {
	return source$.pipe(
		rxo.map(value => ({ value })),
	);
}