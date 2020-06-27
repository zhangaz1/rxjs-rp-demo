import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';
import { ISize } from './interfaces';

export function createDocumentKeydownStream(win: Window) {
	return rx.fromEvent(win.document, 'keydown');
};

export function createWindowSizeStream(refresh$: rx.Observable<any>, win: Window) {
	return rx.fromEvent(win, 'resize')
		.pipe(
			rxo.map((event: Event) => (event.target as Window)),
			rxo.startWith(win),
			rxo.map(getWinSize),
			rxo.sample(refresh$),
			rxo.distinctUntilChanged((last, current) => {
				return last.width === current.width
					&& last.height === current.height;
			}),
			rxo.share(),
		);
};

function getWinSize(win: Window): ISize {
	return {
		width: win.innerWidth,
		height: win.innerHeight,
	};
}