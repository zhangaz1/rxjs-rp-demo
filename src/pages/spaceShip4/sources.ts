import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';
import { ISize } from './interfaces';

export function createDocumentKeydownStream(win: Window) {
	return rx.fromEvent(win.document, 'keydown');
};

export function createWindowSizeStream(refresh$: rx.Observable<any>, gameStop$$: rx.Observable<any>, win: Window) {
	const winSize$$ = new rx.BehaviorSubject(getWinSize(win));

	rx.fromEvent(win, 'resize')
		.pipe(
			rxo.takeUntil(gameStop$$),
			rxo.sample(refresh$),
			rxo.map((event: Event) => (event.target as Window)),
			rxo.map(getWinSize),
			rxo.distinctUntilChanged(
				(last, current) => {
					return last.width === current.width
						&& last.height === current.height;
				}
			),
		).subscribe(winSize$$);

	return winSize$$;
};

function getWinSize(win: Window): ISize {
	return {
		width: win.innerWidth,
		height: win.innerHeight,
	};
}