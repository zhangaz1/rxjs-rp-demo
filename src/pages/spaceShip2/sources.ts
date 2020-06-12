import * as rx from 'rxjs';
import * as rxo from 'rxjs/operators';
import { ISize } from './interfaces';

export function createWindowSizeStream(win: Window) {
	return rx.fromEvent(win, 'resize')
		.pipe(
			rxo.map((event: Event) => (event.target as Window)),
			rxo.startWith(win),
			rxo.map(getWinSize)
		);
}

function getWinSize(win: Window): ISize {
	return {
		width: win.innerWidth,
		height: win.innerHeight,
	};
}